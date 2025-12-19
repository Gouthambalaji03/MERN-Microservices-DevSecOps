const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const fs = require('fs');
const path = require('path');
const sharedPath = fs.existsSync('/app/shared') ? '/app/shared' : path.join(__dirname, '../../../../shared');
const { AppError, catchAsync } = require(`${sharedPath}/errorHandler`);

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const signAccessToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const signRefreshToken = (userId) => {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

exports.register = catchAsync(async (req, res, next) => {
  const { email, password, name } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already registered', 400));
  }

  const user = await User.create({ email, password, name });
  const accessToken = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);

  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  await user.save({ validateBeforeSave: false });

  res.status(201).json({
    status: 'success',
    data: {
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Account is deactivated', 401));
  }

  const accessToken = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);

  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  await user.save({ validateBeforeSave: false });

  res.json({
    status: 'success',
    data: {
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken
    }
  });
});

exports.refresh = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return next(new AppError('Refresh token required', 400));
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch (err) {
    return next(new AppError('Invalid refresh token', 401));
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const tokenExists = user.refreshTokens.some(
    t => t.token === refreshToken && t.expiresAt > new Date()
  );
  if (!tokenExists) {
    return next(new AppError('Refresh token expired or invalid', 401));
  }

  const accessToken = signAccessToken(user._id, user.role);
  const newRefreshToken = signRefreshToken(user._id);

  user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
  user.refreshTokens.push({
    token: newRefreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  await user.save({ validateBeforeSave: false });

  res.json({
    status: 'success',
    data: { accessToken, refreshToken: newRefreshToken }
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.json({ status: 'success', message: 'Logged out' });
  }

  const decoded = jwt.decode(refreshToken);
  if (decoded && decoded.userId) {
    await User.findByIdAndUpdate(decoded.userId, {
      $pull: { refreshTokens: { token: refreshToken } }
    });
  }

  res.json({ status: 'success', message: 'Logged out' });
});

exports.verify = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401));
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return next(new AppError('Invalid token', 401));
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Password changed. Please login again', 401));
  }

  res.json({
    status: 'success',
    data: { userId: user._id, email: user.email, role: user.role }
  });
});

