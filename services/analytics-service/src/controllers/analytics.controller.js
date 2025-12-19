const { Event, DailyMetrics } = require('../models/event.model');
const fs = require('fs');
const path = require('path');
const sharedPath = fs.existsSync('/app/shared') ? '/app/shared' : path.join(__dirname, '../../../../shared');
const { catchAsync } = require(`${sharedPath}/errorHandler`);

exports.trackEvent = catchAsync(async (req, res) => {
  const { eventType, userId, sessionId, productId, orderId, data, value } = req.body;

  const metadata = {
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.headers['x-forwarded-for'],
    referrer: req.headers.referer,
    page: req.headers['x-page-url']
  };

  const event = await Event.create({
    eventType,
    userId,
    sessionId,
    productId,
    orderId,
    data,
    metadata,
    value
  });

  res.status(201).json({ status: 'success', data: { eventId: event._id } });
});

exports.trackBatch = catchAsync(async (req, res) => {
  const { events } = req.body;
  
  const enrichedEvents = events.map(event => ({
    ...event,
    metadata: {
      ...event.metadata,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    }
  }));

  await Event.insertMany(enrichedEvents);
  res.status(201).json({ status: 'success', message: `${events.length} events tracked` });
});

exports.getDashboard = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const [overview, eventCounts, topProducts, recentPurchases] = await Promise.all([
    Event.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$eventType', 'purchase'] }, '$value', 0] }
          }
        }
      }
    ]),
    Event.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Event.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, productId: { $exists: true }, eventType: 'product_view' } },
      { $group: { _id: '$productId', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]),
    Event.find({ eventType: 'purchase' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('userId orderId value createdAt')
  ]);

  const stats = overview[0] || { totalEvents: 0, uniqueUsers: [], totalRevenue: 0 };

  res.json({
    status: 'success',
    data: {
      overview: {
        totalEvents: stats.totalEvents,
        uniqueUsers: stats.uniqueUsers?.length || 0,
        totalRevenue: stats.totalRevenue,
        period: { start, end }
      },
      eventCounts: eventCounts.reduce((acc, e) => ({ ...acc, [e._id]: e.count }), {}),
      topProducts,
      recentPurchases
    }
  });
});

exports.getUserAnalytics = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { days = 30 } = req.query;

  const start = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

  const [activity, purchases, productInteractions] = await Promise.all([
    Event.aggregate([
      { $match: { userId, createdAt: { $gte: start } } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } }
    ]),
    Event.aggregate([
      { $match: { userId, eventType: 'purchase', createdAt: { $gte: start } } },
      { $group: { _id: null, total: { $sum: '$value' }, count: { $sum: 1 } } }
    ]),
    Event.aggregate([
      { $match: { userId, productId: { $exists: true }, createdAt: { $gte: start } } },
      { $group: { _id: '$productId', interactions: { $sum: 1 } } },
      { $sort: { interactions: -1 } },
      { $limit: 10 }
    ])
  ]);

  res.json({
    status: 'success',
    data: {
      activity: activity.reduce((acc, a) => ({ ...acc, [a._id]: a.count }), {}),
      purchases: purchases[0] || { total: 0, count: 0 },
      topProducts: productInteractions
    }
  });
});

exports.getProductAnalytics = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const { days = 30 } = req.query;

  const start = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

  const [views, cartAdds, purchases, dailyViews] = await Promise.all([
    Event.countDocuments({ productId, eventType: 'product_view', createdAt: { $gte: start } }),
    Event.countDocuments({ productId, eventType: 'add_to_cart', createdAt: { $gte: start } }),
    Event.aggregate([
      { $match: { productId, eventType: 'purchase', createdAt: { $gte: start } } },
      { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$value' } } }
    ]),
    Event.aggregate([
      { $match: { productId, eventType: 'product_view', createdAt: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  const purchaseData = purchases[0] || { count: 0, revenue: 0 };

  res.json({
    status: 'success',
    data: {
      views,
      cartAdds,
      purchases: purchaseData.count,
      revenue: purchaseData.revenue,
      conversionRate: views > 0 ? ((purchaseData.count / views) * 100).toFixed(2) : 0,
      dailyViews
    }
  });
});

exports.getReports = catchAsync(async (req, res) => {
  const { type = 'sales', startDate, endDate, groupBy = 'day' } = req.query;
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  let dateFormat = '%Y-%m-%d';
  if (groupBy === 'month') dateFormat = '%Y-%m';
  if (groupBy === 'week') dateFormat = '%Y-W%V';

  let report;

  if (type === 'sales') {
    report = await Event.aggregate([
      { $match: { eventType: 'purchase', createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          revenue: { $sum: '$value' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  } else if (type === 'traffic') {
    report = await Event.aggregate([
      { $match: { eventType: 'page_view', createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          pageViews: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$userId' }
        }
      },
      { $addFields: { uniqueVisitors: { $size: '$uniqueVisitors' } } },
      { $sort: { _id: 1 } }
    ]);
  } else if (type === 'conversion') {
    report = await Event.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          views: { $sum: { $cond: [{ $eq: ['$eventType', 'product_view'] }, 1, 0] } },
          carts: { $sum: { $cond: [{ $eq: ['$eventType', 'add_to_cart'] }, 1, 0] } },
          purchases: { $sum: { $cond: [{ $eq: ['$eventType', 'purchase'] }, 1, 0] } }
        }
      },
      {
        $addFields: {
          conversionRate: {
            $cond: [{ $gt: ['$views', 0] }, { $multiply: [{ $divide: ['$purchases', '$views'] }, 100] }, 0]
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  res.json({ status: 'success', data: { report, type, period: { start, end, groupBy } } });
});

