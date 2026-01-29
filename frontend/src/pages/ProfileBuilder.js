import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../services/api';

const ProfileBuilder = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'farmer';
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login page if not logged in
      navigate('/login');
    }
  }, [navigate]);
  
  const cropOptions = [
    'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Soybean', 'Groundnut', 'Mustard', 'Barley', 'Millet',
    'Pulses', 'Chickpea', 'Lentil', 'Pigeon Pea', 'Black Gram', 'Green Gram', 'Horse Gram', 'Cowpea',
    'Vegetables', 'Fruits', 'Spices', 'Tea', 'Coffee', 'Coconut', 'Rubber', 'Jute', 'Tobacco', 'Other'
  ];

  // Tag input state for crops
  const [cropInput, setCropInput] = useState('');
  const [contractorCropInput, setContractorCropInput] = useState('');
  
  const [farmerData, setFarmerData] = useState({
    landSize: '',
    landLocation: '',
    cropsGrown: [],
    experience: '',
    seasons: [],
    profileImage: ''
  });
  
  const [contractorData, setContractorData] = useState({
    companyName: '',
    companyLocation: '',
    cropDemand: [],
    contractPreferences: '',
    profileImage: ''
  });
  
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info'); // 'info', 'success', 'error'
  const [imagePreview, setImagePreview] = useState('/api/placeholder/100/100');
  const [uploading, setUploading] = useState(false);

  const handleFarmerChange = (e) => {
    const { name, value } = e.target;
    setFarmerData({
      ...farmerData,
      [name]: value
    });
  };

  const handleContractorChange = (e) => {
    const { name, value } = e.target;
    setContractorData({
      ...contractorData,
      [name]: value
    });
  };

  // Tag-based crop selection logic
  const handleAddCrop = (crop, type) => {
    if (type === 'farmer') {
      if (!farmerData.cropsGrown.includes(crop)) {
        setFarmerData({ ...farmerData, cropsGrown: [...farmerData.cropsGrown, crop] });
      }
      setCropInput('');
    } else if (type === 'contractor') {
      if (!contractorData.cropDemand.includes(crop)) {
        setContractorData({ ...contractorData, cropDemand: [...contractorData.cropDemand, crop] });
      }
      setContractorCropInput('');
    }
  };

  const handleRemoveCrop = (crop, type) => {
    if (type === 'farmer') {
      setFarmerData({ ...farmerData, cropsGrown: farmerData.cropsGrown.filter(c => c !== crop) });
    } else if (type === 'contractor') {
      setContractorData({ ...contractorData, cropDemand: contractorData.cropDemand.filter(c => c !== crop) });
    }
  };

  const handleSeasonChange = (season) => {
    const updatedSeasons = farmerData.seasons.includes(season)
      ? farmerData.seasons.filter(s => s !== season)
      : [...farmerData.seasons, season];
    
    setFarmerData({
      ...farmerData,
      seasons: updatedSeasons
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create profile data without profileImage field
      const profileData = userRole === 'farmer' 
        ? {
            landSize: farmerData.landSize,
            landLocation: farmerData.landLocation,
            cropsGrown: farmerData.cropsGrown,
            experience: farmerData.experience,
            seasons: farmerData.seasons
          }
        : {
            companyName: contractorData.companyName,
            companyLocation: contractorData.companyLocation,
            cropDemand: contractorData.cropDemand,
            contractPreferences: contractorData.contractPreferences
          };
      
      // Call the actual API based on user role
      if (userRole === 'farmer') {
        await profileAPI.createFarmerProfile(profileData);
      } else {
        await profileAPI.createContractorProfile(profileData);
      }
      
      // If profile image was selected, update it separately
      if (farmerData.profileImage || contractorData.profileImage) {
        const imageToUpload = farmerData.profileImage || contractorData.profileImage;
        await authAPI.updateProfileImage({ profileImage: imageToUpload });
      }
      
      // Mark profile as complete
      localStorage.setItem('profileComplete', 'true');
      
      setModalMessage('Profile completed successfully!');
      setModalType('success');
      setShowModal(true);
      
      // Navigate based on user role after a short delay
      setTimeout(() => {
        if (userRole === 'farmer') {
          navigate('/farmer-dashboard');
        } else {
          navigate('/contractor-dashboard');
        }
      }, 2000);
    } catch (error) {
      console.error('Profile save error:', error);
      if (error.response && error.response.data) {
        setModalMessage(error.response.data.message || 'Failed to save profile. Please try again.');
      } else {
        setModalMessage('Failed to save profile. Please try again.');
      }
      setModalType('error');
      setShowModal(true);
    }
  };

  const handleBack = () => {
    navigate('/'); // Or wherever appropriate
  };

  const seasons = ['Kharif', 'Rabi', 'Zaid'];

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    
    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Convert image to base64
    const base64Image = await convertToBase64(file);
    
    // Update form data based on user role
    if (userRole === 'farmer') {
      setFarmerData(prev => ({
        ...prev,
        profileImage: base64Image
      }));
    } else {
      setContractorData(prev => ({
        ...prev,
        profileImage: base64Image
      }));
    }
    
    setUploading(false);
  };
  
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  };
  
  return (
    <div className="profile-builder" style={{ paddingTop: '50px' }}>
      {/* Loading overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <p>Uploading image...</p>
          </div>
        </div>
      )}
      
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
                onClick={() => setShowModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="profile-container">
        <h2>Complete Your Profile</h2>
        <p className="subtitle">
          {userRole === 'farmer' 
            ? 'Please provide details about your farming experience and preferences.' 
            : 'Please provide details about your company and contract preferences.'}
        </p>
        
        <form onSubmit={handleSubmit} className="profile-form">
          {/* Profile Image Upload */}
          <div className="form-group">
            <label>Profile Image</label>
            <div className="flex items-center gap-4">
              <img 
                src={imagePreview || '/api/placeholder/100/100'} 
                alt="Profile Preview" 
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
              />
              <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                Select Image
              </label>
            </div>
          </div>
          {userRole === 'farmer' ? (
            <>
              <div className="form-group">
                <label htmlFor="landSize">Land Size (in acres/hectares)</label>
                <input
                  type="text"
                  id="landSize"
                  name="landSize"
                  value={farmerData.landSize}
                  onChange={handleFarmerChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="landLocation">Land Location</label>
                <input
                  type="text"
                  id="landLocation"
                  name="landLocation"
                  value={farmerData.landLocation}
                  onChange={handleFarmerChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Crops Grown</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0' }}>
                  {farmerData.cropsGrown.map((crop) => (
                    <span key={crop} style={{ background: '#e6f0fa', color: '#1a5dab', borderRadius: 16, padding: '4px 12px', display: 'flex', alignItems: 'center' }}>
                      {crop}
                      <button type="button" onClick={() => handleRemoveCrop(crop, 'farmer')} style={{ marginLeft: 6, background: 'none', border: 'none', color: '#1a5dab', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={cropInput}
                  onChange={e => setCropInput(e.target.value)}
                  placeholder="Type to search crops..."
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8 }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && cropInput.trim()) {
                      e.preventDefault();
                      handleAddCrop(cropInput.trim(), 'farmer');
                    }
                  }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {cropOptions.filter(crop => !farmerData.cropsGrown.includes(crop) && crop.toLowerCase().includes(cropInput.toLowerCase())).map(crop => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => handleAddCrop(crop, 'farmer')}
                      style={{ border: '1px dashed #bbb', borderRadius: 16, padding: '4px 12px', background: 'none', cursor: 'pointer' }}
                    >
                      {crop}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Preferred Seasons</label>
                <div className="checkbox-group">
                  {seasons.map(season => (
                    <label key={season} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={farmerData.seasons.includes(season)}
                        onChange={() => handleSeasonChange(season)}
                      />
                      {season}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="experience">Farming Experience (years)</label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={farmerData.experience}
                  onChange={handleFarmerChange}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="companyName">Company Name</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={contractorData.companyName}
                  onChange={handleContractorChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="companyLocation">Company Location</label>
                <input
                  type="text"
                  id="companyLocation"
                  name="companyLocation"
                  value={contractorData.companyLocation}
                  onChange={handleContractorChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Crop Demand</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0' }}>
                  {contractorData.cropDemand.map((crop) => (
                    <span key={crop} style={{ background: '#e6f0fa', color: '#1a5dab', borderRadius: 16, padding: '4px 12px', display: 'flex', alignItems: 'center' }}>
                      {crop}
                      <button type="button" onClick={() => handleRemoveCrop(crop, 'contractor')} style={{ marginLeft: 6, background: 'none', border: 'none', color: '#1a5dab', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={contractorCropInput}
                  onChange={e => setContractorCropInput(e.target.value)}
                  placeholder="Type to search crops..."
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8 }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && contractorCropInput.trim()) {
                      e.preventDefault();
                      handleAddCrop(contractorCropInput.trim(), 'contractor');
                    }
                  }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {cropOptions.filter(crop => !contractorData.cropDemand.includes(crop) && crop.toLowerCase().includes(contractorCropInput.toLowerCase())).map(crop => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => handleAddCrop(crop, 'contractor')}
                      style={{ border: '1px dashed #bbb', borderRadius: 16, padding: '4px 12px', background: 'none', cursor: 'pointer' }}
                    >
                      {crop}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="contractPreferences">Contract Preferences</label>
                <textarea
                  id="contractPreferences"
                  name="contractPreferences"
                  value={contractorData.contractPreferences}
                  onChange={handleContractorChange}
                  required
                />
              </div>
            </>
          )}
          
          <div className="form-actions">
            <button type="button" onClick={handleBack} className="back-button">
              Back
            </button>
            <button type="submit" className="submit-button">
              Complete Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileBuilder;