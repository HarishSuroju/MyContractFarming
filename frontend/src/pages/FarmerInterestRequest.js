import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { profileAPI } from '../services/api';

const FarmerInterestRequest = () => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('FarmerInterestRequest mounted with userId:', userId);
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Validate userId format
      if (!userId || userId.length < 12) {
        console.log('Invalid user ID format:', userId);
        setError('Invalid user ID');
        setLoading(false);
        return;
      }
      
      // First try to get the user with the dedicated endpoint
      try {
        const response = await profileAPI.getUserProfile(userId);
        if (response.data && response.data.user) {
          setUser(response.data.user);
          return;
        }
      } catch (apiError) {
        console.log('getUserProfile endpoint not available, falling back to directory lookup');
        console.log('API Error:', apiError.message);
      }
      
      // Fallback: use the user directory API and filter for the specific user
      const directoryResponse = await profileAPI.getAllUsers();
      const foundUser = directoryResponse.data.data.users.find(u => 
        u.id?.toString().trim() === userId?.toString().trim() ||
        u._id?.toString().trim() === userId?.toString().trim()
      );
      
      if (foundUser) {
        setUser(foundUser);
      } else {
        console.log('User not found. Looking for ID:', userId);
        console.log('Available users:', directoryResponse.data.data.users.map(u => ({id: u.id, name: u.name})).slice(0, 5));
        setError('User not found');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = () => {
    // In real implementation, this would send the interest request to the backend
    console.log('Sending interest request to farmer:', user);
    
    // Redirect to proposal creation page
    navigate(`/proposal-create/${userId}`);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-xl text-gray-600">{t('profileDetail.loading')}</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-xl text-red-600">{error || t('profileDetail.userNotFound')}</div>
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
              {t('interest.request.title')}
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-700">
                {t('interest.request.description')}
              </p>
            </div>
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
              className="py-4 px-8 rounded-xl font-bold text-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 bg-gradient-to-r from-green-500 to-green-600 border-2 border-green-500 hover:from-green-600 hover:to-green-700"
            >
              {t('interest.request.sendButton')}
            </button>
            
            <button
              onClick={handleCancel}
              className="py-4 px-8 rounded-xl font-bold text-lg text-gray-800 bg-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border-2 border-gray-300 hover:bg-gray-300"
            >
              {t('interest.request.cancelButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerInterestRequest;