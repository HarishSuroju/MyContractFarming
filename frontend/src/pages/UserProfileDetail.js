import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { profileAPI, connectionAPI } from '../services/api';

const UserProfileDetail = () => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('UserProfileDetail mounted with userId:', userId);
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Validate userId format
      if (!userId || userId.length < 12) {
        console.log('Invalid user ID format:', userId);
        setError(t('profileDetail.userNotFound'));
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
        console.log('getUserProfile endpoint returned error, checking error type:', apiError.response?.data?.message);
        
        // If it's a specific error about user not found or not verified, set the error
        if (apiError.response?.data?.message?.includes('not found') || 
            apiError.response?.data?.message?.includes('not verified')) {
          setError(t('profileDetail.userNotFound'));
          setLoading(false);
          return;
        }
      }
      
      // Fallback: use the user directory API and filter for the specific user
      try {
        const directoryResponse = await profileAPI.getAllUsers();
        const foundUser = directoryResponse.data.data.users.find(u => 
          u.id?.toString().trim() === userId?.toString().trim() ||
          u._id?.toString().trim() === userId?.toString().trim()
        );
        
        if (foundUser) {
          setUser(foundUser);
        } else {
          console.log('User not found in directory. Looking for ID:', userId);
          console.log('Available users:', directoryResponse.data.data.users.map(u => ({id: u.id, name: u.name})).slice(0, 5));
          setError(t('profileDetail.userNotFound'));
        }
      } catch (directoryError) {
        console.error('Error fetching from directory:', directoryError);
        setError(t('profileDetail.userNotFound'));
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(t('profileDetail.userNotFound'));
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-yellow-400 text-2xl">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-400 text-2xl">★</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300 text-2xl">★</span>);
      }
    }
    return stars;
  };

  const handleConnect = () => {
    // Determine if current user is farmer or contractor
    const currentUserRole = localStorage.getItem('userRole');
    
    if (currentUserRole === 'farmer' && user.role === 'contractor') {
      // Flow 1: Farmer connects to Contractor
      navigate(`/farmer-contractor-connection/${userId}`);
    } else if (currentUserRole === 'contractor' && user.role === 'farmer') {
      // Flow 2: Contractor connects to Farmer
      navigate(`/contractor-interest/${userId}`);
    } else {
      // For same roles, use direct connection
      navigate(`/connection-request/${userId}`);
    }
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

  const isFarmer = user.role.toLowerCase() === 'farmer';
  const roleClass = isFarmer ? 'farmer' : 'contractor';
  const roleGradient = isFarmer ? 'from-green-500 to-green-600' : 'from-blue-500 to-blue-600';
  const roleBorder = isFarmer ? 'border-green-500' : 'border-blue-500';
  const roleBgHover = isFarmer ? 'hover:bg-green-600' : 'hover:bg-blue-600';
  const roleBorderHover = isFarmer ? 'hover:border-green-600' : 'hover:border-blue-600';

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Profile Header */}
        <div className={`profile-header rounded-t-3xl p-10 text-center relative overflow-hidden ${isFarmer ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'} text-white`}>
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          
          <div className="relative z-10">
            <div className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-bold shadow-lg ${isFarmer ? 'bg-green-400 bg-opacity-25' : 'bg-blue-400 bg-opacity-25'} border-4 border-white border-opacity-40`}>
              {getInitials(user.name)}
            </div>
            
            <h1 className="text-4xl font-bold mb-3">{user.name}</h1>
            <span className="inline-block px-6 py-2 rounded-full font-bold text-lg bg-white bg-opacity-25 backdrop-blur-sm">
              {user.role === 'farmer' ? t('profileDetail.farmer') : t('profileDetail.contractor')}
            </span>
            
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="flex gap-1">
                {renderStars(4.5)} {/* Assuming average rating for now */}
              </div>
              <span className="font-bold text-lg">4.5</span>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="-mt-10 relative z-10 px-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className={`rounded-2xl p-6 text-center shadow-lg ${isFarmer ? 'bg-green-50' : 'bg-blue-50'}`}>
              <div className={`text-4xl font-bold mb-2 ${isFarmer ? 'text-green-600' : 'text-blue-600'}`}>
                {user.role === 'Farmer' ? '12' : '8'} {/* Placeholder values */}
              </div>
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide opacity-70">
                {user.role === 'Farmer' ? t('profileDetail.contractsCompleted') : t('profileDetail.projectsCompleted')}
              </div>
            </div>
            
            <div className={`rounded-2xl p-6 text-center shadow-lg ${isFarmer ? 'bg-green-50' : 'bg-blue-50'}`}>
              <div className={`text-4xl font-bold mb-2 ${isFarmer ? 'text-green-600' : 'text-blue-600'}`}>
                4.5
              </div>
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide opacity-70">
                {t('profileDetail.averageRating')}
              </div>
            </div>
          </div>

          {/* Information Card */}
          <div className={`rounded-2xl p-8 mb-6 shadow-lg ${isFarmer ? 'bg-green-50' : 'bg-blue-50'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Common fields - Phone and Email hidden as requested */}
              
              {isFarmer ? (
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
                    <span className="text-lg font-bold">{(user.crops && user.crops.length > 0) ? user.crops.join(', ') : (user.profile?.cropsGrown && user.profile.cropsGrown.length > 0) ? user.profile.cropsGrown.join(', ') : 'Not specified'}</span>
                  </div>
                              
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">{t('profileDetail.experience')}</span>
                    <span className="text-lg font-bold">{user.experience || user.profile?.experience || t('profileDetail.notSpecified')}</span>
                  </div>
                              
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">{t('profileDetail.preferredSeasons')}</span>
                    <span className="text-lg font-bold">{(user.seasons && user.seasons.length > 0) ? user.seasons.join(', ') : user.season || user.profile?.seasons?.join(', ') || user.profile?.selectedSeason || t('profileDetail.notSpecified')}</span>
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
                    <span className="text-lg font-bold">{(user.cropDemand && user.cropDemand.length > 0) ? user.cropDemand.join(', ') : (user.crops && user.crops.length > 0) ? user.crops.join(', ') : (user.profile?.cropDemand && user.profile.cropDemand.length > 0) ? user.profile.cropDemand.join(', ') : 'Not specified'}</span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">{t('profileDetail.specialization')}</span>
                    <span className="text-lg font-bold">{user.specialization || user.profile?.contractPreferences || t('profileDetail.notSpecified')}</span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">{t('profileDetail.projectsCompleted')}</span>
                    <span className="text-lg font-bold">{user.projects || t('profileDetail.notSpecified')}</span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">{t('profileDetail.preferredSeasons')}</span>
                    <span className="text-lg font-bold">{(user.seasons && user.seasons.length > 0) ? user.seasons.join(', ') : user.season || user.profile?.seasons?.join(', ') || user.profile?.selectedSeason || t('profileDetail.notSpecified')}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Connect Button */}
          <button
            onClick={handleConnect}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border-2 ${isFarmer ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-500 hover:from-green-600 hover:to-green-700' : 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-500 hover:from-blue-600 hover:to-blue-700'}`}
          >
            {t('profileDetail.connectButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDetail;