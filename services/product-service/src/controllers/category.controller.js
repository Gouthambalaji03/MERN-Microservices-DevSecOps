const Category = require('../models/category.model');
const fs = require('fs');
const path = require('path');
const sharedPath = fs.existsSync('/app/shared') ? '/app/shared' : path.join(__dirname, '../../../../shared');
const { AppError, catchAsync } = require(`${sharedPath}/errorHandler`);

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find({ isActive: true }).sort('order');
  res.json({ status: 'success', data: { categories } });
});

exports.getCategoryTree = catchAsync(async (req, res, next) => {
  const tree = await Category.getTree();
  res.json({ status: 'success', data: { categories: tree } });
});

exports.getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  res.json({ status: 'success', data: { category } });
});

exports.createCategory = catchAsync(async (req, res, next) => {
  const category = await Category.create(req.body);
  res.status(201).json({ status: 'success', data: { category } });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  res.json({ status: 'success', data: { category } });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  res.json({ status: 'success', message: 'Category deleted' });
});

