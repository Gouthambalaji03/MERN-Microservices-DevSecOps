const Review = require('../models/review.model');
const fs = require('fs');
const path = require('path');
const sharedPath = fs.existsSync('/app/shared') ? '/app/shared' : path.join(__dirname, '../../../../shared');
const { AppError, catchAsync } = require(`${sharedPath}/errorHandler`);

exports.createReview = catchAsync(async (req, res, next) => {
  const { productId, userId, userName, rating, title, content, images, verified } = req.body;

  const existing = await Review.findOne({ productId, userId });
  if (existing) {
    return next(new AppError('You have already reviewed this product', 400));
  }

  const review = await Review.create({
    productId,
    userId,
    userName,
    rating,
    title,
    content,
    images,
    verified,
    status: 'approved'
  });

  const stats = await Review.getProductStats(productId);

  res.status(201).json({ status: 'success', data: { review, productStats: stats } });
});

exports.getProductReviews = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sort = 'newest', rating } = req.query;

  const filter = { productId, status: 'approved' };
  if (rating) filter.rating = parseInt(rating);

  let sortOption = { createdAt: -1 };
  if (sort === 'helpful') sortOption = { helpful: -1 };
  if (sort === 'rating_high') sortOption = { rating: -1 };
  if (sort === 'rating_low') sortOption = { rating: 1 };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reviews, total, stats] = await Promise.all([
    Review.find(filter).sort(sortOption).skip(skip).limit(parseInt(limit)),
    Review.countDocuments(filter),
    Review.getProductStats(productId)
  ]);

  res.json({
    status: 'success',
    data: {
      reviews,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new AppError('Review not found', 404));
  }
  res.json({ status: 'success', data: { review } });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const { rating, title, content, images } = req.body;
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { rating, title, content, images },
    { new: true, runValidators: true }
  );
  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  const stats = await Review.getProductStats(review.productId);
  res.json({ status: 'success', data: { review, productStats: stats } });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  const stats = await Review.getProductStats(review.productId);
  res.json({ status: 'success', message: 'Review deleted', productStats: stats });
});

exports.markHelpful = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  if (review.helpfulVoters.includes(userId)) {
    return next(new AppError('You have already marked this review as helpful', 400));
  }

  review.helpful += 1;
  review.helpfulVoters.push(userId);
  await review.save();

  res.json({ status: 'success', data: { helpful: review.helpful } });
});

exports.moderateReview = catchAsync(async (req, res, next) => {
  const { status, moderationNote } = req.body;
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { status, moderationNote },
    { new: true }
  );
  if (!review) {
    return next(new AppError('Review not found', 404));
  }
  res.json({ status: 'success', data: { review } });
});

exports.addReply = catchAsync(async (req, res, next) => {
  const { content } = req.body;
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { reply: { content, createdAt: new Date() } },
    { new: true }
  );
  if (!review) {
    return next(new AppError('Review not found', 404));
  }
  res.json({ status: 'success', data: { review } });
});

exports.getUserReviews = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Review.countDocuments({ userId })
  ]);

  res.json({
    status: 'success',
    data: {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

exports.getPendingReviews = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ status: 'pending' }).sort({ createdAt: 1 }).skip(skip).limit(parseInt(limit)),
    Review.countDocuments({ status: 'pending' })
  ]);

  res.json({
    status: 'success',
    data: {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

