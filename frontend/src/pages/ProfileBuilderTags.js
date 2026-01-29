import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../services/api';

const cropOptions = [
  'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Soybean', 'Groundnut', 'Mustard', 'Barley', 'Millet',
  'Pulses', 'Chickpea', 'Lentil', 'Pigeon Pea', 'Black Gram', 'Green Gram', 'Horse Gram', 'Cowpea',
  'Vegetables', 'Fruits', 'Spices', 'Tea', 'Coffee', 'Coconut', 'Rubber', 'Jute', 'Tobacco', 'Other'
];

function TagInput({ label, suggestions, selected, setSelected }) {
  const [input, setInput] = useState('');
  const filteredSuggestions = suggestions.filter(
    (s) => !selected.includes(s) && s.toLowerCase().includes(input.toLowerCase())
  );

  const addTag = (tag) => {
    if (!selected.includes(tag)) {
      setSelected([...selected, tag]);
      setInput('');
    }
  };

  const removeTag = (tag) => {
    setSelected(selected.filter((t) => t !== tag));
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontWeight: 500 }}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0' }}>
        {selected.map((tag) => (
          <span key={tag} style={{ background: '#e6f0fa', color: '#1a5dab', borderRadius: 16, padding: '4px 12px', display: 'flex', alignItems: 'center' }}>
            {tag}
            <button type="button" onClick={() => removeTag(tag)} style={{ marginLeft: 6, background: 'none', border: 'none', color: '#1a5dab', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={`Type to search...`}
        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8 }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {filteredSuggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => addTag(s)}
            style={{ border: '1px dashed #bbb', borderRadius: 16, padding: '4px 12px', background: 'none', cursor: 'pointer' }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

const ProfileBuilderTags = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'farmer';

  const [farmerData, setFarmerData] = useState({
    landSize: '',
    landLocation: '',
    cropsGrown: [],
    experience: '',
    seasons: []
  });

  const [contractorData, setContractorData] = useState({
    companyName: '',
    companyLocation: '',
    cropDemand: [],
    contractPreferences: ''
  });
  
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info'); // 'info', 'success', 'error'

  const handleFarmerChange = (e) => {
    const { name, value } = e.target;
    setFarmerData({ ...farmerData, [name]: value });
  };

  const handleContractorChange = (e) => {
    const { name, value } = e.target;
    setContractorData({ ...contractorData, [name]: value });
  };

  const handleSeasonChange = (season) => {
    const updatedSeasons = farmerData.seasons.includes(season)
      ? farmerData.seasons.filter((s) => s !== season)
      : [...farmerData.seasons, season];
    setFarmerData({ ...farmerData, seasons: updatedSeasons });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (userRole === 'farmer') {
        await profileAPI.createFarmerProfile(farmerData);
      } else {
        await profileAPI.createContractorProfile(contractorData);
      }
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
      setModalMessage('Failed to save profile. Please try again.');
      setModalType('error');
      setShowModal(true);
    }
  };

  const seasons = ['Kharif', 'Rabi', 'Zaid'];

  return (
    <div className="profile-builder" style={{ paddingTop: '50px' }}>
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
              <TagInput
                label="Crops Grown"
                suggestions={cropOptions}
                selected={farmerData.cropsGrown}
                setSelected={(crops) => setFarmerData({ ...farmerData, cropsGrown: crops })}
              />
              <div className="form-group">
                <label>Preferred Seasons</label>
                <div className="checkbox-group">
                  {seasons.map((season) => (
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
              <TagInput
                label="Crop Demand"
                suggestions={cropOptions}
                selected={contractorData.cropDemand}
                setSelected={(crops) => setContractorData({ ...contractorData, cropDemand: crops })}
              />
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
            <button type="button" onClick={() => navigate('/')} className="back-button">
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

export default ProfileBuilderTags;
