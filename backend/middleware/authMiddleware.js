const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/config');

const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized  no token provided'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401);
      return next(new Error('Not authorized  user no longer exists'));
    }

    if (!user.isActive) {
      res.status(403);
      return next(new Error('Your account has been deactivated'));
    }

    if (user.isBlocked) {
      res.status(403);
      return next(new Error('Your account has been blocked. Contact support.'));
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Not authorized  token has expired'));
    }
    return next(new Error('Not authorized  invalid token'));
  }
};

module.exports = { protect };