const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 2000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  compareAtPrice: {
    type: Number,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  inventory: {
    type: Number,
    default: 0,
    min: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  attributes: {
    type: Map,
    of: String
  },
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'draft', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  avgRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ status: 1 });
productSchema.index({ createdAt: -1 });

productSchema.methods.isInStock = function() {
  return this.inventory > 0;
};

productSchema.methods.decreaseInventory = function(quantity) {
  if (this.inventory < quantity) {
    throw new Error('Insufficient inventory');
  }
  this.inventory -= quantity;
  return this.save();
};

productSchema.methods.increaseInventory = function(quantity) {
  this.inventory += quantity;
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);

