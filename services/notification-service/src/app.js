require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const notificationRoutes = require('./routes/notification.routes');
const fs = require('fs');
const path = require('path');
const sharedPath = fs.existsSync('/app/shared') ? '/app/shared' : path.join(__dirname, '../../../shared');
const { errorHandler } = require(`${sharedPath}/errorHandler`);
const { metricsMiddleware, metricsEndpoint } = require(`${sharedPath}/metrics`);
const { createLogger } = require(`${sharedPath}/logger`);

const app = express();
const logger = createLogger('notification-service');
const PORT = process.env.PORT || 3006;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Goutham:goutham@ecommerce-cluster.med5miv.mongodb.net/notifications_db';

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));
app.use(metricsMiddleware);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'notification-service', timestamp: new Date().toISOString() });
});

app.get('/health/live', (req, res) => {
  res.json({ status: 'alive' });
});

app.get('/metrics', metricsEndpoint);

app.use('/notifications', notificationRoutes);

app.use(errorHandler);

mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    app.listen(PORT, () => {
      logger.info(`Notification service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;

