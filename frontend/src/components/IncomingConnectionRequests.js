import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { connectionAPI } from '../services/api';

const IncomingConnectionRequests = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchConnectionRequests();
  }, []);

  const fetchConnectionRequests = async () => {
    try {
      setLoading(true);
      const response = await connectionAPI.getConnectionRequests();
      // Filter to only show incoming requests (where current user is receiver)
      const incomingRequests = response.data.data.requests.filter(
        req => req.receiverId === localStorage.getItem('userId')
      );
      setRequests(incomingRequests);
    } catch (error) {
      console.error('Error fetching connection requests:', error);
      showToast('Failed to load connection requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest || !confirmAction) return;

    try {
      const response = await connectionAPI.updateConnectionRequestStatus(
        selectedRequest._id,
        confirmAction
      );

      // Update the request in the list
      setRequests(prev => 
        prev.map(req => 
          req._id === selectedRequest._id 
            ? { ...req, status: confirmAction }
            : req
        )
      );

      // Show success message
      const actionText = confirmAction === 'accepted' ? 'accepted' : 'rejected';
      showToast(`Connection request ${actionText} successfully`, 'success');

      // Close modal
      setShowConfirmModal(false);
      setConfirmAction(null);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error updating connection request:', error);
      showToast('Failed to update connection request', 'error');
    }
  };

  const handleAccept = (request) => {
    setSelectedRequest(request);
    setConfirmAction('accepted');
    setShowConfirmModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setConfirmAction('rejected');
    setShowConfirmModal(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="text-center py-8 text-gray-500">
          {t('connection.noIncomingRequests')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {t('connection.incomingRequests')}
      </h3>
      
      <div className="space-y-4">
        {requests.map((request) => (
          <div 
            key={request._id} 
            className={`p-4 rounded-lg border ${
              request.status === 'pending' 
                ? 'border-gray-200 bg-gray-50' 
                : request.status === 'accepted'
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                    {request.senderName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{request.senderName}</h4>
                    <p className="text-sm text-gray-600">
                      {request.senderRole === 'farmer' ? t('profileDetail.farmer') : t('profileDetail.contractor')}
                    </p>
                  </div>
                </div>
                
                {request.cropType && (
                  <div className="text-sm text-gray-700 mb-1">
                    <strong>{t('agreement.fields.crop')}:</strong> {request.cropType}
                  </div>
                )}
                
                {request.season && (
                  <div className="text-sm text-gray-700 mb-1">
                    <strong>{t('agreement.fields.season')}:</strong> {request.season}
                  </div>
                )}
                
                {request.message && (
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>{t('interest.submission.messageLabel')}:</strong> {request.message}
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  {new Date(request.createdAt).toLocaleString()}
                </div>
              </div>
              
              {request.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(request)}
                    disabled={loading}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {t('connection.accept')}
                  </button>
                  <button
                    onClick={() => handleReject(request)}
                    disabled={loading}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {t('connection.reject')}
                  </button>
                </div>
              )}
              
              {request.status !== 'pending' && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  request.status === 'accepted'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {request.status === 'accepted' 
                    ? t('connection.status.accepted') 
                    : t('connection.status.rejected')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {confirmAction === 'accepted' 
                ? t('connection.confirmAcceptTitle') 
                : t('connection.confirmRejectTitle')}
            </h3>
            <p className="text-gray-600 mb-6">
              {confirmAction === 'accepted' 
                ? t('connection.confirmAcceptMessage', { name: selectedRequest?.senderName })
                : t('connection.confirmRejectMessage', { name: selectedRequest?.senderName })}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleConfirmAction}
                className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                  confirmAction === 'accepted'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                } transition-colors`}
              >
                {confirmAction === 'accepted' 
                  ? t('connection.confirmAccept') 
                  : t('connection.confirmReject')}
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                  setSelectedRequest(null);
                }}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default IncomingConnectionRequests;