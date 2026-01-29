import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../services/api';
import '../App.css';

const CropSelection = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'farmer';
  
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info'); // 'info', 'success', 'error'

  const seasons = ['Kharif', 'Rabi', 'Zaid'];
  const crops = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Potato', 'Tomato'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSeason || !selectedCrop) {
      setModalMessage('Please select both season and crop');
      setModalType('error');
      setShowModal(true);
      return;
    }
    
    try {
      // Update user's profile with selected crop and season
      if (userRole === 'farmer') {
        // First get the existing profile to preserve existing data
        try {
          const profileResponse = await profileAPI.getProfile();
          const existingProfile = profileResponse.data.data.profile;
                    
          // For farmers, we'll update their profile with selected crop/season
          // Combine with existing profile data to avoid validation errors
          const profileData = {
            landSize: existingProfile?.landSize || '',
            landLocation: existingProfile?.landLocation || '',
            cropsGrown: existingProfile?.cropsGrown || [],
            experience: existingProfile?.experience || 0,
            seasons: existingProfile?.seasons ? [...existingProfile.seasons, selectedSeason].filter((v, i, a) => a.indexOf(v) === i) : [selectedSeason],
            selectedCrop,
            selectedSeason
          };
                    
          await profileAPI.createFarmerProfile(profileData);
        } catch (err) {
          // If there's no existing profile, create with minimal required data
          const profileData = {
            landSize: '',
            landLocation: '',
            cropsGrown: [],
            experience: 0,
            seasons: [selectedSeason],
            selectedCrop,
            selectedSeason
          };
                    
          await profileAPI.createFarmerProfile(profileData);
        }
      } else {
        // For contractors, update their profile with selected crop/season
        try {
          const profileResponse = await profileAPI.getProfile();
          const existingProfile = profileResponse.data.data.profile;
                    
          // Combine with existing profile data to avoid validation errors
          const profileData = {
            companyName: existingProfile?.companyName || '',
            companyLocation: existingProfile?.companyLocation || '',
            cropDemand: existingProfile?.cropDemand || [],
            contractPreferences: existingProfile?.contractPreferences || '',
            seasons: existingProfile?.seasons ? [...existingProfile.seasons, selectedSeason].filter((v, i, a) => a.indexOf(v) === i) : [selectedSeason],
            selectedCrop,
            selectedSeason
          };
                    
          await profileAPI.createContractorProfile(profileData);
        } catch (err) {
          // If there's no existing profile, create with minimal required data
          const profileData = {
            companyName: '',
            companyLocation: '',
            cropDemand: [],
            contractPreferences: '',
            seasons: [selectedSeason],
            selectedCrop,
            selectedSeason
          };
                    
          await profileAPI.createContractorProfile(profileData);
        }
      }
      
      // Store selections in localStorage for demo purposes
      localStorage.setItem('selectedSeason', selectedSeason);
      localStorage.setItem('selectedCrop', selectedCrop);
      
      // Navigate to user matching page
      navigate('/user-matching');
    } catch (error) {
      console.error('Error updating profile with crop/season:', error);
      setModalMessage('Failed to save crop and season preferences. Please try again.');
      setModalType('error');
      setShowModal(true);
    }
  };

  const handleBack = () => {
    if (userRole === 'farmer') {
      navigate('/farmer-dashboard');
    } else {
      navigate('/contractor-dashboard');
    }
  };
  
  // Update profile when component mounts to ensure crop/season are saved
  useEffect(() => {
    const updateProfileWithDefaults = async () => {
      try {
        // Ensure user has a basic profile to store preferences
        if (userRole === 'farmer') {
          // Get existing profile first to avoid overwriting data
          try {
            const profileResponse = await profileAPI.getProfile();
            const existingProfile = profileResponse.data.data.profile;
            
            const profileData = {
              landSize: existingProfile?.landSize || '',
              landLocation: existingProfile?.landLocation || '',
              cropsGrown: existingProfile?.cropsGrown || [],
              experience: existingProfile?.experience || 0,
              seasons: existingProfile?.seasons || [],
              selectedCrop: existingProfile?.selectedCrop,
              selectedSeason: existingProfile?.selectedSeason
            };
            await profileAPI.createFarmerProfile(profileData);
          } catch (err) {
            // If no profile exists yet, create with defaults
            const profileData = {
              landSize: '',
              landLocation: '',
              cropsGrown: [],
              experience: 0,
              seasons: [],
              selectedCrop: null,
              selectedSeason: null
            };
            await profileAPI.createFarmerProfile(profileData);
          }
        } else {
          // Get existing profile first to avoid overwriting data
          try {
            const profileResponse = await profileAPI.getProfile();
            const existingProfile = profileResponse.data.data.profile;
            
            const profileData = {
              companyName: existingProfile?.companyName || '',
              companyLocation: existingProfile?.companyLocation || '',
              cropDemand: existingProfile?.cropDemand || [],
              contractPreferences: existingProfile?.contractPreferences || '',
              seasons: existingProfile?.seasons || [],
              selectedCrop: existingProfile?.selectedCrop,
              selectedSeason: existingProfile?.selectedSeason
            };
            await profileAPI.createContractorProfile(profileData);
          } catch (err) {
            // If no profile exists yet, create with defaults
            const profileData = {
              companyName: '',
              companyLocation: '',
              cropDemand: [],
              contractPreferences: '',
              seasons: [],
              selectedCrop: null,
              selectedSeason: null
            };
            await profileAPI.createContractorProfile(profileData);
          }
        }
      } catch (error) {
        // Ignore errors
      }
    };
    
    updateProfileWithDefaults();
  }, [userRole]);

  return (
    <div className="crop-selection" style={{ paddingTop: '50px' }}>
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
      
      <div className="selection-container">
        <h2>Select Crop and Season</h2>
        <p className="subtitle">
          {userRole === 'farmer' 
            ? 'Choose the crop and season you want to grow' 
            : 'Choose the crop and season you need farmers for'}
        </p>
        
        <form onSubmit={handleSubmit} className="selection-form">
          <div className="form-group">
            <label htmlFor="season">Select Season</label>
            <select
              id="season"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              required
            >
              <option value="">-- Select Season --</option>
              {seasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="crop">Select Crop</label>
            <select
              id="crop"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              required
            >
              <option value="">-- Select Crop --</option>
              {crops.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={handleBack} className="back-button">
              Back
            </button>
            <button type="submit" className="submit-button">
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CropSelection;