import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminAnalytics from './AdminAnalytics';
import AdminUsers from './AdminUsers';
import AdminAgreements from './AdminAgreements';
import AdminPayments from './AdminPayments';
import AdminFraud from './AdminFraud';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('analytics');

  const tabs = [
    { id: 'analytics', label: t('admin.analytics'), icon: '📊' },
    { id: 'users', label: t('admin.userManagement'), icon: '👥' },
    { id: 'agreements', label: t('admin.agreementManagement'), icon: '📝' },
    { id: 'payments', label: t('admin.paymentMonitoring'), icon: '💳' },
    { id: 'fraud', label: t('admin.fraudAlerts'), icon: '⚠️' }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'analytics':
        return <AdminAnalytics />;
      case 'users':
        return <AdminUsers />;
      case 'agreements':
        return <AdminAgreements />;
      case 'payments':
        return <AdminPayments />;
      case 'fraud':
        return <AdminFraud />;
      default:
        return <AdminAnalytics />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.dashboardTitle')}</h1>
          <p className="text-gray-600 mt-2">{t('admin.dashboardSubtitle')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;