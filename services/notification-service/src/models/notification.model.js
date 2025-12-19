const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'push'],
    required: true
  },
  templateId: String,
  subject: String,
  content: {
    type: String,
    required: true
  },
  recipient: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'bounced'],
    default: 'pending'
  },
  metadata: {
    type: Map,
    of: String
  },
  errorMessage: String,
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date
}, {
  timestamps: true
});

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ status: 1 });

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'push'],
    required: true
  },
  subject: String,
  content: {
    type: String,
    required: true
  },
  variables: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
const Template = mongoose.model('Template', templateSchema);

module.exports = { Notification, Template };

