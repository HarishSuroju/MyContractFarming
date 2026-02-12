import React from 'react';
import { useTranslation } from 'react-i18next';
import IncomingConnectionRequests from '../components/IncomingConnectionRequests';
import OutgoingConnectionRequests from '../components/OutgoingConnectionRequests';

const ConnectionRequests = () => {
  const { t } = useTranslation();

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 pt-28 pb-12">
    <div className="max-w-6xl mx-auto px-6">

      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('connection.requestsPageTitle')}
        </h1>
        <p className="text-gray-500 mt-2">
          Manage your incoming and outgoing connection requests.
        </p>
        <div className="w-20 h-1 bg-green-600 rounded-full mt-4"></div>
      </div>

      {/* Requests Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Incoming */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 
          shadow-[0_6px_20px_rgba(16,185,129,0.18)]
          hover:shadow-[0_10px_28px_rgba(16,185,129,0.30)]
          transition-all duration-300">

          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Incoming Requests
          </h2>

          <IncomingConnectionRequests />
        </div>

        {/* Outgoing */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 
          shadow-[0_6px_20px_rgba(16,185,129,0.18)]
          hover:shadow-[0_10px_28px_rgba(16,185,129,0.30)]
          transition-all duration-300">

          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Outgoing Requests
          </h2>

          <OutgoingConnectionRequests />
        </div>

      </div>
    </div>
  </div>
);
};

export default ConnectionRequests;