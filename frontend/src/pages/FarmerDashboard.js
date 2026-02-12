import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ConnectionRequestsPreview from '../components/ConnectionRequestsPreview';
import { agreementAPI, notificationAPI } from '../services/api';
import { getThemeByRole } from '../utils/colorTheme';

const FarmerDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = getThemeByRole('farmer');
  const [activeContracts, setActiveContracts] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch agreements
        const agreementsResponse = await agreementAPI.getUserAgreements();
        console.log('[FarmerDashboard] Full response:', agreementsResponse);
        console.log('[FarmerDashboard] Response data:', agreementsResponse.data);
        console.log('[FarmerDashboard] Response data.data:', agreementsResponse.data?.data);
        console.log('[FarmerDashboard] All keys in response.data:', Object.keys(agreementsResponse.data || {}));
        
        // Handle different response structures
        let agreements = [];
        if (Array.isArray(agreementsResponse.data)) {
          console.log('[FarmerDashboard] Using response.data as array');
          agreements = agreementsResponse.data;
        } else if (agreementsResponse.data?.data && Array.isArray(agreementsResponse.data.data)) {
          console.log('[FarmerDashboard] Using response.data.data as array');
          agreements = agreementsResponse.data.data;
        } else if (agreementsResponse.data?.data?.agreements && Array.isArray(agreementsResponse.data.data.agreements)) {
          console.log('[FarmerDashboard] Using response.data.data.agreements as array');
          agreements = agreementsResponse.data.data.agreements;
        } else if (agreementsResponse.data?.agreements && Array.isArray(agreementsResponse.data.agreements)) {
          console.log('[FarmerDashboard] Using response.data.agreements as array');
          agreements = agreementsResponse.data.agreements;
        } else {
          console.log('[FarmerDashboard] No array found, checking what we have...');
          console.log('[FarmerDashboard] typeof response.data.data:', typeof agreementsResponse.data?.data);
          console.log('[FarmerDashboard] response.data.data value:', agreementsResponse.data?.data);
          agreements = [];
        }
        
        console.log('[FarmerDashboard] Final agreements array:', agreements);
        console.log('[FarmerDashboard] Agreement count:', agreements.length);
        
        // Count active contracts (accepted, confirmed, or ongoing statuses)
        const activeCount = agreements.filter(
          (agreement) =>
            agreement.status === 'accepted_by_farmer' ||
            agreement.status === 'accepted_by_contractor' ||
            agreement.status === 'agreement_confirmed'
        ).length;
        setActiveContracts(activeCount);

        // Calculate total earnings from confirmed agreements
        const earnings = agreements
          .filter((agreement) => agreement.status === 'agreement_confirmed')
          .reduce((sum, agreement) => {
            const salary = parseFloat(agreement.salary) || 0;
            return sum + salary;
          }, 0);
        setTotalEarnings(earnings);

        // Fetch unread notifications count
        const notificationsResponse = await notificationAPI.getUnreadCount();
        setUnreadNotifications(notificationsResponse.data?.unreadCount || 0);

        setError(null);
      } catch (err) {
        console.error('[FarmerDashboard] Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleViewContracts = () => {
    navigate('/agreements');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  const handleViewNotifications = () => {
    navigate('/dashboard/requests');
  };

  const handleViewEarnings = () => {
    // Navigate to agreements where earnings are calculated from confirmed agreements
    navigate('/agreements');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
  <div className="min-h-screen bg-gray-50 pt-24 pb-10 px-6">
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Farmer Dashboard
        </h1>
        <p className="text-gray-500 mt-2">
          Manage your crops and earnings.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div
          onClick={handleViewContracts}
          className="bg-white rounded-2xl p-6 border border-green-400 
          shadow-[0_6px_16px_rgba(16,185,129,0.18)]
          hover:shadow-[0_8px_22px_rgba(16,185,129,0.28)]
          transition-all duration-300 cursor-pointer"
        >
          <p className="text-sm text-gray-500">Active Contracts</p>
          <h2 className="text-3xl font-bold mt-2 text-gray-900">
            {loading ? "..." : activeContracts}
          </h2>
        </div>

        <div
          onClick={handleViewEarnings}
          className="bg-white rounded-2xl p-6 border border-green-400 
          shadow-[0_6px_20px_rgba(16,185,129,0.22)]
          hover:shadow-[0_10px_28px_rgba(16,185,129,0.35)]
          transition-all duration-300 cursor-pointer"
        >
          <p className="text-sm text-gray-500">Total Earnings</p>
          <h2 className="text-3xl font-bold mt-2 text-gray-900">
            {loading ? "..." : `$${totalEarnings.toLocaleString()}`}
          </h2>
        </div>

        <div
          onClick={handleViewNotifications}
          className="bg-white rounded-2xl p-6 border border-green-400 
          shadow-[0_6px_20px_rgba(16,185,129,0.22)]
          hover:shadow-[0_10px_28px_rgba(16,185,129,0.35)]
          transition-all duration-300 cursor-pointer"
        >
          <p className="text-sm text-gray-500">Notifications</p>
          <h2 className="text-3xl font-bold mt-2 text-gray-900">
            {loading ? "..." : unreadNotifications}
          </h2>
        </div>

      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div
          onClick={handleViewContracts}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 border border-green-400 
          shadow-[0_6px_20px_rgba(16,185,129,0.18)] 
          hover:shadow-[0_10px_28px_rgba(16,185,129,0.35)] 
          hover:-translate-y-1 
          transition-all duration-300 cursor-pointer"

        >
          <h3 className="text-xl font-semibold text-gray-900">
            My Contracts
          </h3>
          <p className="text-gray-500 mt-2">
            View and manage agreements.
          </p>
        </div>

        <div
          onClick={handleViewProfile}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 border border-green-400 
          shadow-[0_6px_20px_rgba(16,185,129,0.18)] 
          hover:shadow-[0_10px_28px_rgba(16,185,129,0.35)] 
          hover:-translate-y-1 
          transition-all duration-300 cursor-pointer"
        >
          <h3 className="text-xl font-semibold text-gray-900">
            My Profile
          </h3>
          <p className="text-gray-500 mt-2">
            Update your farming information.
          </p>
        </div>

      </div>

      {/* Connection Preview */}
      <div className="mt-10">
        <ConnectionRequestsPreview />
      </div>

    </div>
  </div>
);

};

export default FarmerDashboard;