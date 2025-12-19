const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets' },
  { name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel' },
  { name: 'Home & Garden', slug: 'home-garden', description: 'Home decor and gardening' },
  { name: 'Sports', slug: 'sports', description: 'Sports equipment and accessories' },
  { name: 'Books', slug: 'books', description: 'Books and educational materials' },
];

const products = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-canceling wireless headphones with 30-hour battery life',
    price: 199.99,
    compareAtPrice: 249.99,
    categorySlug: 'electronics',
    inventory: 50,
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', isPrimary: true }],
    attributes: { brand: 'AudioMax', color: 'Black', wireless: 'Yes' },
    tags: ['headphones', 'wireless', 'bluetooth'],
    status: 'active',
    featured: true,
    avgRating: 4.5,
    reviewCount: 128
  },
  {
    name: 'Smart Watch Pro',
    description: 'Advanced smartwatch with health monitoring, GPS, and 7-day battery',
    price: 299.99,
    compareAtPrice: 349.99,
    categorySlug: 'electronics',
    inventory: 30,
    images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', isPrimary: true }],
    attributes: { brand: 'TechTime', color: 'Silver', waterproof: 'Yes' },
    tags: ['watch', 'smart', 'fitness'],
    status: 'active',
    featured: true,
    avgRating: 4.7,
    reviewCount: 89
  },
  {
    name: 'Premium Cotton T-Shirt',
    description: 'Ultra-soft organic cotton t-shirt with modern fit',
    price: 39.99,
    categorySlug: 'clothing',
    inventory: 200,
    images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', isPrimary: true }],
    attributes: { material: 'Organic Cotton', size: 'M', color: 'White' },
    tags: ['tshirt', 'cotton', 'casual'],
    status: 'active',
    featured: false,
    avgRating: 4.3,
    reviewCount: 56
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB mechanical keyboard with Cherry MX switches',
    price: 149.99,
    compareAtPrice: 179.99,
    categorySlug: 'electronics',
    inventory: 45,
    images: [{ url: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500', isPrimary: true }],
    attributes: { brand: 'KeyMaster', switches: 'Cherry MX Blue', rgb: 'Yes' },
    tags: ['keyboard', 'gaming', 'mechanical'],
    status: 'active',
    featured: true,
    avgRating: 4.8,
    reviewCount: 234
  },
  {
    name: 'Running Shoes Elite',
    description: 'Lightweight running shoes with advanced cushioning',
    price: 129.99,
    categorySlug: 'sports',
    inventory: 75,
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', isPrimary: true }],
    attributes: { brand: 'SpeedRun', size: '10', color: 'Red/Black' },
    tags: ['shoes', 'running', 'sports'],
    status: 'active',
    featured: true,
    avgRating: 4.6,
    reviewCount: 167
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'Premium mesh office chair with lumbar support',
    price: 449.99,
    compareAtPrice: 549.99,
    categorySlug: 'home-garden',
    inventory: 20,
    images: [{ url: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500', isPrimary: true }],
    attributes: { material: 'Mesh', adjustable: 'Yes', wheels: 'Yes' },
    tags: ['chair', 'office', 'ergonomic'],
    status: 'active',
    featured: false,
    avgRating: 4.4,
    reviewCount: 78
  },
  {
    name: 'Portable Power Bank 20000mAh',
    description: 'High-capacity power bank with fast charging support',
    price: 49.99,
    categorySlug: 'electronics',
    inventory: 100,
    images: [{ url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500', isPrimary: true }],
    attributes: { capacity: '20000mAh', ports: '3', fastCharge: 'Yes' },
    tags: ['powerbank', 'portable', 'charging'],
    status: 'active',
    featured: false,
    avgRating: 4.2,
    reviewCount: 345
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Non-slip yoga mat with alignment lines',
    price: 59.99,
    categorySlug: 'sports',
    inventory: 60,
    images: [{ url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500', isPrimary: true }],
    attributes: { material: 'TPE', thickness: '6mm', color: 'Purple' },
    tags: ['yoga', 'mat', 'fitness'],
    status: 'active',
    featured: false,
    avgRating: 4.5,
    reviewCount: 92
  },
];

const users = [
  {
    email: 'demo@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4wISz6XR5MieCXSG',
    name: 'Demo User',
    role: 'user'
  },
  {
    email: 'admin@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4wISz6XR5MieCXSG',
    name: 'Admin User',
    role: 'admin'
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    
    const productsDb = await mongoose.createConnection(`${MONGODB_URI}/products_db`);
    const authDb = await mongoose.createConnection(`${MONGODB_URI}/auth_db`);

    const CategorySchema = new mongoose.Schema({
      name: String,
      slug: String,
      description: String,
      isActive: { type: Boolean, default: true }
    });

    const ProductSchema = new mongoose.Schema({
      name: String,
      description: String,
      price: Number,
      compareAtPrice: Number,
      category: mongoose.Schema.Types.ObjectId,
      inventory: Number,
      images: [{ url: String, isPrimary: Boolean }],
      attributes: { type: Map, of: String },
      tags: [String],
      status: String,
      featured: Boolean,
      avgRating: Number,
      reviewCount: Number
    });

    const UserSchema = new mongoose.Schema({
      email: String,
      password: String,
      name: String,
      role: String,
      isActive: { type: Boolean, default: true }
    });

    const Category = productsDb.model('Category', CategorySchema);
    const Product = productsDb.model('Product', ProductSchema);
    const User = authDb.model('User', UserSchema);

    console.log('Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    console.log('Seeding categories...');
    const createdCategories = await Category.insertMany(categories);
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });

    console.log('Seeding products...');
    const productsWithCategories = products.map(p => ({
      ...p,
      category: categoryMap[p.categorySlug]
    }));
    await Product.insertMany(productsWithCategories);

    console.log('Seeding users...');
    await User.insertMany(users);

    console.log('Database seeded successfully!');
    console.log(`- ${categories.length} categories`);
    console.log(`- ${products.length} products`);
    console.log(`- ${users.length} users`);
    console.log('\nDemo credentials:');
    console.log('  Email: demo@example.com');
    console.log('  Password: password123');

    await productsDb.close();
    await authDb.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();

