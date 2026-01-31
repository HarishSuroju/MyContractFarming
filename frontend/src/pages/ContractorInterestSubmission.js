import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { profileAPI, connectionAPI } from '../services/api';

const ContractorInterestSubmission = () => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    crop: '',
    season: '',
    quantity: '',
    quantityUnit: 'Acres',
    expectedPrice: '',
    currency: 'INR',
    message: ''
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState({});
  
  // Available crops and seasons (these could come from API in real implementation)
  const availableCrops = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Soybean', 'Coffee', 'Tea', 'Sugarcane'];
  const availableSeasons = ['Kharif', 'Rabi', 'Zaid'];
  
  // Unit and currency options
  const quantityUnits = ['Acres', 'Hectares'];
  const currencies = [
    { code: 'INR', symbol: '₹', label: 'Rupees' },
    { code: 'USD', symbol: '$', label: 'Dollars' }
  ];

  // Fetch farmer profile
  useEffect(() => {
    console.log('ContractorInterestSubmission mounted with userId:', userId);
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

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.crop.trim()) {
      errors.crop = 'Crop is required';
    }
    
    if (!formData.season.trim()) {
      errors.season = 'Season is required';
    }
    
    if (!formData.quantity.trim()) {
      errors.quantity = 'Quantity is required';
    } else if (isNaN(formData.quantity) || parseFloat(formData.quantity) <= 0) {
      errors.quantity = 'Please enter a valid positive number';
    }
    
    if (!formData.quantityUnit.trim()) {
      errors.quantityUnit = 'Measurement unit is required';
    }
    
    if (!formData.expectedPrice.trim()) {
      errors.expectedPrice = 'Expected price is required';
    } else if (isNaN(formData.expectedPrice) || parseFloat(formData.expectedPrice) <= 0) {
      errors.expectedPrice = 'Please enter a valid positive price';
    }
    
    if (!formData.currency.trim()) {
      errors.currency = 'Currency is required';
    }
    
    if (formData.message.trim().length > 500) {
      errors.message = 'Message should not exceed 500 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Prepare the connection request data
      const connectionRequestData = {
        receiverId: userId,
        cropType: formData.crop,
        season: formData.season,
        landArea: parseFloat(formData.quantity),
        quantityUnit: formData.quantityUnit,
        expectedPrice: parseFloat(formData.expectedPrice),
        currency: formData.currency,
        message: formData.message.trim(),
        submittedAt: new Date().toISOString()
      };
      
      // Submit to API
      console.log('Submitting connection request:', connectionRequestData);
      
      await connectionAPI.createConnectionRequest(connectionRequestData);
      
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate(`/user-profile/${userId}`);
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting connection request:', err);
      setError(err.response?.data?.message || t('connection.confirmation.errorMessage') || 'Failed to submit connection request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(-1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-xl text-gray-600">{t('profileDetail.loading')}</div>
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-xl text-red-600 text-center">
          <div className="mb-4">{error || t('profileDetail.userNotFound')}</div>
          <button
            onClick={() => navigate('/users-directory')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Users Directory
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('interest.submission.successTitle')}</h2>
          <p className="text-gray-600 mb-6">{t('interest.submission.successMessage', { name: user.name })}</p>
          <p className="text-gray-500">{t('interest.submission.redirecting')}</p>
        </div>
      </div>
    );
  }

  // Main form component
  const isFarmer = user.role?.toLowerCase() === 'farmer';
  const roleClass = isFarmer ? 'farmer' : 'contractor';
  const roleGradient = isFarmer ? 'from-green-500 to-green-600' : 'from-blue-500 to-blue-600';

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Farmer Profile Header */}
        <div className={`rounded-3xl p-10 text-center relative overflow-hidden bg-gradient-to-br ${roleGradient} text-white mb-8`}>
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

        {/* Farmer Profile Summary */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Farmer Profile Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <span className="text-lg font-bold">
                {(user.crops && user.crops.length > 0) 
                  ? user.crops.join(', ') 
                  : (user.profile?.cropsGrown && user.profile.cropsGrown.length > 0) 
                    ? user.profile.cropsGrown.join(', ') 
                    : t('profileDetail.notSpecified')}
              </span>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">{t('profileDetail.experience')}</span>
              <span className="text-lg font-bold">{user.experience || user.profile?.experience || t('profileDetail.notSpecified')}</span>
            </div>
          </div>
        </div>

        {/* Interest Submission Form */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit Interest Request</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Crop Selection */}
              <div>
                <label htmlFor="crop" className="block text-sm font-bold text-gray-700 mb-2">
                  Crop *
                </label>
                <select
                  id="crop"
                  name="crop"
                  value={formData.crop}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    formErrors.crop ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a crop</option>
                  {availableCrops.map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
                {formErrors.crop && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.crop}</p>
                )}
              </div>

              {/* Season Selection */}
              <div>
                <label htmlFor="season" className="block text-sm font-bold text-gray-700 mb-2">
                  Season *
                </label>
                <select
                  id="season"
                  name="season"
                  value={formData.season}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    formErrors.season ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a season</option>
                  {availableSeasons.map(season => (
                    <option key={season} value={season}>{season}</option>
                  ))}
                </select>
                {formErrors.season && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.season}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-bold text-gray-700 mb-2">
                  Quantity (in acres/hectares) *
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      placeholder="Enter quantity"
                      min="0.1"
                      step="0.1"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        formErrors.quantity ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.quantity && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>
                    )}
                  </div>
                  <div className="w-40">
                    <select
                      name="quantityUnit"
                      value={formData.quantityUnit}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        formErrors.quantityUnit ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select unit</option>
                      {quantityUnits.map(unit => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                    {formErrors.quantityUnit && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.quantityUnit}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Expected Price */}
              <div>
                <label htmlFor="expectedPrice" className="block text-sm font-bold text-gray-700 mb-2">
                  Expected Price (per acre/hectare) *
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      id="expectedPrice"
                      name="expectedPrice"
                      value={formData.expectedPrice}
                      onChange={handleInputChange}
                      placeholder="Enter expected price"
                      min="1"
                      step="1"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        formErrors.expectedPrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.expectedPrice && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.expectedPrice}</p>
                    )}
                  </div>
                  <div className="w-40">
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        formErrors.currency ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select currency</option>
                      {currencies.map(curr => (
                        <option key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.currency && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.currency}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Add any additional details or questions for the farmer..."
                rows="4"
                maxLength="500"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                  formErrors.message ? 'border-red-500' : 'border-gray-300'
                }`}
              ></textarea>
              <div className="flex justify-between mt-1">
                {formErrors.message && (
                  <p className="text-sm text-red-600">{formErrors.message}</p>
                )}
                <p className="text-sm text-gray-500 text-right">
                  {formData.message.length}/500 characters
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 py-4 px-8 rounded-xl font-bold text-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center ${
                  submitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 border-2 border-green-500 hover:from-green-600 hover:to-green-700'
                }`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Interest Request'
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="flex-1 py-4 px-8 rounded-xl font-bold text-lg text-gray-800 bg-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border-2 border-gray-300 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
              </svg>
              <div className="text-red-700">{error}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractorInterestSubmission;