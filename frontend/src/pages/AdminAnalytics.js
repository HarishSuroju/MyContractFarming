import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../services/api';

const AdminAnalytics = () => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics();
      setAnalytics(response.data.data.analytics);
      setLoading(false);
    } catch (err) {
      setError(t('errors.failedToLoadAnalytics'));
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const analyticsData = [
    {
      title: t('admin.totalUsers'),
      value: analytics?.totalUsers || 0,
      icon: '👥',
      color: 'bg-blue-500'
    },
    {
      title: t('admin.verifiedUsers'),
      value: analytics?.verifiedUsers || 0,
      icon: '✅',
      color: 'bg-green-500'
    },
    {
      title: t('admin.activeAgreements'),
      value: analytics?.activeAgreements || 0,
      icon: '📝',
      color: 'bg-purple-500'
    },
    {
      title: t('admin.completedContracts'),
      value: analytics?.completedContracts || 0,
      icon: '🏆',
      color: 'bg-yellow-500'
    },
    {
      title: t('admin.averageRating'),
      value: analytics?.averageRating || 0,
      icon: '⭐',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.analytics')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {analyticsData.map((item, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{item.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{item.value}</p>
              </div>
              <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.systemOverview')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{t('admin.userGrowth')}</h4>
            <p className="text-sm text-gray-600">{t('admin.userGrowthDescription')}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{t('admin.agreementTrends')}</h4>
            <p className="text-sm text-gray-600">{t('admin.agreementTrendsDescription')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;