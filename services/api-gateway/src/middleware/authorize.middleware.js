const fs = require('fs');
const path = require('path');
const sharedPath = fs.existsSync('/app/shared') ? '/app/shared' : path.join(__dirname, '../../../../shared');
const { AppError } = require(`${sharedPath}/errorHandler`);

const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

const authorizeOwnerOrAdmin = (userIdParam = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const resourceUserId = req.params[userIdParam] || req.body.userId;
    
    if (req.user.role === 'admin') {
      return next();
    }

    if (req.user.userId !== resourceUserId) {
      return next(new AppError('Access denied', 403));
    }

    next();
  };
};

module.exports = { authorize, authorizeOwnerOrAdmin };

