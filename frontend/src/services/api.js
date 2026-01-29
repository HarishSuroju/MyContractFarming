import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or state management
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Clear token if it's expired and the request was to a protected route
    if (error.response && error.response.status === 403 && 
        error.response.data.message && 
        error.response.data.message.includes('expired')) {
      localStorage.removeItem('token');
    }
      
    // Handle common errors
    if (!error.response) {
      console.error('Network error - Please check your connection');
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfileImage: (imageData) => api.put('/auth/profile/image', imageData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data)
};

// Profile API calls
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  getMatches: () => api.get('/profile/match'),
  createFarmerProfile: (profileData) => api.post('/profile/farmer', profileData),
  createContractorProfile: (profileData) => api.post('/profile/contractor', profileData),
  // Create a separate axios instance for public API calls to avoid token attachment
  getAllUsers: () => {
    // Create a temporary axios instance without the auth interceptor
    // Remove '/api' from the base URL if it exists to avoid double nesting
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const cleanBaseUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
    
    const publicApi = axios.create({
      baseURL: cleanBaseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return publicApi.get('/api/users/directory');
  },

  // Get a single user's profile by ID
  getUserProfile: (userId) => {
    // Create a temporary axios instance without the auth interceptor
    // Remove '/api' from the base URL if it exists to avoid double nesting
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const cleanBaseUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
    
    const publicApi = axios.create({
      baseURL: cleanBaseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return publicApi.get(`/api/profile/user/${userId}`);
  }
};

// Agreement API calls
export const agreementAPI = {
  createAgreement: (agreementData) => api.post('/agreements', agreementData),
  sendAgreement: (agreementId) => api.put(`/agreements/${agreementId}/send`),
  sendAgreementToFarmer: (agreementId) => api.put(`/agreements/${agreementId}/send-to-farmer`),
  getUserAgreements: () => api.get('/agreements'),
  getAgreementById: (agreementId) => api.get(`/agreements/${agreementId}`),
  updateAgreement: (agreementId, agreementData) => api.put(`/agreements/${agreementId}`, agreementData),
  updateAgreementStatus: (agreementId, status) => api.put(`/agreements/${agreementId}/status`, { status }),
  sendOtp: (agreementId) => api.post(`/agreements/${agreementId}/send-otp`),
  acceptAgreement: (agreementId, otp) => api.post(`/agreements/${agreementId}/accept`, { otp }),
  approveAgreement: (agreementId, approved) => api.put(`/admin/agreements/${agreementId}/approve`, { approved })
};

// Connection API calls
export const connectionAPI = {
  createConnectionRequest: (connectionData) => api.post('/connections/requests', connectionData),
  getConnectionRequests: () => api.get('/connections/requests'),
  updateConnectionRequestStatus: (requestId, status) => api.patch(`/connections/requests/${requestId}/status`, { status }),
  createProposal: (proposalData) => api.post('/connections/proposals', proposalData),
  getProposals: () => api.get('/connections/proposals'),
  updateProposalStatus: (proposalId, status) => api.patch(`/connections/proposals/${proposalId}/status`, { status }),
  submitInterest: (interestData) => api.post('/connections/interests', interestData),
  getInterests: () => api.get('/connections/interests')
};

// Admin API calls
export const adminAPI = {
  // User management
  getAllUsers: () => api.get('/admin/users'),
  verifyUser: (userId, status) => api.put(`/admin/users/${userId}/verify`, { status }),
  blockUser: (userId, block) => api.put(`/admin/users/${userId}/block`, { block }),
  
  // Agreement management
  getAllAgreements: () => api.get('/admin/agreements'),
  approveAgreement: (agreementId, approved) => api.put(`/admin/agreements/${agreementId}/approve`, { approved }),
  
  // Payment monitoring
  getPayments: () => api.get('/admin/payments'),
  
  // Fraud alerts
  getFraudAlerts: () => api.get('/admin/fraud'),
  
  // Analytics
  getAnalytics: () => api.get('/admin/analytics')
};

// Notification API calls
export const notificationAPI = {
  createNotification: (notificationData) => api.post('/notifications/create', notificationData),
  getUserNotifications: (params = {}) => api.get('/notifications', { params }),
  markNotificationAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllNotificationsAsRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count')
};

// Message API calls
export const messageAPI = {
  sendMessage: (messageData) => api.post('/messages/send', messageData),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  getUnreadCount: () => api.get('/messages/unread-count'),
  markAsRead: (messageId) => api.patch(`/messages/mark-read/${messageId}`),
  setTyping: (typingData) => api.post('/messages/typing', typingData)
};

export default api;