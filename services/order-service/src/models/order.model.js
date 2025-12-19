const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: String
});

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  items: [orderItemSchema],
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'payment_processing', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  paymentMethod: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  tracking: {
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    history: [{
      status: String,
      location: String,
      timestamp: { type: Date, default: Date.now }
    }]
  },
  notes: String,
  cancelReason: String
}, {
  timestamps: true
});

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ userId: 1, createdAt: -1 });

orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.total = this.subtotal + this.tax + this.shippingCost - this.discount;
};

orderSchema.methods.canCancel = function() {
  return ['pending', 'payment_processing', 'confirmed'].includes(this.status);
};

orderSchema.methods.updateStatus = function(newStatus) {
  const validTransitions = {
    pending: ['payment_processing', 'cancelled'],
    payment_processing: ['confirmed', 'pending', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: ['refunded'],
    cancelled: [],
    refunded: []
  };

  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
  }
  this.status = newStatus;
};

module.exports = mongoose.model('Order', orderSchema);

