import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { profileAPI } from '../services/api';

const ProposalStatus = () => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [proposalStatus, setProposalStatus] = useState('under_review'); // under_review, accepted, needs_changes
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    // Simulate checking proposal status periodically
    const interval = setInterval(checkProposalStatus, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getUserProfile(userId);
      if (response.data && response.data.user) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkProposalStatus = () => {
    // Simulate status checking
    // In real implementation, this would call the backend API
    // For demo purposes, we'll simulate status changes
    const statuses = ['under_review', 'accepted', 'needs_changes'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Uncomment the line below to simulate status changes after some time
    // setProposalStatus(randomStatus);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'needs_changes':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'under_review':
        return t('proposal.status.underReview');
      case 'accepted':
        return t('proposal.status.accepted');
      case 'needs_changes':
        return t('proposal.status.needsChanges');
      default:
        return t('proposal.status.underReview');
    }
  };

  const handleGoToCommunication = () => {
    navigate(`/communication/${userId}`);
  };

  const handleBackToProfile = () => {
    navigate(`/user-profile/${userId}`);
  };

  const handleMakeChanges = () => {
    // Navigate back to proposal creation page to make changes
    navigate(`/proposal-create/${userId}`);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-xl text-gray-600">{t('profileDetail.loading')}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-xl text-red-600">{t('profileDetail.userNotFound')}</div>
      </div>
    );
  }

  const isFarmer = user.role?.toLowerCase() === 'farmer';
  const roleClass = isFarmer ? 'farmer' : 'contractor';
  const roleGradient = isFarmer ? 'from-green-500 to-green-600' : 'from-blue-500 to-blue-600';

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-8">
      <div className="max-w-2xl mx-auto px-6">
        <div className={`rounded-3xl p-10 text-center relative overflow-hidden bg-gradient-to-br ${roleGradient} text-white`}>
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          
          <div className="relative z-10">
            <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-bold shadow-lg ${isFarmer ? 'bg-green-400 bg-opacity-25' : 'bg-blue-400 bg-opacity-25'} border-4 border-white border-opacity-40`}>
              {getInitials(user.name)}
            </div>
            
            <h1 className="text-3xl font-bold mb-3">{user.name}</h1>
            <span className="inline-block px-6 py-2 rounded-full font-bold text-lg bg-white bg-opacity-25 backdrop-blur-sm">
              {user.role === 'farmer' ? t('profileDetail.farmer') : t('profileDetail.contractor')}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 mt-6 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {t('proposal.status.title')}
            </h2>
            
            <div className={`inline-block px-6 py-3 rounded-full font-bold text-lg border-2 ${getStatusColor(proposalStatus)}`}>
              {getStatusText(proposalStatus)}
            </div>
          </div>

          {proposalStatus === 'under_review' && (
            <div className="text-center mb-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">
                  {t('proposal.status.underReviewInfo.title')}
                </h3>
                <p className="text-yellow-700">
                  {t('proposal.status.underReviewInfo.message')}
                </p>
              </div>
              
              <div className="mt-6 text-gray-600">
                <p>{t('proposal.status.checkBackLater')}</p>
              </div>
            </div>
          )}

          {proposalStatus === 'accepted' && (
            <div className="text-center mb-8">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-green-800 mb-2">
                  {t('proposal.status.acceptedInfo.title')}
                </h3>
                <p className="text-green-700">
                  {t('proposal.status.acceptedInfo.message')}
                </p>
              </div>
              
              <button
                onClick={handleGoToCommunication}
                className="py-4 px-8 rounded-xl font-bold text-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 bg-gradient-to-r from-green-500 to-green-600 border-2 border-green-500 hover:from-green-600 hover:to-green-700"
              >
                {t('proposal.status.goToCommunication')}
              </button>
            </div>
          )}

          {proposalStatus === 'needs_changes' && (
            <div className="text-center mb-8">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-orange-800 mb-2">
                  {t('proposal.status.needsChangesInfo.title')}
                </h3>
                <p className="text-orange-700">
                  {t('proposal.status.needsChangesInfo.message')}
                </p>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleMakeChanges}
                  className="py-4 px-8 rounded-xl font-bold text-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 bg-gradient-to-r from-orange-500 to-orange-600 border-2 border-orange-500 hover:from-orange-600 hover:to-orange-700"
                >
                  {t('proposal.status.makeChanges')}
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleBackToProfile}
              className="py-3 px-6 rounded-xl font-bold text-gray-800 bg-gray-200 shadow hover:shadow-md transition-all duration-300 border-2 border-gray-300 hover:bg-gray-300"
            >
              {t('proposal.status.backToProfile')}
            </button>
            
            {proposalStatus !== 'under_review' && (
              <button
                onClick={() => window.location.reload()}
                className="py-3 px-6 rounded-xl font-bold text-blue-800 bg-blue-100 shadow hover:shadow-md transition-all duration-300 border-2 border-blue-300 hover:bg-blue-200"
              >
                {t('proposal.status.refreshStatus')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalStatus;