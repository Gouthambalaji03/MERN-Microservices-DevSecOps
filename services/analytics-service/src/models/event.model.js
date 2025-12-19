const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: [
      'page_view', 'product_view', 'add_to_cart', 'remove_from_cart',
      'checkout_start', 'checkout_complete', 'purchase', 'search',
      'user_signup', 'user_login', 'user_logout', 'review_submit',
      'wishlist_add', 'wishlist_remove', 'share', 'custom'
    ]
  },
  userId: {
    type: String,
    index: true
  },
  sessionId: String,
  productId: String,
  orderId: String,
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  metadata: {
    userAgent: String,
    ip: String,
    referrer: String,
    page: String,
    device: String,
    browser: String,
    os: String,
    country: String
  },
  value: Number
}, {
  timestamps: true
});

eventSchema.index({ eventType: 1, createdAt: -1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ productId: 1, eventType: 1 });

const dailyMetricsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  pageViews: { type: Number, default: 0 },
  uniqueVisitors: { type: Number, default: 0 },
  productViews: { type: Number, default: 0 },
  addToCart: { type: Number, default: 0 },
  checkouts: { type: Number, default: 0 },
  purchases: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  newUsers: { type: Number, default: 0 },
  avgSessionDuration: Number,
  bounceRate: Number,
  conversionRate: Number
}, {
  timestamps: true
});

const Event = mongoose.model('Event', eventSchema);
const DailyMetrics = mongoose.model('DailyMetrics', dailyMetricsSchema);

module.exports = { Event, DailyMetrics };

