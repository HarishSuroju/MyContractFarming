import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { profileAPI } from '../services/api';

const AgreementSummary = () => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agreementData, setAgreementData] = useState({
    crop: 'Rice',
    landArea: '2 acres',
    duration: '6 months',
    monthlyPayment: '₹15,000',
    inputsProvided: ['Seeds', 'Fertilizers', 'Pesticides']
  });

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getUserProfile(userId);
      
      // Check the correct path for user data based on API response structure
      if (response.data && response.data.data && response.data.data.user) {
        setUser(response.data.data.user);
      } else if (response.data && response.data.user) {
        // Fallback to old structure
        setUser(response.data.user);
      } else {
        console.log('No user data found in response');
        console.log('Response structure:', JSON.stringify(response.data, null, 2));
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAgree = () => {
    alert(t('agreement.summary.agreed'));
    // In real implementation, this would save the agreement to the database
    navigate('/agreements');
  };

  const handleNotInterested = () => {
    alert(t('agreement.summary.notInterested'));
    // In real implementation, this would update the agreement status
    navigate(-1);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-xl text-gray-600">{t('profileDetail.loading')}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-xl text-red-600">{t('profileDetail.userNotFound')}</div>
      </div>
    );
  }

  const isFarmer = user.role?.toLowerCase() === 'farmer';
  const roleClass = isFarmer ? 'farmer' : 'contractor';
  const roleGradient = isFarmer ? 'from-green-500 to-green-600' : 'from-blue-500 to-blue-600';

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className={`rounded-3xl p-10 text-center relative overflow-hidden bg-gradient-to-br ${roleGradient} text-white`}>
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          
          <div className="relative z-10">
            <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-bold shadow-lg ${isFarmer ? 'bg-green-400 bg-opacity-25' : 'bg-blue-400 bg-opacity-25'} border-4 border-white border-opacity-40`}>
              {getInitials(user.name)}
            </div>
            
            <h1 className="text-3xl font-bold mb-3">{user.name}</h1>
            <span className="inline-block px-6 py-2 rounded-full font-bold text-lg bg-white bg-opacity-25 backdrop-blur-sm">
              {user.role === 'farmer' ? t('profileDetail.farmer') : t('profileDetail.contractor')}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 mt-6 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {t('agreement.summary.title')}
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-700">
                {t('agreement.summary.description')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                {t('agreement.summary.proposalDetails')}
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-gray-600">{t('agreement.summary.crop')}</span>
                  <span className="font-bold">{agreementData.crop}</span>
                </div>
                
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-gray-600">{t('agreement.summary.landArea')}</span>
                  <span className="font-bold">{agreementData.landArea}</span>
                </div>
                
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-gray-600">{t('agreement.summary.duration')}</span>
                  <span className="font-bold">{agreementData.duration}</span>
                </div>
                
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-gray-600">{t('agreement.summary.monthlyPayment')}</span>
                  <span className="font-bold">{agreementData.monthlyPayment}</span>
                </div>
                
                <div className="pt-3">
                  <div className="text-gray-600 mb-2">{t('agreement.summary.inputsProvided')}:</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {agreementData.inputsProvided.map((input, index) => (
                      <li key={index} className="font-bold">{input}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-green-800 mb-4 text-center">
                {t('agreement.summary.benefits')}
              </h3>
              
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>{t('agreement.summary.benefit1')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>{t('agreement.summary.benefit2')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>{t('agreement.summary.benefit3')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>{t('agreement.summary.benefit4')}</span>
                </li>
              </ul>
              
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h4 className="font-bold text-yellow-800 mb-2">{t('agreement.summary.note')}</h4>
                <p className="text-sm text-yellow-700">{t('agreement.summary.noteText')}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleAgree}
              className="py-4 px-8 rounded-xl font-bold text-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 bg-gradient-to-r from-green-500 to-green-600 border-2 border-green-500 hover:from-green-600 hover:to-green-700 flex items-center justify-center gap-2"
            >
              <span>✅</span> {t('agreement.summary.agree')}
            </button>
            
            <button
              onClick={handleNotInterested}
              className="py-4 px-8 rounded-xl font-bold text-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 bg-gradient-to-r from-red-500 to-red-600 border-2 border-red-500 hover:from-red-600 hover:to-red-700 flex items-center justify-center gap-2"
            >
              <span>❌</span> {t('agreement.summary.notInterested')}
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="py-3 px-6 rounded-xl font-bold text-gray-800 bg-gray-200 shadow hover:shadow-md transition-all duration-300 border-2 border-gray-300 hover:bg-gray-300"
          >
            {t('agreement.summary.back')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgreementSummary;