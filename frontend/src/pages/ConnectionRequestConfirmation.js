import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { profileAPI } from '../services/api';

const ConnectionRequestConfirmation = () => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
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

  const handleSendRequest = async () => {
    try {
      // Simulate sending connection request
      // In real implementation, this would call the backend API
      console.log('Sending connection request to:', user);
      
      // Redirect to request status page
      navigate(`/connection-status/${userId}`);
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleCancel = () => {
    // Go back to the previous page
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-xl text-red-600">User not found</div>
      </div>
    );
  }

  const isFarmer = user.role?.toLowerCase() === 'farmer';
  const roleClass = isFarmer ? 'farmer' : 'contractor';
  const roleGradient = isFarmer ? 'from-green-500 to-green-600' : 'from-blue-500 to-blue-600';

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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
              {t('connection.confirmation.title')}
            </h2>
            <p className="text-gray-600 text-lg">
              {t('connection.confirmation.message', { name: user.name })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {user.role === 'farmer' ? (
              <>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-60">{t('profileDetail.landLocation')}</span>
                  <span className="text-lg font-bold">{user.location || user.profile?.landLocation || t('profileDetail.notSpecified')}</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-60">{t('profileDetail.landSize')}</span>
                  <span className="text-lg font-bold">{user.landSize || user.profile?.landSize || t('profileDetail.notSpecified')}</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-60">{t('profileDetail.cropsGrown')}</span>
                  <span className="text-lg font-bold">{(user.crops && user.crops.length > 0) ? user.crops.join(', ') : (user.profile?.cropsGrown && user.profile.cropsGrown.length > 0) ? user.profile.cropsGrown.join(', ') : t('profileDetail.notSpecified')}</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-60">{t('profileDetail.experience')}</span>
                  <span className="text-lg font-bold">{user.experience || user.profile?.experience || t('profileDetail.notSpecified')}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-60">{t('profileDetail.companyName')}</span>
                  <span className="text-lg font-bold">{user.company || user.profile?.companyName || t('profileDetail.notSpecified')}</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-60">{t('profileDetail.companyLocation')}</span>
                  <span className="text-lg font-bold">{user.location || user.profile?.companyLocation || t('profileDetail.notSpecified')}</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-60">{t('profileDetail.cropsDemanded')}</span>
                  <span className="text-lg font-bold">{(user.cropDemand && user.cropDemand.length > 0) ? user.cropDemand.join(', ') : (user.crops && user.crops.length > 0) ? user.crops.join(', ') : (user.profile?.cropDemand && user.profile.cropDemand.length > 0) ? user.profile.cropDemand.join(', ') : t('profileDetail.notSpecified')}</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-60">{t('profileDetail.specialization')}</span>
                  <span className="text-lg font-bold">{user.specialization || user.profile?.contractPreferences || t('profileDetail.notSpecified')}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSendRequest}
              className={`py-4 px-8 rounded-xl font-bold text-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 bg-gradient-to-r from-green-500 to-green-600 border-2 border-green-500 hover:from-green-600 hover:to-green-700`}
            >
              {t('connection.confirmation.sendRequest')}
            </button>
            
            <button
              onClick={handleCancel}
              className={`py-4 px-8 rounded-xl font-bold text-lg text-gray-800 bg-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border-2 border-gray-300 hover:bg-gray-300`}
            >
              {t('connection.confirmation.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionRequestConfirmation;