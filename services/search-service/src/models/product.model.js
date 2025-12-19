const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  inventory: { type: Number, default: 0 },
  images: [{ url: String, alt: String, isPrimary: Boolean }],
  attributes: { type: Map, of: String },
  tags: [String],
  status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' },
  featured: { type: Boolean, default: false },
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true }
});

const searchHistorySchema = new mongoose.Schema({
  query: { type: String, required: true },
  userId: String,
  resultCount: Number,
  filters: { type: Map, of: String }
}, { timestamps: true });

searchHistorySchema.index({ query: 1 });
searchHistorySchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);
const Category = mongoose.model('Category', categorySchema);
const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

module.exports = { Product, Category, SearchHistory };

