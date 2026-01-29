import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { connectionAPI } from '../services/api';

const OutgoingConnectionRequests = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

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
                
                <div className="text-xs text-gray-500">
                  {new Date(request.createdAt).toLocaleString()}
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                request.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
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