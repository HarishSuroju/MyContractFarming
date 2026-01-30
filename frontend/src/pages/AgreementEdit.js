import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { agreementAPI } from '../services/api';

const AgreementEdit = () => {
  const { t } = useTranslation();
  const { agreementId } = useParams();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    cropType: '',
    season: '',
    landArea: '',
    duration: '',
    salary: '',
    inputsSupplied: '',
    terms: ''
  });

  useEffect(() => {
    fetchAgreement();
  }, [agreementId]);

  const fetchAgreement = async () => {
    try {
      const response = await agreementAPI.getAgreementById(agreementId);
      const fetchedAgreement = response.data.data.agreement;
      setAgreement(fetchedAgreement);
      
      // Set form data with current values
      setFormData({
        cropType: fetchedAgreement.cropType || '',
        season: fetchedAgreement.season || '',
        landArea: fetchedAgreement.landArea || '',
        duration: fetchedAgreement.duration || '',
        salary: fetchedAgreement.salary || '',
        inputsSupplied: Array.isArray(fetchedAgreement.inputsSupplied) ? fetchedAgreement.inputsSupplied.join(', ') : fetchedAgreement.inputsSupplied || '',
        terms: fetchedAgreement.terms || ''
      });
    } catch (err) {
      setError(t('agreement.errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare data - convert inputsSupplied back to array
      const updatedData = {
        ...formData,
        landArea: parseFloat(formData.landArea),
        salary: parseFloat(formData.salary),
        inputsSupplied: formData.inputsSupplied.split(',').map(item => item.trim()).filter(item => item)
      };
      
      console.log('[AgreementEdit] Updating agreement:', agreementId);
      console.log('[AgreementEdit] Updated data:', updatedData);
      
      const response = await agreementAPI.updateAgreement(agreementId, updatedData);
      console.log('[AgreementEdit] Update successful:', response.data);
      
      // Determine who is editing and update status accordingly
      const userRole = localStorage.getItem('userRole');
      let newStatus = 'edited_by_contractor';
      if (userRole === 'farmer') {
        newStatus = 'edited_by_farmer';
      }
      console.log('[AgreementEdit] Updating status to:', newStatus);
      await agreementAPI.updateAgreementStatus(agreementId, newStatus);
      
      setSuccess(t('agreement.success.updated'));
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/agreement-report/${agreementId}`);
      }, 1500);
    } catch (err) {
      console.error('[AgreementEdit] Error:', err);
      console.error('[AgreementEdit] Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || t('Agreement Update Failed');
      const debugInfo = err.response?.data?.debug;
      console.error('[AgreementEdit] Debug info:', debugInfo);
      
      let displayError = errorMessage;
      if (debugInfo) {
        displayError += `\n\nDebug: Status=${debugInfo.currentStatus} (expected: pending), IsUser=${debugInfo.isContractor || debugInfo.isFarmer}`;
      }
      
      setError(displayError);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{t('agreement.errors.notFound')}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t('back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('Edit Agreement')}
            </h1>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {t(`agreement.status.${agreement.status}`)}
            </span>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Crop')}
                </label>
                <input
                  type="text"
                  name="cropType"
                  value={formData.cropType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Season')}
                </label>
                <input
                  type="text"
                  name="season"
                  value={formData.season}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Quantity')}
                </label>
                <input
                  type="number"
                  name="landArea"
                  value={formData.landArea}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Price Terms')}
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Delivery Timeline')}
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Inputs Supplied')}
              </label>
              <input
                type="text"
                name="inputsSupplied"
                value={formData.inputsSupplied}
                onChange={handleInputChange}
                placeholder={t('agreement.placeholders.inputsSupplied')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="mt-1 text-sm text-gray-500">{t('Inputs Format Hint')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Agreement Text')}       
              </label>
              <textarea
                name="terms"
                value={formData.terms}
                onChange={handleInputChange}
                required
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {t('Save')}
              </button>
              
              <button
                type="button"
                onClick={() => navigate(`/agreement-report/${agreementId}`)}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                {t('Cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgreementEdit;