import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../services/api';

const AdminFraud = () => {
  const { t } = useTranslation();
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFraudAlerts();
  }, []);

  const fetchFraudAlerts = async () => {
    try {
      const response = await adminAPI.getFraudAlerts();
      setFraudAlerts(response.data.data.fraudAlerts);
      setLoading(false);
    } catch (err) {
      setError(t('errors.failedToLoadFraudAlerts'));
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.fraudAlerts')}</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {fraudAlerts.map((alert) => (
          <div key={alert.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                <p className="text-xs text-gray-500 mt-2">{t('admin.timestamp')}: {alert.timestamp}</p>
                {alert.userId && (
                  <p className="text-xs text-gray-500 mt-1">{t('admin.userId')}: {alert.userId}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(alert.severity)}`}>
                {alert.severity}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFraud;