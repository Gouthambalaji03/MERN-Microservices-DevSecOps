const { Notification, Template } = require('../models/notification.model');
const { sendEmail, renderTemplate } = require('../services/email.service');
const fs = require('fs');
const path = require('path');
const sharedPath = fs.existsSync('/app/shared') ? '/app/shared' : path.join(__dirname, '../../../../shared');
const { AppError, catchAsync } = require(`${sharedPath}/errorHandler`);

exports.sendNotification = catchAsync(async (req, res, next) => {
  const { userId, type, recipient, templateName, data, subject, content } = req.body;

  let emailContent = { subject, html: content };
  
  if (templateName && data) {
    emailContent = renderTemplate(templateName, data);
  }

  const notification = await Notification.create({
    userId,
    type,
    recipient,
    templateId: templateName,
    subject: emailContent.subject,
    content: emailContent.html,
    status: 'pending',
    metadata: data ? new Map(Object.entries(data)) : undefined
  });

  if (type === 'email') {
    const result = await sendEmail({
      to: recipient,
      subject: emailContent.subject,
      html: emailContent.html
    });

    notification.status = result.success ? 'sent' : 'failed';
    notification.sentAt = result.success ? new Date() : undefined;
    notification.errorMessage = result.error;
    await notification.save();
  }

  res.status(201).json({ status: 'success', data: { notification } });
});

exports.getNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  res.json({ status: 'success', data: { notification } });
});

exports.getUserNotifications = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { page = 1, limit = 20, type, status } = req.query;

  const filter = { userId };
  if (type) filter.type = type;
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Notification.countDocuments(filter)
  ]);

  res.json({
    status: 'success',
    data: {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { readAt: new Date() },
    { new: true }
  );
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  res.json({ status: 'success', data: { notification } });
});

exports.createTemplate = catchAsync(async (req, res, next) => {
  const template = await Template.create(req.body);
  res.status(201).json({ status: 'success', data: { template } });
});

exports.getTemplates = catchAsync(async (req, res, next) => {
  const templates = await Template.find({ isActive: true });
  res.json({ status: 'success', data: { templates } });
});

exports.updateTemplate = catchAsync(async (req, res, next) => {
  const template = await Template.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!template) {
    return next(new AppError('Template not found', 404));
  }
  res.json({ status: 'success', data: { template } });
});

exports.deleteTemplate = catchAsync(async (req, res, next) => {
  const template = await Template.findByIdAndUpdate(req.params.id, { isActive: false });
  if (!template) {
    return next(new AppError('Template not found', 404));
  }
  res.json({ status: 'success', message: 'Template deleted' });
});

