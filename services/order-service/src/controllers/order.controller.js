const Order = require('../models/order.model');
const fs = require('fs');
const path = require('path');
const sharedPath = fs.existsSync('/app/shared') ? '/app/shared' : path.join(__dirname, '../../../../shared');
const { AppError, catchAsync } = require(`${sharedPath}/errorHandler`);

exports.createOrder = catchAsync(async (req, res, next) => {
  const { userId, items, shippingAddress, billingAddress, paymentMethod } = req.body;

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const shippingCost = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shippingCost;

  const order = await Order.create({
    userId,
    items,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    subtotal,
    tax,
    shippingCost,
    total,
    paymentMethod
  });

  res.status(201).json({ status: 'success', data: { order } });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }
  res.json({ status: 'success', data: { order } });
});

exports.getOrderByNumber = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber });
  if (!order) {
    return next(new AppError('Order not found', 404));
  }
  res.json({ status: 'success', data: { order } });
});

exports.getUserOrders = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { page = 1, limit = 10, status } = req.query;

  const filter = { userId };
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Order.countDocuments(filter)
  ]);

  res.json({
    status: 'success',
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  try {
    order.updateStatus(status);
    await order.save();
  } catch (err) {
    return next(new AppError(err.message, 400));
  }

  res.json({ status: 'success', data: { order } });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (!order.canCancel()) {
    return next(new AppError('Order cannot be cancelled at this stage', 400));
  }

  order.status = 'cancelled';
  order.cancelReason = reason;
  await order.save();

  res.json({ status: 'success', data: { order } });
});

exports.updatePaymentStatus = catchAsync(async (req, res, next) => {
  const { paymentId, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  order.paymentId = paymentId;
  order.paymentStatus = paymentStatus;
  
  if (paymentStatus === 'paid') {
    order.status = 'confirmed';
  } else if (paymentStatus === 'failed') {
    order.status = 'pending';
  }
  
  await order.save();
  res.json({ status: 'success', data: { order } });
});

exports.updateTracking = catchAsync(async (req, res, next) => {
  const { carrier, trackingNumber, estimatedDelivery, trackingUpdate } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (carrier) order.tracking.carrier = carrier;
  if (trackingNumber) order.tracking.trackingNumber = trackingNumber;
  if (estimatedDelivery) order.tracking.estimatedDelivery = new Date(estimatedDelivery);
  if (trackingUpdate) {
    order.tracking.history.push(trackingUpdate);
  }

  await order.save();
  res.json({ status: 'success', data: { order } });
});

exports.getTracking = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).select('orderNumber status tracking');
  if (!order) {
    return next(new AppError('Order not found', 404));
  }
  res.json({ status: 'success', data: { tracking: order.tracking, status: order.status } });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, status, startDate, endDate } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Order.countDocuments(filter)
  ]);

  res.json({
    status: 'success',
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

