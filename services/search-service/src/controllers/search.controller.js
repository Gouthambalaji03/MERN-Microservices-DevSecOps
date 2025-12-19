const { Product, Category, SearchHistory } = require('../models/product.model');
const fs = require('fs');
const path = require('path');
const sharedPath = fs.existsSync('/app/shared') ? '/app/shared' : path.join(__dirname, '../../../../shared');
const { catchAsync } = require(`${sharedPath}/errorHandler`);

exports.search = catchAsync(async (req, res) => {
  const { q, category, minPrice, maxPrice, minRating, inStock, sort, page = 1, limit = 20 } = req.query;

  const filter = { status: 'active' };

  if (q) {
    filter.$text = { $search: q };
  }

  if (category) filter.category = category;
  
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  if (minRating) {
    filter.avgRating = { $gte: parseFloat(minRating) };
  }

  if (inStock === 'true') {
    filter.inventory = { $gt: 0 };
  }

  let sortOption = {};
  if (q) sortOption.score = { $meta: 'textScore' };
  if (sort === 'price_asc') sortOption.price = 1;
  else if (sort === 'price_desc') sortOption.price = -1;
  else if (sort === 'rating') sortOption.avgRating = -1;
  else if (sort === 'newest') sortOption.createdAt = -1;
  else if (sort === 'popular') sortOption.reviewCount = -1;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  let query = Product.find(filter);
  
  if (q) {
    query = query.select({ score: { $meta: 'textScore' } });
  }

  const [products, total] = await Promise.all([
    query.populate('category', 'name slug').sort(sortOption).skip(skip).limit(parseInt(limit)),
    Product.countDocuments(filter)
  ]);

  if (q) {
    await SearchHistory.create({
      query: q,
      userId: req.headers['x-user-id'],
      resultCount: total,
      filters: { category, minPrice, maxPrice, minRating, inStock }
    });
  }

  res.json({
    status: 'success',
    data: {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

exports.suggest = catchAsync(async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.json({ status: 'success', data: { suggestions: [] } });
  }

  const products = await Product.find({
    name: { $regex: q, $options: 'i' },
    status: 'active'
  })
    .select('name')
    .limit(10);

  const suggestions = products.map(p => p.name);

  const recentSearches = await SearchHistory.aggregate([
    { $match: { query: { $regex: q, $options: 'i' } } },
    { $group: { _id: '$query', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  res.json({
    status: 'success',
    data: {
      suggestions: [...new Set([...suggestions, ...recentSearches.map(s => s._id)])].slice(0, 10)
    }
  });
});

exports.getFilters = catchAsync(async (req, res) => {
  const [categories, priceRange, tags] = await Promise.all([
    Category.find({}).select('name slug'),
    Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } }
    ]),
    Product.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ])
  ]);

  res.json({
    status: 'success',
    data: {
      filters: {
        categories,
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 1000 },
        tags: tags.map(t => ({ name: t._id, count: t.count })),
        ratings: [1, 2, 3, 4, 5]
      }
    }
  });
});

exports.reindex = catchAsync(async (req, res) => {
  await Product.collection.dropIndexes();
  await Product.syncIndexes();
  res.json({ status: 'success', message: 'Reindex completed' });
});

exports.getPopularSearches = catchAsync(async (req, res) => {
  const popular = await SearchHistory.aggregate([
    { $group: { _id: '$query', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    status: 'success',
    data: { searches: popular.map(s => ({ query: s._id, count: s.count })) }
  });
});

