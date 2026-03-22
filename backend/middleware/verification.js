const { User } = require('../models/User');

const requireApprovedVerification = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const user = await User.findById(userId).select('verificationStatus role');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (user.role !== 'admin' && user.verificationStatus !== 'approved') {
      return res.status(403).json({
        status: 'error',
        message: 'Account not verified'
      });
    }

    return next();
  } catch (error) {
    console.error('Verification middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during verification check'
    });
  }
};

module.exports = { requireApprovedVerification };
