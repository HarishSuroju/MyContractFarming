const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Basic JWT authentication middleware.
 * Expects an Authorization header in the form: "Bearer <token>"
 * Attaches the decoded payload to req.user.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Access token is required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  });
};

/**
 * Role-based authorization middleware.
 * Usage: router.get('/path', authenticateToken, authorizeRoles('farmer', 'contractor'), handler)
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to perform this action'
      });
    }

    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };