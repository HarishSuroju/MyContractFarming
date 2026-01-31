import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { connectionAPI } from '../services/api';

const Requests = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const highlightRequestId = queryParams.get('highlight');
  
  const [activeTab, setActiveTab] = useState(queryParams.get('tab') || 'incoming');
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState({});
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  const highlightedRef = useRef(null);

  useEffect(() => {
    // Set active tab based on URL parameter
    const tab = queryParams.get('tab');
    if (tab && (tab === 'incoming' || tab === 'outgoing')) {
      setActiveTab(tab);
    }
    
    fetchRequests();
  }, [location.search]);

  useEffect(() => {
    // Scroll to highlighted request if exists
    if (highlightedRef.current && highlightRequestId) {
      setTimeout(() => {
        highlightedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        highlightedRef.current.classList.add('ring-4', 'ring-blue-500');
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
          if (highlightedRef.current) {
            highlightedRef.current.classList.remove('ring-4', 'ring-blue-500');
          }
        }, 3000);
      }, 100);
    }
  }, [incomingRequests, highlightRequestId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await connectionAPI.getConnectionRequests();
      const currentUserId = localStorage.getItem('userId');
      
      // Separate incoming and outgoing requests
      const incoming = response.data.data.requests.filter(
        req => req.receiverId === currentUserId
      );
      
      const outgoing = response.data.data.requests.filter(
        req => req.senderId === currentUserId
      );
      
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    } catch (error) {
      console.error('Error fetching requests:', error);
      showToast('Failed to load requests', 'error');
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

  const handleAcceptRequest = (request) => {
    setSelectedRequest(request);
    setShowAcceptModal(true);
  };

  const handleRejectRequest = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const confirmAccept = async () => {
    if (!selectedRequest || !showAcceptModal) return;

    try {
      // Disable buttons and show loading
      const acceptBtn = document.getElementById(`accept-${selectedRequest._id}`);
      const rejectBtn = document.getElementById(`reject-${selectedRequest._id}`);
      if (acceptBtn) acceptBtn.disabled = true;
      if (rejectBtn) rejectBtn.disabled = true;

      // Call API to update status
      await connectionAPI.updateConnectionRequestStatus(selectedRequest._id, 'accepted');

      // Remove request from pending list
      setIncomingRequests(prev => prev.filter(req => req._id !== selectedRequest._id));

      // Show success toast
      showToast(t('connection.acceptSuccess') || 'Request accepted successfully', 'success');

      // Close modal
      setShowAcceptModal(false);
      setSelectedRequest(null);
      
      // Unlock next actions on UI (e.g., start audio/video call, create agreement)
      console.log('Request accepted, next actions unlocked for this connection');
    } catch (error) {
      console.error('Error accepting request:', error);
      showToast('Failed to accept request', 'error');
      
      // Re-enable buttons
      const acceptBtn = document.getElementById(`accept-${selectedRequest._id}`);
      const rejectBtn = document.getElementById(`reject-${selectedRequest._id}`);
      if (acceptBtn) acceptBtn.disabled = false;
      if (rejectBtn) rejectBtn.disabled = false;
    }
  };

  const confirmReject = async () => {
    if (!selectedRequest || !showRejectModal) return;

    try {
      // Disable buttons
      const acceptBtn = document.getElementById(`accept-${selectedRequest._id}`);
      const rejectBtn = document.getElementById(`reject-${selectedRequest._id}`);
      if (acceptBtn) acceptBtn.disabled = true;
      if (rejectBtn) rejectBtn.disabled = true;

      // Call API to update status
      await connectionAPI.updateConnectionRequestStatus(selectedRequest._id, 'rejected');

      // Remove request from pending list
      setIncomingRequests(prev => prev.filter(req => req._id !== selectedRequest._id));

      // Show rejection toast
      showToast(t('connection.rejectSuccess') || 'Request rejected successfully', 'success');

      // Close modal
      setShowRejectModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error rejecting request:', error);
      showToast('Failed to reject request', 'error');
      
      // Re-enable buttons
      const acceptBtn = document.getElementById(`accept-${selectedRequest._id}`);
      const rejectBtn = document.getElementById(`reject-${selectedRequest._id}`);
      if (acceptBtn) acceptBtn.disabled = false;
      if (rejectBtn) rejectBtn.disabled = false;
    }
  };

  const handleCancelRequest = async (request) => {
    try {
      // Close any open accept/reject UI to avoid duplicate toasts
      setShowAcceptModal(false);
      setShowRejectModal(false);
      setSelectedRequest(null);

      setCancelling(prev => ({ ...prev, [request._id]: true }));
      await connectionAPI.cancelConnectionRequest(request._id);

      // Remove from both lists just in case
      setIncomingRequests(prev => prev.filter(r => r._id !== request._id));
      setOutgoingRequests(prev => prev.filter(r => r._id !== request._id));

      showToast(t('connection.cancelledSuccess') || 'Request cancelled', 'success');
    } catch (err) {
      console.error('Cancel request error:', err);
      showToast(t('connection.cancelError') || 'Failed to cancel request', 'error');
    } finally {
      setCancelling(prev => {
        const copy = { ...prev };
        delete copy[request._id];
        return copy;
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderRequestCard = (request, isHighlighted = false) => {
    const isPending = request.status === 'pending';
    const currentUserId = localStorage.getItem('userId');
    const isReceiver = request.receiverId === currentUserId;
    const cardRef = highlightRequestId === request._id ? highlightedRef : null;

    return (
      <div
        key={request._id}
        ref={cardRef}
        className={`p-6 rounded-xl border ${
          isHighlighted ? 'ring-4 ring-blue-500' : ''
        } ${
          request.status === 'pending' 
            ? 'border-gray-200 bg-white hover:bg-gray-50' 
            : request.status === 'accepted'
              ? 'border-green-200 bg-green-50 hover:bg-green-100'
              : 'border-red-200 bg-red-50 hover:bg-red-100'
        } transition-all duration-300`}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1" onClick={() => {
            // Only navigate to communication when the request is accepted
            if (request.status === 'accepted') {
              const currentUserIdInner = localStorage.getItem('userId');
              const otherUserId = request.senderId === currentUserIdInner ? request.receiverId : request.senderId;
              navigate(`/communication/${otherUserId}`);
            } else {
              showToast('Please wait until the connection is accepted to start communication', 'info');
            }
          }} style={{ cursor: request.status === 'accepted' ? 'pointer' : 'default' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-lg">
                {request.senderName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg">{request.senderName}</h4>
                <p className="text-sm text-gray-600">
                  {request.senderRole === 'farmer' ? t('Farmer') : t('Contractor')}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700 mb-4">
              {request.cropType && (
                <div>
                  <span className="font-semibold">{t('Crop')}:</span> {request.cropType}
                </div>
              )}
              
              {request.season && (
                <div>
                  <span className="font-semibold">{t('Season')}:</span> {request.season}
                </div>
              )}
              
              {request.landArea && (
                <div>
                  <span className="font-semibold">{t('Land Area')}:</span> {request.landArea}
                </div>
              )}
              
              {request.expectedPrice && (
                <div>
                  <span className="font-semibold">{t('Monthly Payment')}:</span> ₹{request.expectedPrice}
                </div>
              )}
              
              {request.message && (
                <div className="md:col-span-2">
                  <span className="font-semibold">{t('Message')}:</span> {request.message}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {formatDate(request.createdAt)}
              </span>

              {/* For outgoing pending requests show Cancel next to date (swap positions) */}
              {isPending && !isReceiver ? (
                <button
                  onClick={(e) => { e.stopPropagation(); handleCancelRequest(request); }}
                  disabled={!!cancelling[request._id]}
                  className="px-3 py-1 rounded text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
                >
                  {cancelling[request._id] ? t('connection.cancelling') || 'Cancelling...' : t('connection.cancel')}
                </button>
              ) : null}
            </div>
          </div>
          
          <div className="self-start">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
              {request.status === 'pending' 
                ? t('connection.status.pending')
                : request.status === 'accepted' 
                  ? t('connection.status.accepted')
                  : t('connection.status.rejected')}
            </span>

            {isPending && isReceiver && (
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <button
                  id={`accept-${request._id}`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the card click
                    handleAcceptRequest(request);
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium min-w-[80px]"
                >
                  {t('connection.accept')}
                </button>
                <button
                  id={`reject-${request._id}`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the card click
                    handleRejectRequest(request);
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium min-w-[80px]"
                >
                  {t('connection.reject')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = (tabType) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {tabType === 'incoming' ? t('Incoming Requests') : t('Outgoing Requests')}
      </h3>
      <p className="text-gray-500">
        {tabType === 'incoming' ? t('You have no incoming requests') : t('You have no outgoing requests')}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">
              {t('connection.requestsPageTitle')}
            </h1>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => {
                  setActiveTab('incoming');
                  navigate('/dashboard/requests?tab=incoming');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'incoming'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('Incoming Requests')}
              </button>
              <button
                onClick={() => {
                  setActiveTab('outgoing');
                  navigate('/dashboard/requests?tab=outgoing');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'outgoing'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('Outgoing Requests')}
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : activeTab === 'incoming' ? (
              <div>
                {incomingRequests.length > 0 ? (
                  <div className="space-y-4">
                    {incomingRequests.map(request => 
                      renderRequestCard(request, request._id === highlightRequestId)
                    )}
                  </div>
                ) : (
                  renderEmptyState('incoming')
                )}
              </div>
            ) : (
              <div>
                {outgoingRequests.length > 0 ? (
                  <div className="space-y-4">
                    {outgoingRequests.map(request => 
                      renderRequestCard(request, false)
                    )}
                  </div>
                ) : (
                  renderEmptyState('outgoing')
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accept Confirmation Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {t('Confirm Accept')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('Confirm Accept Message', { name: selectedRequest?.senderName })}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={confirmAccept}
                className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                {t('Confirm Accept')}
              </button>
              <button
                onClick={() => {
                  setShowAcceptModal(false);
                  setSelectedRequest(null);
                }}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                {t('Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {t('Confirm Reject')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('Confirm Reject Message', { name: selectedRequest?.senderName })}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={confirmReject}
                className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                {t('Confirm Reject')}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                }}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                {t('Cancel')}
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
          {toast.message === 'Request accepted successfully' ? t('Request Accepted Successfully') : t('Request Rejected Successfully')}
          {toast.message === 'Request rejected successfully' ? t('Request Rejected Successfully') : t('Request Accepted Successfully')} 
        </div>
      )}
    </div>
  );
};

export default Requests;