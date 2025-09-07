const createError = require('http-errors');

// Middleware to check if user is authenticated
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // User is logged in, proceed
  }
  next(createError(401, 'You must be logged in to access this resource'));
};