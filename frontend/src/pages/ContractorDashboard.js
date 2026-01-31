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
    <div className="min-h-screen pt-16 px-4 pb-8" style={{background: theme.gradient}}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" style={{color: theme.primary}}>Contractor Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your contracts, farmers, and business operations.</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div 
            onClick={handleViewContracts}
            className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-all cursor-pointer"
            style={{borderTop: theme.border}}
          >
            <div className="text-4xl mb-2">🚜</div>
            <h3 className="text-xl font-semibold" style={{color: theme.primary}}>Active Contracts</h3>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? '...' : activeContracts}
            </p>
          </div>
          <div 
            onClick={handleViewInvestments}
            className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-all cursor-pointer"
            style={{borderTop: theme.border}}
          >
            <div className="text-4xl mb-2">💰</div>
            <h3 className="text-xl font-semibold" style={{color: theme.primary}}>Total Investments</h3>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? '...' : `$${totalInvestments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </p>
          </div>
          <div 
            onClick={handleViewNotifications}
            className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-all cursor-pointer"
            style={{borderTop: theme.border}}
          >
            <div className="text-4xl mb-2">🔔</div>
            <h3 className="text-xl font-semibold" style={{color: theme.primary}}>Notifications</h3>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? '...' : unreadNotifications}
            </p>
          </div>
        </section>

        {/* Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <div
            className="bg-white shadow-lg rounded-xl p-8 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 cursor-pointer border-2"
            onClick={handleViewContracts}
            style={{borderColor: theme.primary}}
          >
            <div className="text-6xl mb-4 group-hover:animate-pulse">📝</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-900" style={{color: theme.primary}}>My Contracts</h3>
            <p className="text-gray-600 group-hover:text-gray-800">View and manage your active contracts.</p>
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{color: theme.primary}}>→ View Now</div>
          </div>
          <div
            className="bg-white shadow-lg rounded-xl p-8 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 cursor-pointer border-2"
            onClick={handleViewProfile}
            style={{borderColor: theme.primary}}
          >
            <div className="text-6xl mb-4 group-hover:rotate-12 transition-transform duration-300">🏢</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-900" style={{color: theme.primary}}>My Profile</h3>
            <p className="text-gray-600 group-hover:text-gray-800">Update your company details and preferences.</p>
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{color: theme.primary}}>→ Edit Profile</div>
          </div>
        </section>

        {/* Connection Requests Preview */}
        <section className="mt-8">
          <ConnectionRequestsPreview />
        </section>
      </div>
    </div>
  );
};

export default ContractorDashboard;