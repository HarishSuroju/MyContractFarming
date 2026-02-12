import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ConnectionRequestsPreview from '../components/ConnectionRequestsPreview';
import { agreementAPI, notificationAPI } from '../services/api';
import { getThemeByRole } from '../utils/colorTheme';

const ContractorDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = getThemeByRole('contractor');
  const [activeContracts, setActiveContracts] = useState(0);
  const [totalInvestments, setTotalInvestments] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch agreements
        const agreementsResponse = await agreementAPI.getUserAgreements();
        console.log('[ContractorDashboard] Full response:', agreementsResponse);
        console.log('[ContractorDashboard] Response data:', agreementsResponse.data);
        console.log('[ContractorDashboard] Response data.data:', agreementsResponse.data?.data);
        console.log('[ContractorDashboard] All keys in response.data:', Object.keys(agreementsResponse.data || {}));
        
        // Handle different response structures
        let agreements = [];
        if (Array.isArray(agreementsResponse.data)) {
          console.log('[ContractorDashboard] Using response.data as array');
          agreements = agreementsResponse.data;
        } else if (agreementsResponse.data?.data && Array.isArray(agreementsResponse.data.data)) {
          console.log('[ContractorDashboard] Using response.data.data as array');
          agreements = agreementsResponse.data.data;
        } else if (agreementsResponse.data?.data?.agreements && Array.isArray(agreementsResponse.data.data.agreements)) {
          console.log('[ContractorDashboard] Using response.data.data.agreements as array');
          agreements = agreementsResponse.data.data.agreements;
        } else if (agreementsResponse.data?.agreements && Array.isArray(agreementsResponse.data.agreements)) {
          console.log('[ContractorDashboard] Using response.data.agreements as array');
          agreements = agreementsResponse.data.agreements;
        } else {
          console.log('[ContractorDashboard] No array found, checking what we have...');
          console.log('[ContractorDashboard] typeof response.data.data:', typeof agreementsResponse.data?.data);
          console.log('[ContractorDashboard] response.data.data value:', agreementsResponse.data?.data);
          agreements = [];
        }
        
        console.log('[ContractorDashboard] Final agreements array:', agreements);
        console.log('[ContractorDashboard] Agreement count:', agreements.length);
        
        // Count active contracts (accepted, confirmed, or ongoing statuses)
        const activeCount = agreements.filter(
          (agreement) =>
            agreement.status === 'accepted_by_farmer' ||
            agreement.status === 'accepted_by_contractor' ||
            agreement.status === 'agreement_confirmed'
        ).length;
        setActiveContracts(activeCount);

        // Calculate total investments from all active agreements
        const investments = agreements
          .filter(
            (agreement) =>
              agreement.status === 'pending' ||
              agreement.status === 'sent_to_contractor' ||
              agreement.status === 'edited_by_contractor' ||
              agreement.status === 'accepted_by_farmer' ||
              agreement.status === 'accepted_by_contractor' ||
              agreement.status === 'agreement_confirmed'
          )
          .reduce((sum, agreement) => {
            const salary = parseFloat(agreement.salary) || 0;
            return sum + salary;
          }, 0);
        setTotalInvestments(investments);

        // Fetch unread notifications count
        const notificationsResponse = await notificationAPI.getUnreadCount();
        setUnreadNotifications(notificationsResponse.data?.unreadCount || 0);

        setError(null);
      } catch (err) {
        console.error('[ContractorDashboard] Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleViewContracts = () => {
    // Navigate to contracts view
    navigate('/agreements');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  const handleViewNotifications = () => {
    navigate('/dashboard/requests');
  };

  const handleViewInvestments = () => {
    // Navigate to agreements where investments are shown
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
          Contractor Dashboard
        </h1>
        <p className="text-gray-500 mt-2">
          Manage your contracts and investments.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div
          onClick={handleViewContracts}
          className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition cursor-pointer"
        >
          <p className="text-sm text-gray-500">Active Contracts</p>
          <h2 className="text-3xl font-bold mt-2 text-gray-900">
            {loading ? "..." : activeContracts}
          </h2>
        </div>

        <div
          onClick={handleViewInvestments}
          className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition cursor-pointer"
        >
          <p className="text-sm text-gray-500">Total Investments</p>
          <h2 className="text-3xl font-bold mt-2 text-gray-900">
            {loading ? "..." : `$${totalInvestments.toLocaleString()}`}
          </h2>
        </div>

        <div
          onClick={handleViewNotifications}
          className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition cursor-pointer"
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
          className="bg-white rounded-2xl p-8 shadow-sm border hover:shadow-lg hover:-translate-y-1 transition cursor-pointer"
        >
          <h3 className="text-xl font-semibold text-gray-900">
            My Contracts
          </h3>
          <p className="text-gray-500 mt-2">
            View and manage active agreements.
          </p>
        </div>

        <div
          onClick={handleViewProfile}
          className="bg-white rounded-2xl p-8 shadow-sm border hover:shadow-lg hover:-translate-y-1 transition cursor-pointer"
        >
          <h3 className="text-xl font-semibold text-gray-900">
            My Profile
          </h3>
          <p className="text-gray-500 mt-2">
            Update your company information.
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

export default ContractorDashboard;