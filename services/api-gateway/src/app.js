require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { authenticate, optionalAuth } = require('./middleware/auth.middleware');
const { authorize } = require('./middleware/authorize.middleware');
const fs = require('fs');
const sharedPath = fs.existsSync('/app/shared') ? '/app/shared' : require('path').join(__dirname, '../../../shared');
const { errorHandler } = require(`${sharedPath}/errorHandler`);
const { metricsMiddleware, metricsEndpoint } = require(`${sharedPath}/metrics`);
const { createLogger } = require(`${sharedPath}/logger`);

const app = express();
const logger = createLogger('api-gateway');
const PORT = process.env.PORT || 3000;

const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  users: process.env.USER_SERVICE_URL || 'http://localhost:3002',
  products: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003',
  orders: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
  payments: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005',
  notifications: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006',
  search: process.env.SEARCH_SERVICE_URL || 'http://localhost:3007',
  reviews: process.env.REVIEW_SERVICE_URL || 'http://localhost:3008',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3009'
};

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());
app.use(morgan('combined'));
app.use(metricsMiddleware);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: 'error', message: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: 'error', message: 'Too many login attempts' }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api-gateway', timestamp: new Date().toISOString() });
});

app.get('/health/live', (req, res) => {
  res.json({ status: 'alive' });
});

app.get('/metrics', metricsEndpoint);

const createProxy = (target, pathRewrite) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    onProxyReq: (proxyReq, req) => {
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.userId);
        proxyReq.setHeader('X-User-Role', req.user.role);
        proxyReq.setHeader('X-User-Email', req.user.email || '');
      }
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => {
      logger.error('Proxy error:', err);
      res.status(503).json({ status: 'error', message: 'Service unavailable' });
    }
  });
};

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', createProxy(services.auth, { '^/api/auth': '/auth' }));

app.use('/api/users', authenticate, createProxy(services.users, { '^/api/users': '/users' }));

app.use('/api/products', optionalAuth, createProxy(services.products, { '^/api/products': '/products' }));
app.use('/api/categories', optionalAuth, createProxy(services.products, { '^/api/categories': '/categories' }));

app.use('/api/orders', authenticate, createProxy(services.orders, { '^/api/orders': '/orders' }));

app.use('/api/payments', authenticate, createProxy(services.payments, { '^/api/payments': '/payments' }));

app.use('/api/notifications', authenticate, createProxy(services.notifications, { '^/api/notifications': '/notifications' }));

app.use('/api/search', optionalAuth, createProxy(services.search, { '^/api/search': '/search' }));

app.use('/api/reviews', optionalAuth, createProxy(services.reviews, { '^/api/reviews': '/reviews' }));

app.use('/api/analytics', authenticate, authorize(['admin', 'manager']), createProxy(services.analytics, { '^/api/analytics': '/analytics' }));

app.post('/api/track', optionalAuth, createProxy(services.analytics, { '^/api/track': '/analytics/event' }));

app.get('/api/services/health', async (req, res) => {
  const axios = require('axios');
  const healthChecks = {};
  
  for (const [name, url] of Object.entries(services)) {
    try {
      const response = await axios.get(`${url}/health`, { timeout: 2000 });
      healthChecks[name] = { status: 'healthy', ...response.data };
    } catch (err) {
      healthChecks[name] = { status: 'unhealthy', error: err.message };
    }
  }
  
  const allHealthy = Object.values(healthChecks).every(h => h.status === 'healthy');
  res.status(allHealthy ? 200 : 503).json({ status: allHealthy ? 'healthy' : 'degraded', services: healthChecks });
});

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info('Service endpoints:', services);
});

module.exports = app;

