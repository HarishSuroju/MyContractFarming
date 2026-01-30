import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authAPI, profileAPI } from '../services/api';
import '../App.css';

const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'farmer';
  
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');


  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch user and profile data
        const userProfileResponse = await authAPI.getProfile();
        setUser(userProfileResponse.data.data.user);
        // Set profile image from user data
        setProfileImage(userProfileResponse.data.data.user.profileImage);
        setImagePreview(userProfileResponse.data.data.user.profileImage || '/api/placeholder/150/150');
        
        const profileResponse = await profileAPI.getProfile();
        setProfile(profileResponse.data.data.profile);
        
        // Initialize form data based on user role
        if (profileResponse.data.data.profile) {
          if (userRole === 'farmer') {
            setFormData({
              landSize: profileResponse.data.data.profile.landSize || '',
              landLocation: profileResponse.data.data.profile.landLocation || '',
              cropsGrown: profileResponse.data.data.profile.cropsGrown || '',
              experience: profileResponse.data.data.profile.experience || '',
              seasons: profileResponse.data.data.profile.seasons || []
            });
          } else {
            setFormData({
              companyName: profileResponse.data.data.profile.companyName || '',
              companyLocation: profileResponse.data.data.profile.companyLocation || '',
              cropDemand: profileResponse.data.data.profile.cropDemand || '',
              contractPreferences: profileResponse.data.data.profile.contractPreferences || ''
            });
          }
        } else {
          // Initialize empty form for new profile
          if (userRole === 'farmer') {
            setFormData({
              landSize: '',
              landLocation: '',
              cropsGrown: '',
              experience: '',
              seasons: []
            });
          } else {
            setFormData({
              companyName: '',
              companyLocation: '',
              cropDemand: '',
              contractPreferences: ''
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userRole]);

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('profileComplete');
    navigate('/');
  };

  const handleCompleteProfile = () => {
    navigate('/profile-builder');
  };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true); // Show uploading indicator
    
    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Convert image to base64 and upload
    const base64Image = await convertToBase64(file);
    
    try {
      await authAPI.updateProfileImage({ profileImage: base64Image });
      setProfileImage(base64Image);
      //alert('Profile image updated successfully!');
    } catch (error) {
      console.error('Error updating profile image:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile image. Please try again.';
      alert(errorMessage);
    } finally {
      setUploading(false); // Hide uploading indicator
    }
  };
  
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  };



  if (loading) {
    return (
      <div className="profile-page" style={{ paddingTop: '50px' }}>
        <div className="auth-container">
          <div className="loading">{t('profilePage.loading')}</div>
        </div>
      </div>
    );
  }

  const isProfileComplete = !!profile;

  return (
    <div className="min-h-full w-full p-6 bg-gray-50 pt-16">
      {/* Modal for image upload feedback */}
      {(uploading) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <p>Uploading image...</p>
          </div>
        </div>
      )}
      <div className="max-w-3xl mx-auto">
        {/* Page Title */}
        <h1 id="page-title" className="mb-8" style={{ fontWeight: 700, fontSize: '32px' }}>
          {t('profilePage.title')}
        </h1>
          
        {/* Account Information Section */}
        <div className="profile-card rounded-xl p-6 mb-6 bg-white shadow-lg">
          <div className="section-header">
            <h2 id="account-section-title" style={{ fontWeight: 700, fontSize: '22px' }}>
              {t('profilePage.accountInfoTitle')}
            </h2>
            {isProfileComplete && (
              <button 
                id="edit-btn" 
                className={`edit-btn ${userRole === 'farmer' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white border-0`}
                onClick={handleCompleteProfile}
              >
                <span id="edit-button-text">{t('profilePage.edit')}</span>
              </button>
            )}
          </div>
          <div>
            {user && (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img 
                      src={imagePreview || '/api/placeholder/150/150'} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                    />
                    <label className="absolute bottom-0 right-0 bg-green-500 text-white p-1 rounded-full cursor-pointer hover:bg-green-600">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    </label>
                  </div>
                  <div>
                    <div className="info-row" id="name-row">
                      <span className="info-label">{t('profilePage.nameLabel')}:</span>
                      <span className="info-value" id="user-name">{user.name}</span>
                    </div>
                    <div className="info-row" id="email-row">
                      <span className="info-label">{t('profilePage.emailLabel')}:</span>
                      <span className="info-value" id="user-email">{user.email}</span>
                    </div>
                  </div>
                </div>
                <div className="info-row" id="phone-row">
                  <span className="info-label">{t('profilePage.phoneLabel')}:</span>
                  <span className="info-value" id="user-phone">{user.phone}</span>
                </div>
                <div className="info-row" id="role-row">
                  <span className="info-label">{t('profilePage.roleLabel')}:</span>
                  <span className="info-value" id="user-role">{user.role === 'farmer' ? t('profilePage.farmer') : t('profilePage.contractor')}</span>
                </div>
              </>
            )}
          </div>
        </div>
          
        {/* Profile Section */}
        <div className="profile-card rounded-xl p-6 bg-white shadow-lg">
          <h2 id="farmer-section-title" className="mb-5" style={{ fontWeight: 700, fontSize: '22px' }}>
            {userRole === 'farmer' ? t('profilePage.farmerProfile') : t('profilePage.contractorProfile')}
          </h2>
          <div>
            {profile ? (
              userRole === 'farmer' ? (
                <>
                  <div className="info-row" id="land-size-row">
                    <span className="info-label">{t('profilePage.landSizeLabel')}:</span>
                    <span className="info-value" id="land-size">{profile.landSize}</span>
                  </div>
                  <div className="info-row" id="land-location-row">
                    <span className="info-label">{t('profilePage.landLocationLabel')}:</span>
                    <span className="info-value" id="land-location">{profile.landLocation}</span>
                  </div>
                  <div className="info-row" id="crops-row">
                    <span className="info-label">{t('profilePage.cropsGrownLabel')}:</span>
                    <div className="info-value flex flex-wrap gap-2" id="crops-grown">
                      {Array.isArray(profile.cropsGrown) && profile.cropsGrown.length > 0 ? (
                        profile.cropsGrown.map((crop, index) => (
                          <span key={index} className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                            {crop}
                          </span>
                        ))
                      ) : (
                        <span>{profile.cropsGrown}</span>
                      )}
                    </div>
                  </div>
                  <div className="info-row" id="experience-row">
                    <span className="info-label">{t('profilePage.experienceLabel')}:</span>
                    <span className="info-value" id="experience">{profile.experience} {t('profilePage.years')}</span>
                  </div>
                  <div className="info-row" id="seasons-row">
                    <span className="info-label">{t('profilePage.preferredSeasonsLabel')}:</span>
                    <span className="info-value" id="preferred-seasons">{profile.seasons ? profile.seasons.join(', ') : t('profilePage.none')}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="info-row" id="land-size-row">
                    <span className="info-label">{t('profilePage.companyNameLabel')}:</span>
                    <span className="info-value" id="land-size">{profile.companyName}</span>
                  </div>
                  <div className="info-row" id="land-location-row">
                    <span className="info-label">{t('profilePage.companyLocationLabel')}:</span>
                    <span className="info-value" id="land-location">{profile.companyLocation}</span>
                  </div>
                  <div className="info-row" id="crops-row">
                    <span className="info-label">{t('profilePage.cropDemandLabel')}:</span>
                    <div className="info-value flex flex-wrap gap-2" id="crops-grown">
                      {Array.isArray(profile.cropDemand) && profile.cropDemand.length > 0 ? (
                        profile.cropDemand.map((crop, index) => (
                          <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                            {crop}
                          </span>
                        ))
                      ) : (
                        <span>{profile.cropDemand}</span>
                      )}
                    </div>
                  </div>
                  <div className="info-row" id="experience-row">
                    <span className="info-label">{t('profilePage.contractPreferencesLabel')}:</span>
                    <span className="info-value" id="experience">{profile.contractPreferences}</span>
                  </div>
                </>
              )
            ) : (
              <>
                <div className="info-row" id="no-profile-row">
                  <span className="info-value" id="no-profile-message">{t('profilePage.noProfileMessage')}</span>
                </div>
                <div className="form-actions" style={{ marginTop: '1rem' }}>
                  <button className="submit-button bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg" onClick={handleCompleteProfile}>
                    {t('profilePage.completeProfile')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
          
        {/* Action Buttons */}
        <div className="action-buttons flex gap-4 mt-8">
          <button 
            id="back-btn" 
            className="action-btn flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-semibold text-base hover:bg-gray-50 transition-all duration-200"
            onClick={handleBack}
          >
            <span id="back-button-text">{t('profilePage.back')}</span>
          </button>
          <button 
            id="logout-btn" 
            className="action-btn flex-1 py-3 px-4 border border-red-500 bg-red-500 text-white rounded-lg font-semibold text-base hover:bg-red-600 hover:border-red-600 transition-all duration-200"
            onClick={handleLogout}
          >
            <span id="logout-button-text">{t('profilePage.logout')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;