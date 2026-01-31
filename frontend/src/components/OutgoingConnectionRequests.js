import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { connectionAPI } from '../services/api';

const OutgoingConnectionRequests = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [cancelling, setCancelling] = useState({});

  useEffect(() => {
    fetchConnectionRequests();
  }, []);

  const fetchConnectionRequests = async () => {
    try {
      setLoading(true);
      const response = await connectionAPI.getConnectionRequests();
      // Filter to only show outgoing requests (where current user is sender)
      const outgoingRequests = response.data.data.requests.filter(
        req => req.senderId === localStorage.getItem('userId')
      );
      setRequests(outgoingRequests);
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

  const handleCardClick = (request) => {
    if (request.status === 'accepted') {
      navigate(`/communication/${request.receiverId}`);
    } else if (request.status === 'pending') {
      showToast(t('connection.status.pendingMessage') || 'Please wait for the receiver to accept your request', 'info');
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      // ensure any global selection/modals are cleared (defensive)
      // (Requests page manages its own modals)
      setCancelling(prev => ({ ...prev, [requestId]: true }));
      await connectionAPI.cancelConnectionRequest(requestId);
      setRequests(prev => prev.filter(r => r._id !== requestId));
      showToast(t('connection.cancelledSuccess') || 'Request cancelled', 'success');
    } catch (err) {
      console.error('Cancel request error:', err);
      showToast(err.response?.data?.message || t('connection.cancelError') || 'Failed to cancel request', 'error');
    } finally {
      setCancelling(prev => {
        const copy = { ...prev };
        delete copy[requestId];
        return copy;
      });
    }
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
            {t('No Outgoing Requests')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {t('Outgoing Requests')}
      </h3>
      
      <div className="space-y-4">
        {requests.map((request) => (
          <div 
            key={request._id}
            onClick={() => handleCardClick(request)}
            className={`p-4 rounded-lg border transition-all ${
              request.status === 'accepted' 
                ? 'cursor-pointer hover:shadow-lg hover:border-green-400' 
                : 'cursor-default'
            } ${
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
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                    {request.receiverName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{request.receiverName}</h4>
                    <p className="text-sm text-gray-600">
                      {request.receiverRole === 'farmer' ? t('profileDetail.farmer') : t('profileDetail.contractor')}
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
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleString()}</div>

                  {request.status === 'pending' && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleCancelRequest(request._id); }}
                      disabled={!!cancelling[request._id]}
                      className="ml-2 px-3 py-1 rounded text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
                    >
                      {cancelling[request._id] ? t('connection.cancelling') || 'Cancelling...' : t('connection.cancel') || 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                request.status === 'pending'
                  ? 'bg-orange-100 text-orange-800 border-orange-300'
                  : request.status === 'accepted'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {request.status === 'pending' 
                  ? t('connection.status.pending')
                  : request.status === 'accepted' 
                    ? t('connection.status.accepted')
                    : t('connection.status.rejected')}
                </div>

                {/* Cancel button for pending outgoing requests */}
                {request.status === 'pending' && (
                  <div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleCancelRequest(request._id); }}
                      disabled={!!cancelling[request._id]}
                      className="ml-2 px-3 py-1 rounded text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
                    >
                      {cancelling[request._id] ? t('connection.cancelling') || 'Cancelling...' : t('connection.cancel') || 'Cancel'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

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

export default OutgoingConnectionRequests;