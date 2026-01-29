import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { connectionAPI } from '../services/api';

const ConnectionRequestsPreview = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnectionRequests();
  }, []);

  const fetchConnectionRequests = async () => {
    try {
      setLoading(true);
      const response = await connectionAPI.getConnectionRequests();
      
      // Get current user ID
      const currentUserId = localStorage.getItem('userId');
      
      // Filter and sort requests
      let allRequests = response.data.data.requests;
      
      // Separate incoming and outgoing requests
      const incoming = allRequests
        .filter(req => req.receiverId === currentUserId)
        .sort((a, b) => {
          // Pending requests first
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          // Then by date (newest first)
          return new Date(b.createdAt) - new Date(a.createdAt);
        })
        .slice(0, 5); // Limit to 5 items
      
      const outgoing = allRequests
        .filter(req => req.senderId === currentUserId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5); // Limit to 5 items
      
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    } catch (error) {
      console.error('Error fetching connection requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await connectionAPI.updateConnectionRequestStatus(requestId, 'accepted');
      // Refresh the requests
      fetchConnectionRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await connectionAPI.updateConnectionRequestStatus(requestId, 'rejected');
      // Refresh the requests
      fetchConnectionRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleViewAll = () => {
    navigate('/dashboard/requests');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Connection Requests</h2>
      
      {/* Incoming Requests */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Incoming Requests</h3>
        {incomingRequests.length === 0 ? (
          <p className="text-gray-500 italic">No incoming requests</p>
        ) : (
          <div className="space-y-3">
            {incomingRequests.map((request) => (
              <div key={request._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{request.senderName}</div>
                  <div className="text-sm text-gray-600">
                    {request.cropType} • {request.season}
                  </div>
                </div>
                {request.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(request._id)}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.status === 'accepted' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing Requests */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Outgoing Requests</h3>
        {outgoingRequests.length === 0 ? (
          <p className="text-gray-500 italic">No outgoing requests</p>
        ) : (
          <div className="space-y-3">
            {outgoingRequests.map((request) => (
              <div key={request._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">Sent to {request.receiverName}</div>
                  <div className="text-sm text-gray-600">
                    {request.cropType} • {request.season}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : request.status === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View All Button */}
      <div className="text-center pt-4 border-t">
        <button
          onClick={handleViewAll}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          View All Requests
        </button>
      </div>
    </div>
  );
};

export default ConnectionRequestsPreview;