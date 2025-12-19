const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: String,
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  image: String,
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

categorySchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

categorySchema.statics.getTree = async function() {
  const categories = await this.find({ isActive: true }).sort('order');
  const map = {};
  const roots = [];

  categories.forEach(cat => {
    map[cat._id] = { ...cat.toObject(), children: [] };
  });

  categories.forEach(cat => {
    if (cat.parent) {
      if (map[cat.parent]) {
        map[cat.parent].children.push(map[cat._id]);
      }
    } else {
      roots.push(map[cat._id]);
    }
  });

  return roots;
};

module.exports = mongoose.model('Category', categorySchema);

