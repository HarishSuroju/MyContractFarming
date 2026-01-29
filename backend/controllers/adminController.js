const { User } = require('../models/User');
let Agreement;
try {
  Agreement = require('../models/Agreement').Agreement;
} catch (error) {
  console.warn('Agreement model not available:', error.message);
}
let Proposal;
try {
  Proposal = require('../models/Proposal').Proposal;
} catch (error) {
  console.warn('Proposal model not available:', error.message);
}
let FraudAlert;
try {
  FraudAlert = require('../models/FraudAlert').FraudAlert;
} catch (error) {
  console.warn('FraudAlert model not available:', error.message);
}

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      data: { users }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching users'
    });
  }
};

// Verify user documents
const verifyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'verified' or 'rejected'

    const user = await User.findByIdAndUpdate(
      id,
      { isVerified: status === 'verified' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: `User ${status} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while verifying user'
    });
  }
};

// Block/unblock user
const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { block } = req.body; // true to block, false to unblock

    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: block },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const action = block ? 'blocked' : 'unblocked';
    res.status(200).json({
      status: 'success',
      message: `User ${action} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while blocking user'
    });
  }
};

// Get all agreements
const getAllAgreements = async (req, res) => {
  try {
    if (!Agreement) {
      return res.status(500).json({
        status: 'error',
        message: 'Agreement model not available'
      });
    }
    
    const agreements = await Agreement.find()
      .populate('farmerId', 'name email')
      .populate('contractorId', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      data: { agreements }
    });
  } catch (error) {
    console.error('Get all agreements error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching agreements'
    });
  }
};

// Approve/reject agreement
const approveAgreement = async (req, res) => {
  try {
    if (!Agreement) {
      return res.status(500).json({
        status: 'error',
        message: 'Agreement model not available'
      });
    }
    
    const { id } = req.params;
    const { approved } = req.body; // true to approve, false to reject

    const agreement = await Agreement.findByIdAndUpdate(
      id,
      { status: approved ? 'approved' : 'rejected' },
      { new: true }
    );

    if (!agreement) {
      return res.status(404).json({
        status: 'error',
        message: 'Agreement not found'
      });
    }

    // Get user details
    const { User } = require('../models/User');
    const farmerUser = await User.findById(agreement.farmer);
    const contractorUser = await User.findById(agreement.contractor);

    // Create notification for both farmer and contractor
    const { Notification } = require('../models/Notification');
    
    const farmerNotification = new Notification({
      userId: agreement.farmer.toString(),
      senderId: req.user.userId,
      type: 'agreement_approved',
      title: 'Agreement Status Update',
      message: `Admin has ${approved ? 'approved' : 'rejected'} your agreement with ${contractorUser ? contractorUser.name : 'Unknown'}.`,
      referenceId: agreement._id,
      referenceType: 'agreement'
    });

    await farmerNotification.save();

    const contractorNotification = new Notification({
      userId: agreement.contractor.toString(),
      senderId: req.user.userId,
      type: 'agreement_approved',
      title: 'Agreement Status Update',
      message: `Admin has ${approved ? 'approved' : 'rejected'} your agreement with ${farmerUser ? farmerUser.name : 'Unknown'}.`,
      referenceId: agreement._id,
      referenceType: 'agreement'
    });

    await contractorNotification.save();

    // Emit real-time notifications if users are online
    if (req.app && req.app.get('io')) {
      const io = req.app.get('io');
      io.to(agreement.farmer.toString()).emit('notification:new', farmerNotification);
      io.to(agreement.contractor.toString()).emit('notification:new', contractorNotification);
    }

    const action = approved ? 'approved' : 'rejected';
    res.status(200).json({
      status: 'success',
      message: `Agreement ${action} successfully`,
      data: { agreement }
    });
  } catch (error) {
    console.error('Approve agreement error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while approving agreement'
    });
  }
};

// Get mock payments
const getPayments = async (req, res) => {
  try {
    // Mock payment data
    const payments = [
      {
        id: 'PAY001',
        amount: 2500,
        status: 'completed',
        type: 'advance_payment',
        date: '2024-01-15',
        userId: 'user123'
      },
      {
        id: 'PAY002',
        amount: 1800,
        status: 'pending',
        type: 'installment',
        date: '2024-01-16',
        userId: 'user456'
      },
      {
        id: 'PAY003',
        amount: 3200,
        status: 'completed',
        type: 'final_payment',
        date: '2024-01-17',
        userId: 'user789'
      },
      {
        id: 'PAY004',
        amount: 1500,
        status: 'failed',
        type: 'advance_payment',
        date: '2024-01-18',
        userId: 'user101'
      }
    ];

    res.status(200).json({
      status: 'success',
      data: { payments }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching payments'
    });
  }
};

// Get fraud alerts
const getFraudAlerts = async (req, res) => {
  try {
    if (!FraudAlert) {
      return res.status(500).json({
        status: 'error',
        message: 'FraudAlert model not available'
      });
    }

    const fraudAlerts = await FraudAlert.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      status: 'success',
      data: { fraudAlerts }
    });
  } catch (error) {
    console.error('Get fraud alerts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching fraud alerts'
    });
  }
};

// Get analytics data
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    
    let activeAgreements = 0;
    let completedContracts = 0;
    
    if (Agreement) {
      activeAgreements = await Agreement.countDocuments({ status: 'active' });
      completedContracts = await Agreement.countDocuments({ status: 'completed' });
    }
    
    // Calculate average rating (mock data)
    const averageRating = 4.2;

    const analytics = {
      totalUsers,
      verifiedUsers,
      activeAgreements,
      completedContracts,
      averageRating
    };

    res.status(200).json({
      status: 'success',
      data: { analytics }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching analytics'
    });
  }
};

module.exports = {
  getAllUsers,
  verifyUser,
  blockUser,
  getAllAgreements,
  approveAgreement,
  getPayments,
  getFraudAlerts,
  getAnalytics
};