const Profile = require('../models/profile.model');
const fs = require('fs');
const path = require('path');
const sharedPath = fs.existsSync('/app/shared') ? '/app/shared' : path.join(__dirname, '../../../../shared');
const { AppError, catchAsync } = require(`${sharedPath}/errorHandler`);

exports.getProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const profile = await Profile.findOne({ userId: id });
  if (!profile) {
    return next(new AppError('Profile not found', 404));
  }
  res.json({ status: 'success', data: { profile } });
});

exports.createProfile = catchAsync(async (req, res, next) => {
  const { userId, email, name } = req.body;
  const existingProfile = await Profile.findOne({ userId });
  if (existingProfile) {
    return next(new AppError('Profile already exists', 400));
  }
  const profile = await Profile.create({ userId, email, name });
  res.status(201).json({ status: 'success', data: { profile } });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const allowedFields = ['name', 'phone', 'avatar', 'dateOfBirth', 'gender'];
  const updates = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const profile = await Profile.findOneAndUpdate(
    { userId: id },
    updates,
    { new: true, runValidators: true }
  );
  if (!profile) {
    return next(new AppError('Profile not found', 404));
  }
  res.json({ status: 'success', data: { profile } });
});

exports.deleteProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const profile = await Profile.findOneAndDelete({ userId: id });
  if (!profile) {
    return next(new AppError('Profile not found', 404));
  }
  res.json({ status: 'success', message: 'Profile deleted' });
});

exports.getPreferences = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const profile = await Profile.findOne({ userId: id }).select('preferences');
  if (!profile) {
    return next(new AppError('Profile not found', 404));
  }
  res.json({ status: 'success', data: { preferences: profile.preferences } });
});

exports.updatePreferences = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const profile = await Profile.findOneAndUpdate(
    { userId: id },
    { preferences: { ...req.body } },
    { new: true, runValidators: true }
  );
  if (!profile) {
    return next(new AppError('Profile not found', 404));
  }
  res.json({ status: 'success', data: { preferences: profile.preferences } });
});

exports.getAddresses = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const profile = await Profile.findOne({ userId: id }).select('addresses');
  if (!profile) {
    return next(new AppError('Profile not found', 404));
  }
  res.json({ status: 'success', data: { addresses: profile.addresses } });
});

exports.addAddress = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const profile = await Profile.findOne({ userId: id });
  if (!profile) {
    return next(new AppError('Profile not found', 404));
  }
  
  if (req.body.isDefault) {
    profile.addresses.forEach(addr => addr.isDefault = false);
  }
  
  profile.addresses.push(req.body);
  await profile.save();
  res.status(201).json({ status: 'success', data: { addresses: profile.addresses } });
});

exports.updateAddress = catchAsync(async (req, res, next) => {
  const { id, addressId } = req.params;
  const profile = await Profile.findOne({ userId: id });
  if (!profile) {
    return next(new AppError('Profile not found', 404));
  }

  const address = profile.addresses.id(addressId);
  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  if (req.body.isDefault) {
    profile.addresses.forEach(addr => addr.isDefault = false);
  }

  Object.assign(address, req.body);
  await profile.save();
  res.json({ status: 'success', data: { address } });
});

exports.deleteAddress = catchAsync(async (req, res, next) => {
  const { id, addressId } = req.params;
  const profile = await Profile.findOne({ userId: id });
  if (!profile) {
    return next(new AppError('Profile not found', 404));
  }

  profile.addresses = profile.addresses.filter(addr => addr._id.toString() !== addressId);
  await profile.save();
  res.json({ status: 'success', message: 'Address deleted' });
});

