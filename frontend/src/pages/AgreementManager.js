import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { agreementAPI } from '../services/api';

const AgreementManager = () => {
  const { t } = useTranslation();
  const { agreementId } = useParams();
  const navigate = useNavigate();
  const [userRole] = useState(localStorage.getItem('userRole'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [agreement, setAgreement] = useState({
    farmer: { name: '', id: '' },
    contractor: { name: '', id: '' },
    crop: '',
    season: '',
    quantity: '',
    priceTerms: '',
    deliveryTimeline: '',
    agreementText: '',
    status: 'draft',
    adminApproved: false,
    otp: '',
    otpGenerated: false
  });
  const [formData, setFormData] = useState({
    crop: '',
    season: '',
    quantity: '',
    priceTerms: '',
    deliveryTimeline: '',
    agreementText: ''
  });
  const [otpInput, setOtpInput] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

  useEffect(() => {
    if (agreementId) {
      fetchAgreement();
    } else {
      // New agreement - only contractors can create
      if (userRole !== 'contractor') {
        setError(t('agreement.errors.noPermission'));
        navigate('/');
      } else {
        setLoading(false);
      }
    }
  }, [agreementId, userRole, t, navigate]);

  const fetchAgreement = async () => {
    try {
      const response = await agreementAPI.getAgreementById(agreementId);
      setAgreement(response.data.data.agreement);
      setFormData({
        crop: response.data.data.agreement.crop || '',
        season: response.data.data.agreement.season || '',
        quantity: response.data.data.agreement.quantity || '',
        priceTerms: response.data.data.agreement.priceTerms || '',
        deliveryTimeline: response.data.data.agreement.deliveryTimeline || '',
        agreementText: response.data.data.agreement.agreementText || ''
      });
      setLoading(false);
    } catch (err) {
      setError(t('agreement.errors.fetchFailed'));
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
    setLoading(true);
    
    try {
      let response;
      if (agreementId) {
        // Update existing agreement
        response = await agreementAPI.updateAgreement(agreementId, formData);
      } else {
        // Create new agreement
        response = await agreementAPI.createAgreement(formData);
      }
      
      setSuccess(t('agreement.success.saved'));
      if (!agreementId && response.data.data.agreement) {
        navigate(`/agreement-manager/${response.data.data.agreement._id}`);
      }
    } catch (err) {
      setError(t('agreement.errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendAgreement = async () => {
    setLoading(true);
    try {
      await agreementAPI.updateAgreementStatus(agreementId, 'sent');
      setAgreement(prev => ({ ...prev, status: 'sent' }));
      setSuccess(t('agreement.success.sent'));
    } catch (err) {
      setError(t('agreement.errors.sendFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOTP = async () => {
    setLoading(true);
    try {
      // In a real app, this would generate and send OTP
      // For demo purposes, we'll generate a mock OTP
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setAgreement(prev => ({ ...prev, otp: mockOtp, otpGenerated: true }));
      setSuccess(t('agreement.success.otpGenerated'));
      setShowOtpModal(true);
    } catch (err) {
      setError(t('agreement.errors.otpGenerationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAgreement = async () => {
    if (otpInput !== agreement.otp) {
      setError(t('agreement.errors.invalidOtp'));
      return;
    }

    setLoading(true);
    try {
      await agreementAPI.updateAgreementStatus(agreementId, 'active');
      setAgreement(prev => ({ ...prev, status: 'active' }));
      setSuccess(t('agreement.success.accepted'));
      setShowOtpModal(false);
      setOtpInput('');
    } catch (err) {
      setError(t('agreement.errors.acceptFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    setLoading(true);
    try {
      await agreementAPI.updateAgreementStatus(agreementId, 'draft');
      setAgreement(prev => ({ ...prev, status: 'draft' }));
      setSuccess(t('agreement.success.changesRequested'));
    } catch (err) {
      setError(t('agreement.errors.changesRequestFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAdminApprove = async (approved) => {
    setLoading(true);
    try {
      await agreementAPI.approveAgreement(agreementId, approved);
      setAgreement(prev => ({ ...prev, adminApproved: approved }));
      setSuccess(approved ? t('agreement.success.adminApproved') : t('agreement.success.adminRejected'));
    } catch (err) {
      setError(t('agreement.errors.adminActionFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
    alert(t('agreement.messages.pdfDownload'));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {agreementId ? t('agreement.manager.editTitle') : t('agreement.manager.createTitle')}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(agreement.status)}`}>
              {t(`agreement.status.${agreement.status}`)}
            </span>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('agreement.fields.farmer')}
                </label>
                <input
                  type="text"
                  value={agreement.farmer?.name || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('agreement.fields.contractor')}
                </label>
                <input
                  type="text"
                  value={agreement.contractor?.name || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="crop" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('agreement.fields.crop')} *
                </label>
                <input
                  type="text"
                  id="crop"
                  name="crop"
                  value={formData.crop}
                  onChange={handleInputChange}
                  disabled={agreement.status !== 'draft' && userRole !== 'contractor'}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('agreement.fields.season')} *
                </label>
                <input
                  type="text"
                  id="season"
                  name="season"
                  value={formData.season}
                  onChange={handleInputChange}
                  disabled={agreement.status !== 'draft' && userRole !== 'contractor'}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('agreement.fields.quantity')} *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  disabled={agreement.status !== 'draft' && userRole !== 'contractor'}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label htmlFor="priceTerms" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('agreement.fields.priceTerms')} *
                </label>
                <input
                  type="text"
                  id="priceTerms"
                  name="priceTerms"
                  value={formData.priceTerms}
                  onChange={handleInputChange}
                  disabled={agreement.status !== 'draft' && userRole !== 'contractor'}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="deliveryTimeline" className="block text-sm font-medium text-gray-700 mb-1">
                {t('agreement.fields.deliveryTimeline')} *
              </label>
              <input
                type="text"
                id="deliveryTimeline"
                name="deliveryTimeline"
                value={formData.deliveryTimeline}
                onChange={handleInputChange}
                disabled={agreement.status !== 'draft' && userRole !== 'contractor'}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label htmlFor="agreementText" className="block text-sm font-medium text-gray-700 mb-1">
                {t('agreement.fields.agreementText')} *
              </label>
              <textarea
                id="agreementText"
                name="agreementText"
                value={formData.agreementText}
                onChange={handleInputChange}
                disabled={agreement.status !== 'draft' && userRole !== 'contractor'}
                required
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
              />
            </div>

            {(userRole === 'admin' || agreement.adminApproved !== undefined) && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('agreement.adminSection.title')}</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    {t('agreement.adminSection.approvalStatus')}:
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    agreement.adminApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {agreement.adminApproved ? t('agreement.adminSection.approved') : t('agreement.adminSection.pending')}
                  </span>
                </div>
                
                {userRole === 'admin' && agreement.status !== 'active' && (
                  <div className="mt-4 flex space-x-3">
                    <button
                      type="button"
                      onClick={() => handleAdminApprove(true)}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {t('agreement.adminSection.approve')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdminApprove(false)}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {t('agreement.adminSection.reject')}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {userRole === 'contractor' && agreement.status === 'draft' && (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {t('agreement.buttons.saveDraft')}
                </button>
              )}

              {userRole === 'contractor' && agreement.status === 'draft' && (
                <button
                  type="button"
                  onClick={handleSendAgreement}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {t('agreement.buttons.sendToFarmer')}
                </button>
              )}

              {userRole === 'farmer' && agreement.status === 'sent' && (
                <>
                  <button
                    type="button"
                    onClick={handleGenerateOTP}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {t('agreement.buttons.acceptAgreement')}
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestChanges}
                    disabled={loading}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {t('agreement.buttons.requestChanges')}
                  </button>
                </>
              )}

              {(userRole === 'contractor' || userRole === 'farmer') && agreement.status === 'active' && (
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  {t('agreement.buttons.downloadPdf')}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('agreement.otp.modalTitle')}</h3>
            <p className="text-gray-600 mb-4">{t('agreement.otp.instructions')}</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('agreement.otp.inputLabel')}
              </label>
              <input
                type="text"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleAcceptAgreement}
                disabled={loading || otpInput.length !== 6}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {t('agreement.otp.confirmButton')}
              </button>
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpInput('');
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                {t('agreement.otp.cancelButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgreementManager;