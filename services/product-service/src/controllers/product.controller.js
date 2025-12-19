const Product = require('../models/product.model');
const fs = require('fs');
const path = require('path');
const sharedPath = fs.existsSync('/app/shared') ? '/app/shared' : path.join(__dirname, '../../../../shared');
const { AppError, catchAsync } = require(`${sharedPath}/errorHandler`);

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, category, status, minPrice, maxPrice, sort, featured } = req.query;
  
  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (featured === 'true') filter.featured = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  if (sort === 'price_desc') sortOption = { price: -1 };
  if (sort === 'name') sortOption = { name: 1 };
  if (sort === 'rating') sortOption = { avgRating: -1 };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit)),
    Product.countDocuments(filter)
  ]);

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

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  res.json({ status: 'success', data: { product } });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const product = await Product.create(req.body);
  res.status(201).json({ status: 'success', data: { product } });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  res.json({ status: 'success', data: { product } });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  res.json({ status: 'success', message: 'Product deleted' });
});

exports.updateInventory = catchAsync(async (req, res, next) => {
  const { quantity, operation } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (operation === 'increase') {
    await product.increaseInventory(quantity);
  } else if (operation === 'decrease') {
    await product.decreaseInventory(quantity);
  } else if (operation === 'set') {
    product.inventory = quantity;
    await product.save();
  } else {
    return next(new AppError('Invalid operation', 400));
  }

  res.json({ status: 'success', data: { inventory: product.inventory } });
});

exports.getFeatured = catchAsync(async (req, res, next) => {
  const products = await Product.find({ featured: true, status: 'active' })
    .populate('category', 'name slug')
    .limit(10);
  res.json({ status: 'success', data: { products } });
});

exports.updateRating = catchAsync(async (req, res, next) => {
  const { avgRating, reviewCount } = req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { avgRating, reviewCount },
    { new: true }
  );
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  res.json({ status: 'success', data: { product } });
});

