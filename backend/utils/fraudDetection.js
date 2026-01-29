const { Agreement } = require('../models/Agreement');
const { FraudAlert } = require('../models/FraudAlert');

/**
 * Generic helper to persist a fraud alert that can be reviewed by admins.
 */
const logFraudAlert = async ({ userId, type, severity = 'low', title, description, context = {} }) => {
  try {
    await FraudAlert.create({
      userId,
      type,
      severity,
      title,
      description,
      context
    });
  } catch (err) {
    // Avoid breaking main request flow due to logging failure
    console.error('Failed to log fraud alert:', err);
  }
};

/**
 * Detects a spike in agreement rejections for a user over the last 24 hours.
 */
const detectAgreementRejectionSpike = async (userId) => {
  const windowMs = 24 * 60 * 60 * 1000; // 24 hours
  const threshold = 3;
  const since = new Date(Date.now() - windowMs);

  const rejectionCount = await Agreement.countDocuments({
    status: 'rejected',
    updatedAt: { $gte: since },
    $or: [
      { farmer: userId },
      { contractor: userId }
    ]
  });

  if (rejectionCount >= threshold) {
    await logFraudAlert({
      userId,
      type: 'agreement_rejection_spike',
      severity: 'medium',
      title: 'Unusual number of agreement rejections',
      description: `User has ${rejectionCount} rejected agreements in the last 24 hours.`,
      context: {
        rejectionCount,
        windowHours: 24
      }
    });
  }
};

/**
 * Detect abnormal rating behaviour: repeated extreme ratings in a short window.
 * Extreme ratings are defined as <= 2 or >= 5.
 */
const detectAbnormalRatingBehaviour = async ({ userId, role, rating }) => {
  const isExtreme = rating <= 2 || rating >= 5;
  if (!isExtreme) return;

  const windowMs = 7 * 24 * 60 * 60 * 1000; // 7 days
  const since = new Date(Date.now() - windowMs);
  const threshold = 3;

  let query = { updatedAt: { $gte: since } };

  if (role === 'contractor') {
    // Contractor rates farmer -> stored in farmerRating
    query.contractor = userId;
    query.farmerRating = { $exists: true };
  } else if (role === 'farmer') {
    // Farmer rates contractor -> stored in contractorRating
    query.farmer = userId;
    query.contractorRating = { $exists: true };
  } else {
    return;
  }

  const extremeCount = await Agreement.countDocuments(query);

  if (extremeCount >= threshold) {
    await logFraudAlert({
      userId,
      type: 'rating_abnormal',
      severity: 'low',
      title: 'Abnormal rating behaviour detected',
      description: `User has submitted ${extremeCount} extreme ratings in the last 7 days.`,
      context: {
        role,
        extremeCount,
        windowDays: 7
      }
    });
  }
};

module.exports = {
  logFraudAlert,
  detectAgreementRejectionSpike,
  detectAbnormalRatingBehaviour
};

