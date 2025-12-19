require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const paymentRoutes = require('./routes/payment.routes');
const fs = require('fs');
const path = require('path');
const sharedPath = fs.existsSync('/app/shared') ? '/app/shared' : path.join(__dirname, '../../../shared');
const { errorHandler } = require(`${sharedPath}/errorHandler`);
const { metricsMiddleware, metricsEndpoint } = require(`${sharedPath}/metrics`);
const { createLogger } = require(`${sharedPath}/logger`);

const app = express();
const logger = createLogger('payment-service');
const PORT = process.env.PORT || 3005;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/payments_db';

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));
app.use(metricsMiddleware);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'payment-service', timestamp: new Date().toISOString() });
});

app.get('/health/live', (req, res) => {
  res.json({ status: 'alive' });
});

app.get('/metrics', metricsEndpoint);

app.use('/payments', paymentRoutes);

app.use(errorHandler);

mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    app.listen(PORT, () => {
      logger.info(`Payment service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;

