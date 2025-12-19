const { v4: uuidv4 } = require('uuid');
const Transaction = require('../models/transaction.model');
const fs = require('fs');
const path = require('path');
const sharedPath = fs.existsSync('/app/shared') ? '/app/shared' : path.join(__dirname, '../../../../shared');
const { AppError, catchAsync } = require(`${sharedPath}/errorHandler`);
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

exports.createPayment = catchAsync(async (req, res, next) => {
  const { orderId, userId, amount, currency = 'usd', paymentMethod, idempotencyKey } = req.body;

  if (idempotencyKey) {
    const existing = await Transaction.findOne({ idempotencyKey });
    if (existing) {
      return res.json({ status: 'success', data: { transaction: existing } });
    }
  }

  const transactionId = `txn_${uuidv4()}`;

  let stripePaymentIntent = null;
  let status = 'pending';
  let errorMessage = null;

  try {
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
      stripePaymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        metadata: { orderId, userId, transactionId }
      });
      status = 'processing';
    } else {
      status = 'succeeded';
    }
  } catch (err) {
    status = 'failed';
    errorMessage = err.message;
  }

  const transaction = await Transaction.create({
    transactionId,
    orderId,
    userId,
    amount,
    currency,
    status,
    paymentMethod,
    stripePaymentIntentId: stripePaymentIntent?.id,
    idempotencyKey,
    errorMessage
  });

  res.status(201).json({
    status: 'success',
    data: {
      transaction,
      clientSecret: stripePaymentIntent?.client_secret
    }
  });
});

exports.getPayment = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.findOne({ transactionId: req.params.id });
  if (!transaction) {
    return next(new AppError('Transaction not found', 404));
  }
  res.json({ status: 'success', data: { transaction } });
});

exports.getUserPayments = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [transactions, total] = await Promise.all([
    Transaction.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Transaction.countDocuments({ userId })
  ]);

  res.json({
    status: 'success',
    data: {
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

exports.refund = catchAsync(async (req, res, next) => {
  const { amount, reason } = req.body;
  const transaction = await Transaction.findOne({ transactionId: req.params.id });
  
  if (!transaction) {
    return next(new AppError('Transaction not found', 404));
  }

  if (transaction.status !== 'succeeded') {
    return next(new AppError('Can only refund succeeded payments', 400));
  }

  const refundAmount = amount || transaction.amount - transaction.refundedAmount;
  if (refundAmount > transaction.amount - transaction.refundedAmount) {
    return next(new AppError('Refund amount exceeds available amount', 400));
  }

  let refundId = `ref_${uuidv4()}`;

  if (transaction.stripePaymentIntentId && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: transaction.stripePaymentIntentId,
        amount: Math.round(refundAmount * 100)
      });
      refundId = refund.id;
    } catch (err) {
      return next(new AppError(`Refund failed: ${err.message}`, 400));
    }
  }

  transaction.refundedAmount += refundAmount;
  transaction.refunds.push({ refundId, amount: refundAmount, reason });
  transaction.status = transaction.refundedAmount >= transaction.amount ? 'refunded' : 'partially_refunded';
  await transaction.save();

  res.json({ status: 'success', data: { transaction } });
});

exports.confirmPayment = catchAsync(async (req, res, next) => {
  const { stripePaymentIntentId } = req.body;
  
  const transaction = await Transaction.findOne({ stripePaymentIntentId });
  if (!transaction) {
    return next(new AppError('Transaction not found', 404));
  }

  if (process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
    const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
    transaction.status = paymentIntent.status === 'succeeded' ? 'succeeded' : 'failed';
    if (paymentIntent.latest_charge) {
      const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
      transaction.stripeChargeId = charge.id;
      transaction.cardLast4 = charge.payment_method_details?.card?.last4;
      transaction.cardBrand = charge.payment_method_details?.card?.brand;
    }
  } else {
    transaction.status = 'succeeded';
  }

  await transaction.save();
  res.json({ status: 'success', data: { transaction } });
});

exports.webhook = catchAsync(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    await Transaction.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { status: 'succeeded' }
    );
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    await Transaction.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { status: 'failed', errorMessage: paymentIntent.last_payment_error?.message }
    );
  }

  res.json({ received: true });
});

