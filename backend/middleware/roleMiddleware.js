const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized  please log in'));
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(
          `Access denied  role '${req.user.role}' is not permitted. ` +
          `Required: ${roles.join(', ')}`
        )
      );
    }

    next();
  };
};

module.exports = { authorizeRoles };