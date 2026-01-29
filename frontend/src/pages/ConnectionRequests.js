import React from 'react';
import { useTranslation } from 'react-i18next';
import IncomingConnectionRequests from '../components/IncomingConnectionRequests';
import OutgoingConnectionRequests from '../components/OutgoingConnectionRequests';

const ConnectionRequests = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-8">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          {t('connection.requestsPageTitle')}
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <IncomingConnectionRequests />
          </div>
          
          <div>
            <OutgoingConnectionRequests />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionRequests;