import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ConnectionRequestsPreview from '../components/ConnectionRequestsPreview';

const FarmerDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleViewContracts = () => {
    // Navigate to contracts view
    navigate('/agreements');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 pt-16 px-4 pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-800">Farmer Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your crops, contracts, and partnerships.</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">🌾</div>
            <h3 className="text-xl font-semibold text-green-700">Active Contracts</h3>
            <p className="text-2xl font-bold text-green-800">5</p> {/* Placeholder */}
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">📈</div>
            <h3 className="text-xl font-semibold text-green-700">Total Earnings</h3>
            <p className="text-2xl font-bold text-green-800">$12,500</p> {/* Placeholder */}
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">🔔</div>
            <h3 className="text-xl font-semibold text-green-700">Notifications</h3>
            <p className="text-2xl font-bold text-green-800">3</p> {/* Placeholder */}
          </div>
        </section>

        {/* Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <div
            className="bg-white shadow-lg rounded-xl p-8 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-200 hover:border-green-300 group"
            onClick={handleViewContracts}
          >
            <div className="text-6xl mb-4 group-hover:animate-pulse">📝</div>
            <h3 className="text-xl font-semibold text-green-700 mb-2 group-hover:text-green-900">My Contracts</h3>
            <p className="text-gray-600 group-hover:text-gray-800">View and manage your active contracts.</p>
            <div className="mt-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">→ View Now</div>
          </div>
          <div
            className="bg-white shadow-lg rounded-xl p-8 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-200 hover:border-green-300 group"
            onClick={handleViewProfile}
          >
            <div className="text-6xl mb-4 group-hover:rotate-12 transition-transform duration-300">👨‍🌾</div>
            <h3 className="text-xl font-semibold text-green-700 mb-2 group-hover:text-green-900">My Profile</h3>
            <p className="text-gray-600 group-hover:text-gray-800">Update your farming details and preferences.</p>
            <div className="mt-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">→ Edit Profile</div>
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

export default FarmerDashboard;