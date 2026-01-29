import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { agreementAPI, profileAPI } from '../services/api';
import '../App.css';

const AgreementCreation = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'farmer';
  
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  
  useEffect(() => {
    // Get selected user from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId') || localStorage.getItem('selectedUserId') || '';
    const season = urlParams.get('season') || localStorage.getItem('selectedSeason') || '';
    const crop = urlParams.get('crop') || localStorage.getItem('selectedCrop') || '';
    
    setSelectedUserId(userId);
    setSelectedSeason(season);
    setSelectedCrop(crop);
  }, []);

  const [agreementData, setAgreementData] = useState({
    quantity: '',
    price: '',
    duration: '',
    terms: ''
  });
  
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info'); // 'info', 'success', 'error'

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAgreementData({
      ...agreementData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare agreement data
      const agreementPayload = {
        ...agreementData,
        season: selectedSeason,
        crop: selectedCrop,
        // Determine farmer and contractor based on who is creating the agreement
        farmerId: userRole === 'farmer' ? localStorage.getItem('userId') : selectedUserId,
        contractorId: userRole === 'contractor' ? localStorage.getItem('userId') : selectedUserId
      };
      
      // Call the actual API
      await agreementAPI.createAgreement(agreementPayload);
      
      // Update the user's profile with their latest crop and season selection
      if (userRole === 'farmer') {
        await profileAPI.createFarmerProfile({
          selectedCrop,
          selectedSeason
        });
      } else {
        await profileAPI.createContractorProfile({
          selectedCrop,
          selectedSeason
        });
      }
      
      setModalMessage('Agreement created successfully!');
      setModalType('success');
      setShowModal(true);
      
      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        if (userRole === 'farmer') {
          navigate('/farmer-dashboard');
        } else {
          navigate('/contractor-dashboard');
        }
      }, 2000);
    } catch (error) {
      console.error('Agreement creation error:', error);
      if (error.response && error.response.data) {
        setModalMessage(error.response.data.message || 'Failed to create agreement. Please try again.');
      } else {
        setModalMessage('Failed to create agreement. Please try again.');
      }
      setModalType('error');
      setShowModal(true);
    }
  };

  const handleBack = () => {
    navigate('/user-matching');
  };

  return (
    <div className="agreement-creation" style={{ paddingTop: '70px' }}>
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
      
      <div className="agreement-container">
        <h2>Create Agreement</h2>
        <p className="subtitle">
          {userRole === 'farmer' 
            ? 'Create a contract proposal for the selected contractor' 
            : 'Create a contract proposal for the selected farmer'}
        </p>
        
        <div className="selection-summary">
          <p><strong>Season:</strong> {selectedSeason}</p>
          <p><strong>Crop:</strong> {selectedCrop}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="agreement-form">
          <div className="form-group">
            <label htmlFor="quantity">Quantity (in tons/kg)</label>
            <input
              type="text"
              id="quantity"
              name="quantity"
              value={agreementData.quantity}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="price">Price (per unit)</label>
            <input
              type="text"
              id="price"
              name="price"
              value={agreementData.price}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="duration">Duration (months)</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={agreementData.duration}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="terms">Terms and Conditions</label>
            <textarea
              id="terms"
              name="terms"
              value={agreementData.terms}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={handleBack} className="back-button">
              Back
            </button>
            <button type="submit" className="submit-button">
              Create Agreement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgreementCreation;