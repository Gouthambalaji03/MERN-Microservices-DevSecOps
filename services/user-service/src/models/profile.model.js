const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const profileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: String,
  avatar: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  addresses: [addressSchema],
  preferences: {
    newsletter: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'USD' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' }
  }
}, {
  timestamps: true
});

profileSchema.methods.setDefaultAddress = function(addressId) {
  this.addresses.forEach(addr => {
    addr.isDefault = addr._id.toString() === addressId.toString();
  });
};

module.exports = mongoose.model('Profile', profileSchema);

