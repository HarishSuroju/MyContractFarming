import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { agreementAPI, notificationAPI } from '../services/api';

const AgreementReport = () => {
  const { t } = useTranslation();
  const { agreementId } = useParams();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');
    setUserRole(storedRole);
    setUserId(storedUserId);

    if (!storedRole || !storedUserId) {
      setError(t('agreement.errors.notLoggedIn'));
      setLoading(false);
      return;
    }

    fetchAgreement();
  }, [agreementId, t]);

  const fetchAgreement = async () => {
    try {
      const response = await agreementAPI.getAgreementById(agreementId);
      setAgreement(response.data.data.agreement);
    } catch (err) {
      setError(t('agreement.errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await agreementAPI.updateAgreementStatus(agreementId, newStatus);
      setAgreement(response.data.data.agreement);
      
      // Create notification for the other party
      const otherPartyId = userId === agreement.farmer._id ? agreement.contractor._id : agreement.farmer._id;
      const currentUserName = localStorage.getItem('userName');
      
      let notificationMessage = '';
      let notificationType = '';
      
      switch(newStatus) {
        case 'edited_by_contractor':
          notificationMessage = `${currentUserName} has edited the agreement for ${agreement.cropType}.`;
          notificationType = 'agreement_edited';
          break;
        case 'accepted_by_contractor':
          notificationMessage = `${currentUserName} has accepted the agreement for ${agreement.cropType}.`;
          notificationType = 'agreement_accepted';
          break;
        case 'rejected_by_contractor':
          notificationMessage = `${currentUserName} has rejected the agreement for ${agreement.cropType}.`;
          notificationType = 'agreement_rejected';
          break;
        case 'agreement_confirmed':
          notificationMessage = `${currentUserName} has confirmed the agreement for ${agreement.cropType}.`;
          notificationType = 'agreement_confirmed';
          break;
        case 'agreement_rejected':
          notificationMessage = `${currentUserName} has rejected the agreement for ${agreement.cropType}.`;
          notificationType = 'agreement_rejected';
          break;
        default:
          notificationMessage = `${currentUserName} has updated the agreement status to ${newStatus}.`;
          notificationType = 'agreement_sent';
      }
      
      await notificationAPI.createNotification({
        userId: otherPartyId,
        type: notificationType,
        title: 'Agreement Status Updated',
        message: notificationMessage,
        referenceId: agreementId,
        referenceType: 'agreement'
      });
      
      // Refresh the agreement data
      fetchAgreement();
    } catch (err) {
      setError(t('Agreement:Status Update Failed'));
    }
  };

  const handleSendOtp = async () => {
    try {
      await agreementAPI.sendOtp(agreementId);
      setShowOtpModal(true);
    } catch (err) {
      setError(t('Agreement:Otp Sending Failed'));
    }
  };

  const handleAcceptWithOtp = async () => {
    try {
      await agreementAPI.acceptAgreement(agreementId, otpInput);
      setShowOtpModal(false);
      setOtpInput('');
      // Refresh the agreement data
      fetchAgreement();
      navigate('/agreements');
    } catch (err) {
      setError(t('Agreement:Invalid Otp'));
    }
  };

  const canEdit = () => {
    // Contractor can edit when sent_to_contractor status
    if (userRole === 'contractor' && 
        agreement?.status === 'sent_to_contractor' && 
        userId === agreement?.contractor._id) {
      return true;
    }
    // Farmer can edit when pending status (agreement sent by contractor)
    if (userRole === 'farmer' && 
        agreement?.status === 'pending' && 
        userId === agreement?.farmer._id) {
      return true;
    }
    return false;
  };

  const canAcceptOrReject = () => {
    // Contractor can accept/reject when sent_to_contractor status
    if (userRole === 'contractor' && agreement?.status === 'sent_to_contractor' && userId === agreement?.contractor._id) {
      return true;
    }
    if (userRole === 'farmer' && agreement?.status === 'accepted_by_contractor' && userId === agreement?.farmer._id) {
      return true;
    }
    return false;
  };

  const canConfirmOrReject = () => {
    return userRole === 'farmer' && 
           agreement?.status === 'accepted_by_contractor' && 
           userId === agreement?.farmer._id;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'sent_to_contractor': return 'bg-indigo-100 text-indigo-800';
      case 'edited_by_contractor': return 'bg-orange-100 text-orange-800';
      case 'accepted_by_contractor': return 'bg-purple-100 text-purple-800';
      case 'rejected_by_contractor': return 'bg-red-100 text-red-800';
      case 'agreement_confirmed': return 'bg-green-100 text-green-800';
      case 'agreement_rejected': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-teal-100 text-teal-800';
      case 'terminated': return 'bg-gray-100 text-gray-800';
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          {error}
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

  if (!agreement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{t('Agreement Not Found')}</p>
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
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">{agreement.title}</h1>
                <p className="text-green-100 mt-1">{t('Agreement Report Viewing')}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(agreement.status)}`}>
                {t(`Agreement Status ${agreement.status}`)}
              </span>
            </div>
          </div>

          {/* Agreement Details */}
          <div className="p-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {/* Parties Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">{t('Farmer')}</h3>
                <p className="text-gray-900">{agreement.farmer?.name || 'N/A'}</p>
                <p className="text-gray-600 text-sm">{agreement.farmer?.email || 'N/A'}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">{t('Contractor')}</h3>
                <p className="text-gray-900">{agreement.contractor?.name || 'N/A'}</p>
                <p className="text-gray-600 text-sm">{agreement.contractor?.email || 'N/A'}</p>
              </div>
            </div>

            {/* Agreement Content */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Crop')}
                  </label>
                  <p className="bg-gray-50 p-3 rounded border">{agreement.cropType || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Season')}
                  </label>
                  <p className="bg-gray-50 p-3 rounded border">{agreement.season || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Quantity')}
                  </label>
                  <p className="bg-gray-50 p-3 rounded border">{agreement.quantity || agreement.landArea || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Price Terms')}
                  </label>
                  <p className="bg-gray-50 p-3 rounded border">{agreement.priceTerms || agreement.salary || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Delivery Timeline')}
                </label>
                <p className="bg-gray-50 p-3 rounded border">{agreement.duration || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Agreement Text')}
                </label>
                <div className="bg-gray-50 p-3 rounded border min-h-[120px]">
                  {agreement.agreementText || agreement.terms || t('No Terms')}
                </div>
              </div>
            </div>

            {/* Action Buttons - Conditional based on user role and status */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              {/* Contractor actions when agreement is sent to them */}
              {userRole === 'contractor' && canEdit() && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">{t('Contractor Actions')}</h3>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/agreement-edit/${agreementId}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {t('Edit')}
                    </Link>
                    <button
                      onClick={() => handleStatusChange('accepted_by_contractor')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      {t('Accept')}
                    </button>
                    <button
                      onClick={() => handleStatusChange('rejected_by_contractor')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      {t('agreement.buttons.reject')}
                    </button>
                  </div>
                </div>
              )}

              {/* Farmer actions when agreement is sent by contractor */}
              {userRole === 'farmer' && (agreement?.status === 'pending' || agreement?.status === 'edited_by_contractor') && userId === agreement?.farmer._id && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">{t('agreement.actions.farmerActions')}</h3>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/agreement-edit/${agreementId}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {t('agreement.buttons.edit')}
                    </Link>
                    <button
                      onClick={() => handleStatusChange('accepted_by_farmer')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      {t('agreement.buttons.accept')}
                    </button>
                    <button
                      onClick={() => handleStatusChange('rejected_by_farmer')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      {t('agreement.buttons.reject')}
                    </button>
                  </div>
                </div>
              )}

              {/* Contractor actions when agreement is sent by farmer */}
              {userRole === 'contractor' && agreement?.status === 'pending' && userId === agreement?.contractor._id && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">{t('agreement.actions.contractorActions')}</h3>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/agreement-edit/${agreementId}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {t('agreement.buttons.edit')}
                    </Link>
                    <button
                      onClick={() => handleStatusChange('accepted_by_contractor')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      {t('agreement.buttons.accept')}
                    </button>
                    <button
                      onClick={() => handleStatusChange('rejected_by_contractor')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      {t('agreement.buttons.reject')}
                    </button>
                  </div>
                </div>
              )}

              {/* Contractor actions when farmer has accepted */}
              {userRole === 'contractor' && agreement?.status === 'accepted_by_farmer' && userId === agreement?.contractor._id && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">{t('agreement.actions.contractorActions')}</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleStatusChange('agreement_confirmed')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      {t('agreement.buttons.confirm')}
                    </button>
                    <button
                      onClick={() => handleStatusChange('agreement_rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      {t('agreement.buttons.reject')}
                    </button>
                  </div>
                </div>
              )}

              {/* Farmer actions when contractor has accepted */}
              {canConfirmOrReject() && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">{t('Farmer Actions')}</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleStatusChange('agreement_confirmed')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      {t('Confirm')}
                    </button>
                    <button
                      onClick={() => handleStatusChange('agreement_rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      {t('Reject')}
                    </button>
                  </div>
                </div>
              )}

              {/* Actions when agreement is confirmed and ready for activation */}
              {userRole === 'contractor' && agreement.status === 'agreement_confirmed' && userId === agreement.contractor._id && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">{t('Activation')}</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleSendOtp}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      {t('Activate')}
                    </button>
                  </div>
                </div>
              )}

              {/* Back Button */}
              <div className="mt-6">
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  {t('Back')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('OTP Modal Title')}</h3>
            <p className="text-gray-600 mb-4">{t('OTP Instructions')}</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('OTP Input Label')}
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
                onClick={handleAcceptWithOtp}
                disabled={!otpInput || otpInput.length !== 6}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {t('Confirm')}
              </button>
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpInput('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                {t('Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgreementReport;