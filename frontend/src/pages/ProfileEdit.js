import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authAPI, profileAPI } from '../services/api';

const ProfileEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'farmer';
  
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info'); // 'info', 'success', 'error'

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch user and profile data
        const userProfileResponse = await authAPI.getProfile();
        setUser(userProfileResponse.data.data.user);
        
        const profileResponse = await profileAPI.getProfile();
        setProfile(profileResponse.data.data.profile);
        
        // Initialize form data based on user role
        if (profileResponse.data.data.profile) {
          if (userRole === 'farmer') {
            setFormData({
              landSize: profileResponse.data.data.profile.landSize || '',
              landLocation: profileResponse.data.data.profile.landLocation || '',
              cropsGrown: profileResponse.data.data.profile.cropsGrown || [],
              experience: profileResponse.data.data.profile.experience || '',
              seasons: profileResponse.data.data.profile.seasons || []
            });
          } else {
            setFormData({
              companyName: profileResponse.data.data.profile.companyName || '',
              companyLocation: profileResponse.data.data.profile.companyLocation || '',
              cropDemand: profileResponse.data.data.profile.cropDemand || [],
              contractPreferences: profileResponse.data.data.profile.contractPreferences || ''
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
        setModalMessage('Failed to load profile data. Please try again.');
        setModalType('error');
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userRole]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const cropOptions = [
    'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Soybean', 'Groundnut', 'Mustard', 'Barley', 'Millet',
    'Pulses', 'Chickpea', 'Lentil', 'Pigeon Pea', 'Black Gram', 'Green Gram', 'Horse Gram', 'Cowpea',
    'Vegetables', 'Fruits', 'Spices', 'Tea', 'Coffee', 'Coconut', 'Rubber', 'Jute', 'Tobacco', 'Other'
  ];

  // Tag-based crop selection logic for farmers
  const [cropInput, setCropInput] = useState('');
  const handleAddCrop = (crop) => {
    if (!formData.cropsGrown.includes(crop)) {
      setFormData({ 
        ...formData, 
        cropsGrown: [...formData.cropsGrown, crop] 
      });
    }
    setCropInput('');
  };

  const handleRemoveCrop = (cropToRemove) => {
    setFormData({ 
      ...formData, 
      cropsGrown: formData.cropsGrown.filter(crop => crop !== cropToRemove) 
    });
  };

  // Tag-based crop selection logic for contractors
  const [contractorCropInput, setContractorCropInput] = useState('');
  const handleAddContractorCrop = (crop) => {
    if (!formData.cropDemand.includes(crop)) {
      setFormData({ 
        ...formData, 
        cropDemand: [...formData.cropDemand, crop] 
      });
    }
    setContractorCropInput('');
  };

  const handleRemoveContractorCrop = (cropToRemove) => {
    setFormData({ 
      ...formData, 
      cropDemand: formData.cropDemand.filter(crop => crop !== cropToRemove) 
    });
  };

  const handleSeasonChange = (season) => {
    const updatedSeasons = formData.seasons.includes(season)
      ? formData.seasons.filter(s => s !== season)
      : [...formData.seasons, season];
    
    setFormData({
      ...formData,
      seasons: updatedSeasons
    });
  };

  const seasons = ['Kharif', 'Rabi', 'Zaid'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Create profile data without profileImage field
      const profileData = userRole === 'farmer' 
        ? {
            landSize: formData.landSize,
            landLocation: formData.landLocation,
            cropsGrown: formData.cropsGrown,
            experience: formData.experience,
            seasons: formData.seasons
          }
        : {
            companyName: formData.companyName,
            companyLocation: formData.companyLocation,
            cropDemand: formData.cropDemand,
            contractPreferences: formData.contractPreferences
          };
      
      // Call the update API based on user role
      if (userRole === 'farmer') {
        await profileAPI.createFarmerProfile(profileData);
      } else {
        await profileAPI.createContractorProfile(profileData);
      }
      
      setModalMessage('Profile updated successfully!');
      setModalType('success');
      setShowModal(true);
      
      // Navigate back to profile page after a short delay
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error('Profile update error:', error);
      if (error.response && error.response.data) {
        setModalMessage(error.response.data.message || 'Failed to update profile. Please try again.');
      } else {
        setModalMessage('Failed to update profile. Please try again.');
      }
      setModalType('error');
      setShowModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="min-h-full w-full p-6 bg-gray-50 pt-16">
        <div className="max-w-3xl mx-auto">
          <div className="auth-container">
            <div className="loading">{t('profilePage.loading')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full p-6 bg-gray-50 pt-16">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-lg shadow-xl w-full max-w-md p-6 ${modalType === 'success' ? 'border-t-4 border-green-500' : modalType === 'error' ? 'border-t-4 border-red-500' : 'border-t-4 border-blue-500'}`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${modalType === 'success' ? 'bg-green-100' : modalType === 'error' ? 'bg-red-100' : 'bg-blue-100'}`}>
                {modalType === 'success' ? (
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : modalType === 'error' ? (
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalType === 'success' ? 'Success!' : modalType === 'error' ? 'Error!' : 'Info'}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {modalMessage}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                onClick={() => {
                  setShowModal(false);
                  if (modalType === 'success') {
                    navigate('/profile');
                  }
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Page Title */}
        <h1 id="page-title" className="mb-8" style={{ fontWeight: 700, fontSize: '32px' }}>
          {t('profileEdit.title') || 'Edit Profile'}
        </h1>
          
        {/* Account Information Section */}
        <div className="profile-card rounded-xl p-6 mb-6 bg-white shadow-lg">
          <div className="section-header">
            <h2 id="account-section-title" style={{ fontWeight: 700, fontSize: '22px' }}>
              {t('profileEdit.accountInfoTitle') || 'Account Information'}
            </h2>
          </div>
          <div>
            {user && (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className="info-row" id="name-row">
                    <span className="info-label">{t('profilePage.nameLabel') || 'Name'}:</span>
                    <span className="info-value" id="user-name">{user.name}</span>
                  </div>
                  <div className="info-row" id="email-row">
                    <span className="info-label">{t('profilePage.emailLabel') || 'Email'}:</span>
                    <span className="info-value" id="user-email">{user.email}</span>
                  </div>
                </div>
                <div className="info-row" id="phone-row">
                  <span className="info-label">{t('profilePage.phoneLabel') || 'Phone'}:</span>
                  <span className="info-value" id="user-phone">{user.phone}</span>
                </div>
                <div className="info-row" id="role-row">
                  <span className="info-label">{t('profilePage.roleLabel') || 'Role'}:</span>
                  <span className="info-value" id="user-role">{user.role === 'farmer' ? (t('profilePage.farmer') || 'Farmer') : (t('profilePage.contractor') || 'Contractor')}</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Profile Edit Form */}
        <div className="profile-card rounded-xl p-6 bg-white shadow-lg">
          <h2 id="edit-section-title" className="mb-5" style={{ fontWeight: 700, fontSize: '22px' }}>
            {userRole === 'farmer' ? (t('profileEdit.farmerProfile') || 'Farmer Profile') : (t('profileEdit.contractorProfile') || 'Contractor Profile')}
          </h2>
          
          <form onSubmit={handleSubmit}>
            {userRole === 'farmer' ? (
              <>
                <div className="form-group mb-4">
                  <label htmlFor="landSize" className="block mb-2 font-medium">
                    {t('profilePage.landSizeLabel') || 'Land Size (in acres/hectares)'}
                  </label>
                  <input
                    type="text"
                    id="landSize"
                    name="landSize"
                    value={formData.landSize}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div className="form-group mb-4">
                  <label htmlFor="landLocation" className="block mb-2 font-medium">
                    {t('profilePage.landLocationLabel') || 'Land Location'}
                  </label>
                  <input
                    type="text"
                    id="landLocation"
                    name="landLocation"
                    value={formData.landLocation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div className="form-group mb-4">
                  <label className="block mb-2 font-medium">
                    {t('profilePage.cropsGrownLabel') || 'Crops Grown'}
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0' }}>
                    {formData.cropsGrown.map((crop) => (
                      <span key={crop} style={{ background: '#e6f0fa', color: '#1a5dab', borderRadius: 16, padding: '4px 12px', display: 'flex', alignItems: 'center' }}>
                        {crop}
                        <button type="button" onClick={() => handleRemoveCrop(crop)} style={{ marginLeft: 6, background: 'none', border: 'none', color: '#1a5dab', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={cropInput}
                    onChange={e => setCropInput(e.target.value)}
                    placeholder={t('profileEdit.searchCropsPlaceholder') || 'Type to search crops...'}
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8 }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && cropInput.trim()) {
                        e.preventDefault();
                        handleAddCrop(cropInput.trim());
                      }
                    }}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {cropOptions.filter(crop => !formData.cropsGrown.includes(crop) && crop.toLowerCase().includes(cropInput.toLowerCase())).map(crop => (
                      <button
                        key={crop}
                        type="button"
                        onClick={() => handleAddCrop(crop)}
                        style={{ border: '1px dashed #bbb', borderRadius: 16, padding: '4px 12px', background: 'none', cursor: 'pointer' }}
                      >
                        {crop}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="form-group mb-4">
                  <label className="block mb-2 font-medium">
                    {t('profilePage.preferredSeasonsLabel') || 'Preferred Seasons'}
                  </label>
                  <div className="checkbox-group">
                    {seasons.map(season => (
                      <label key={season} className="checkbox-label inline-flex items-center mr-4">
                        <input
                          type="checkbox"
                          checked={formData.seasons.includes(season)}
                          onChange={() => handleSeasonChange(season)}
                          className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        {season}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="form-group mb-4">
                  <label htmlFor="experience" className="block mb-2 font-medium">
                    {t('profilePage.experienceLabel') || 'Farming Experience (years)'}
                  </label>
                  <input
                    type="number"
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group mb-4">
                  <label htmlFor="companyName" className="block mb-2 font-medium">
                    {t('profilePage.companyNameLabel') || 'Company Name'}
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="form-group mb-4">
                  <label htmlFor="companyLocation" className="block mb-2 font-medium">
                    {t('profilePage.companyLocationLabel') || 'Company Location'}
                  </label>
                  <input
                    type="text"
                    id="companyLocation"
                    name="companyLocation"
                    value={formData.companyLocation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="form-group mb-4">
                  <label className="block mb-2 font-medium">
                    {t('profilePage.cropDemandLabel') || 'Crop Demand'}
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0' }}>
                    {formData.cropDemand.map((crop) => (
                      <span key={crop} style={{ background: '#e6f0fa', color: '#1a5dab', borderRadius: 16, padding: '4px 12px', display: 'flex', alignItems: 'center' }}>
                        {crop}
                        <button type="button" onClick={() => handleRemoveContractorCrop(crop)} style={{ marginLeft: 6, background: 'none', border: 'none', color: '#1a5dab', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={contractorCropInput}
                    onChange={e => setContractorCropInput(e.target.value)}
                    placeholder={t('profileEdit.searchCropsPlaceholder') || 'Type to search crops...'}
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8 }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && contractorCropInput.trim()) {
                        e.preventDefault();
                        handleAddContractorCrop(contractorCropInput.trim());
                      }
                    }}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {cropOptions.filter(crop => !formData.cropDemand.includes(crop) && crop.toLowerCase().includes(contractorCropInput.toLowerCase())).map(crop => (
                      <button
                        key={crop}
                        type="button"
                        onClick={() => handleAddContractorCrop(crop)}
                        style={{ border: '1px dashed #bbb', borderRadius: 16, padding: '4px 12px', background: 'none', cursor: 'pointer' }}
                      >
                        {crop}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="form-group mb-4">
                  <label htmlFor="contractPreferences" className="block mb-2 font-medium">
                    {t('profilePage.contractPreferencesLabel') || 'Contract Preferences'}
                  </label>
                  <textarea
                    id="contractPreferences"
                    name="contractPreferences"
                    value={formData.contractPreferences}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    required
                  />
                </div>
              </>
            )}
            
            {/* Action Buttons */}
            <div className="action-buttons flex gap-4 mt-8">
              <button 
                type="button"
                id="cancel-btn" 
                className="action-btn flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-semibold text-base hover:bg-gray-50 transition-all duration-200"
                onClick={handleCancel}
                disabled={saving}
              >
                <span id="cancel-button-text">{t('profileEdit.cancel') || 'Cancel'}</span>
              </button>
              
              <button 
                type="submit"
                id="save-btn" 
                className={`action-btn flex-1 py-3 px-4 border border-green-500 bg-green-500 text-white rounded-lg font-semibold text-base hover:bg-green-600 hover:border-green-600 transition-all duration-200 ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={saving}
              >
                <span id="save-button-text">{saving ? (t('profileEdit.saving') || 'Saving...') : (t('profileEdit.save') || 'Save Changes')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;