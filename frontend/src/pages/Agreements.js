import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { agreementAPI } from '../services/api';
import '../App.css';

const Agreements = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'farmer';
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info'); // 'info', 'success', 'error'
  const [selectedAgreement, setSelectedAgreement] = useState(null);

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      const response = await agreementAPI.getUserAgreements();
      if(response.data.status === 'success') {
        setAgreements(response.data.data.agreements);
      } else {
        console.error('Error fetching agreements:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching agreements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (agreementId, newStatus) => {
    try {
      const response = await agreementAPI.updateAgreementStatus(agreementId, newStatus);
      if(response.data.status === 'success') {
        setModalMessage(`Agreement status updated to ${newStatus}`);
        setModalType('success');
        setShowModal(true);
        // Refresh agreements list
        fetchAgreements();
      } else {
        setModalMessage(response.data.message || 'Failed to update agreement status');
        setModalType('error');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error updating agreement status:', error);
      setModalMessage('Failed to update agreement status');
      setModalType('error');
      setShowModal(true);
    }
  };

  const handleBack = () => {
    if (userRole === 'farmer') {
      navigate('/farmer-dashboard');
    } else {
      navigate('/contractor-dashboard');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="agreements-page" style={{ paddingTop: '70px' }}>
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

      <div className="agreements-container max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">My Agreements</h2>
        
        {loading ? (
          <div className="loading text-center py-10">Loading agreements...</div>
        ) : agreements.length === 0 ? (
          <div className="no-agreements text-center py-10">
            <p className="text-gray-600 text-lg">You don't have any agreements yet.</p>
            <button 
              className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg"
              onClick={() => navigate('/users-directory')}
            >
              Find Partners
            </button>
          </div>
        ) : (
          <div className="agreements-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            {agreements.map(agreement => (
              <div key={agreement._id} className="agreement-card bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Agreement #{agreement._id.substring(0, 8)}</h3>
                    <div className="mt-2 flex flex-wrap gap-4">
                      <div>
                        <span className="font-medium text-gray-700">Crop:</span>
                        <span className="ml-2 text-gray-600">{agreement.crop}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Season:</span>
                        <span className="ml-2 text-gray-600">{agreement.season}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Quantity:</span>
                        <span className="ml-2 text-gray-600">{agreement.quantity}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-4">
                      <div>
                        <span className="font-medium text-gray-700">Price:</span>
                        <span className="ml-2 text-gray-600">{agreement.price}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Duration:</span>
                        <span className="ml-2 text-gray-600">{agreement.duration} months</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <span className="font-medium text-gray-700">Partner:</span>
                      <span className="ml-2 text-gray-600">
                        {userRole === 'farmer' 
                          ? agreement.contractor?.name || 'N/A' 
                          : agreement.farmer?.name || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="mt-2">
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(agreement.status)}`}>
                        {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {agreement.status === 'pending' && (
                      <>
                        <button
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          onClick={() => handleUpdateStatus(agreement._id, 'accepted')}
                        >
                          Accept
                        </button>
                        <button
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          onClick={() => handleUpdateStatus(agreement._id, 'rejected')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {agreement.status === 'accepted' && (
                      <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        onClick={() => handleUpdateStatus(agreement._id, 'completed')}
                      >
                        Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <span className="font-medium text-gray-700">Terms:</span>
                  <p className="mt-1 text-gray-600">{agreement.terms}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="form-actions mt-8 flex justify-center gap-4">
          <button 
            type="button" 
            onClick={handleBack} 
            className="back-button bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg"
          >
            Back to Dashboard
          </button>
          <button 
            onClick={() => navigate('/users-directory')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            Find More Partners
          </button>
        </div>
      </div>
    </div>
  );
};

export default Agreements;