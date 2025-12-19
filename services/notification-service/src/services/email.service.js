const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const sharedPath = fs.existsSync('/app/shared') ? '/app/shared' : path.join(__dirname, '../../../../shared');
const { createLogger } = require(`${sharedPath}/logger`);

const logger = createLogger('email-service');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER || 'test',
    pass: process.env.SMTP_PASS || 'test'
  }
});

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"E-Commerce" <noreply@ecommerce.com>',
      to,
      subject,
      html,
      text
    });
    logger.info(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Email send failed:', error);
    return { success: false, error: error.message };
  }
};

const templates = {
  welcome: (data) => ({
    subject: `Welcome to E-Commerce, ${data.name}!`,
    html: `
      <h1>Welcome, ${data.name}!</h1>
      <p>Thank you for joining our platform. We're excited to have you!</p>
      <p>Start exploring our products and enjoy your shopping experience.</p>
    `
  }),
  orderConfirmation: (data) => ({
    subject: `Order Confirmed - #${data.orderNumber}`,
    html: `
      <h1>Order Confirmed!</h1>
      <p>Hi ${data.name},</p>
      <p>Your order #${data.orderNumber} has been confirmed.</p>
      <p><strong>Total:</strong> $${data.total}</p>
      <p>We'll notify you when your order ships.</p>
    `
  }),
  orderShipped: (data) => ({
    subject: `Your Order Has Shipped - #${data.orderNumber}`,
    html: `
      <h1>Your Order Is On The Way!</h1>
      <p>Hi ${data.name},</p>
      <p>Great news! Your order #${data.orderNumber} has been shipped.</p>
      <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
      <p><strong>Carrier:</strong> ${data.carrier}</p>
    `
  }),
  passwordReset: (data) => ({
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>Hi ${data.name},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${data.resetUrl}">Reset Password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  }),
  paymentReceipt: (data) => ({
    subject: `Payment Receipt - $${data.amount}`,
    html: `
      <h1>Payment Receipt</h1>
      <p>Hi ${data.name},</p>
      <p>We've received your payment of <strong>$${data.amount}</strong>.</p>
      <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
      <p><strong>Order:</strong> #${data.orderNumber}</p>
      <p>Thank you for your purchase!</p>
    `
  })
};

const renderTemplate = (templateName, data) => {
  if (!templates[templateName]) {
    throw new Error(`Template '${templateName}' not found`);
  }
  return templates[templateName](data);
};

module.exports = { sendEmail, renderTemplate };

