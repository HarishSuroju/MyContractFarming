const { User } = require('../models/User');

const adminOnly = async (req, res, next) => {
  try {
    // First check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Find user in database to get role
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        status: 'error',
        message: 'Account is blocked'
      });
    }

    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during authorization'
    });
  }
};

module.exports = { adminOnly };