const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  userName: String,
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  images: [String],
  helpful: {
    type: Number,
    default: 0
  },
  helpfulVoters: [String],
  verified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderationNote: String,
  reply: {
    content: String,
    createdAt: Date
  }
}, {
  timestamps: true
});

reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

reviewSchema.statics.getProductStats = async function(productId) {
  const stats = await this.aggregate([
    { $match: { productId, status: 'approved' } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratings: { $push: '$rating' }
      }
    }
  ]);

  if (!stats.length) {
    return { avgRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  stats[0].ratings.forEach(r => distribution[r]++);

  return {
    avgRating: Math.round(stats[0].avgRating * 10) / 10,
    totalReviews: stats[0].totalReviews,
    distribution
  };
};

module.exports = mongoose.model('Review', reviewSchema);

