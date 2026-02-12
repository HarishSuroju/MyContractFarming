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
        setProfileImage(userProfileResponse.data.data.user.profilePhoto);
        setImagePreview(userProfileResponse.data.data.user.profilePhoto || '/api/placeholder/150/150');
        
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
  
  const handleEditProfile = () => {
    navigate('/profile-edit');
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
  <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4">
    
    {/* Upload Modal */}
    {uploading && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl px-6 py-4 shadow-xl">
          <p className="text-gray-700 font-medium">Uploading image...</p>
        </div>
      </div>
    )}

    <div className="max-w-4xl mx-auto space-y-8">

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800">
        {t('profilePage.title')}
      </h1>

      {/* ================= ACCOUNT CARD ================= */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {t('profilePage.accountInfoTitle')}
          </h2>

          {isProfileComplete && (
            <button
              onClick={handleEditProfile}
              className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                userRole === 'farmer'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {t('profilePage.edit')}
            </button>
          )}
        </div>

        {user && (
          <>
            <div className="flex items-center gap-6 mb-6">

              {/* Profile Image */}
              <div className="relative">
                <img
                  src={imagePreview || '/api/placeholder/150/150'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                />
                <label className="absolute bottom-1 right-1 bg-green-500 text-white p-2 rounded-full cursor-pointer hover:bg-green-600 transition">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  ✎
                </label>
              </div>

              {/* User Info */}
              <div className="space-y-2">
                <p><span className="font-semibold text-gray-600">{t('profilePage.nameLabel')}:</span> {user.name}</p>
                <p><span className="font-semibold text-gray-600">{t('profilePage.emailLabel')}:</span> {user.email}</p>
                <p><span className="font-semibold text-gray-600">{t('profilePage.phoneLabel')}:</span> {user.phone}</p>
                <p>
                  <span className="font-semibold text-gray-600">{t('profilePage.roleLabel')}:</span>{' '}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === 'farmer'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role === 'farmer'
                      ? t('profilePage.farmer')
                      : t('profilePage.contractor')}
                  </span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ================= PROFILE DETAILS CARD ================= */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">

        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          {userRole === 'farmer'
            ? t('profilePage.farmerProfile')
            : t('profilePage.contractorProfile')}
        </h2>

        {profile ? (
          userRole === 'farmer' ? (
            <div className="grid md:grid-cols-2 gap-6 text-gray-700">
              <p><span className="font-semibold">{t('profilePage.landSizeLabel')}:</span> {profile.landSize}</p>
              <p><span className="font-semibold">{t('profilePage.landLocationLabel')}:</span> {profile.landLocation}</p>

              <div className="grid md:grid-cols-2 gap-6 text-gray-700">
                <p className="font-semibold text-gray-700 mb-2">
                  {t('profilePage.cropsGrownLabel')}:
                </p>

                <div className="flex flex-wrap gap-3">
                  {profile.cropsGrown?.map((crop, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium"
                    >
                      {crop}
                    </span>
                  ))}
                </div>
              </div>


              <p><span className="font-semibold">{t('profilePage.experienceLabel')}:</span> {profile.experience} {t('profilePage.years')}</p>
              <p><span className="font-semibold">{t('profilePage.preferredSeasonsLabel')}:</span> {profile.seasons?.join(', ')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 text-gray-700">
              <p><span className="font-semibold">{t('profilePage.companyNameLabel')}:</span> {profile.companyName}</p>
              <p><span className="font-semibold">{t('profilePage.companyLocationLabel')}:</span> {profile.companyLocation}</p>

              <div className="md:col-span-2">
                <span className="font-semibold">{t('profilePage.cropDemandLabel')}:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.cropDemand?.map((crop, i) => (
                    <span key={i} className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>

              <p className="md:col-span-2">
                <span className="font-semibold">{t('profilePage.contractPreferencesLabel')}:</span> {profile.contractPreferences}
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">{t('profilePage.noProfileMessage')}</p>
            <button
              onClick={handleCompleteProfile}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition"
            >
              {t('profilePage.completeProfile')}
            </button>
          </div>
        )}
      </div>

      {/* ================= ACTION BUTTONS ================= */}
      <div className="flex gap-4">
        <button
          onClick={handleBack}
          className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition"
        >
          {t('profilePage.back')}
        </button>

        <button
          onClick={handleLogout}
          className="flex-1 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
        >
          {t('profilePage.logout')}
        </button>
      </div>

    </div>
  </div>
);

};

export default ProfilePage;