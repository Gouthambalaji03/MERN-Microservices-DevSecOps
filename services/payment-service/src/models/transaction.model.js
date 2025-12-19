const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  orderId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'paypal', 'wallet'],
    required: true
  },
  stripePaymentIntentId: String,
  stripeChargeId: String,
  cardLast4: String,
  cardBrand: String,
  refundedAmount: {
    type: Number,
    default: 0
  },
  refunds: [{
    refundId: String,
    amount: Number,
    reason: String,
    createdAt: { type: Date, default: Date.now }
  }],
  metadata: {
    type: Map,
    of: String
  },
  errorMessage: String,
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);

