import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { profileAPI } from '../services/api';

const ProposalCreation = () => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposalData, setProposalData] = useState({
    cropType: '',
    duration: '',
    monthlySalary: '',
    inputSupply: '',
    description: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getUserProfile(userId);
      if (response.data && response.data.user) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProposalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In real implementation, this would send the proposal to the backend
    console.log('Submitting proposal:', proposalData);
    
    // Redirect to proposal status page
    navigate(`/proposal-status/${userId}`);
  };

  const handleCancel = () => {
    navigate(-1);
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

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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
              {t('proposal.creation.title')}
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-700">
                {t('proposal.creation.description')}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="cropType" className="block text-sm font-bold text-gray-700 mb-2">
                  {t('proposal.creation.cropType')}
                </label>
                <input
                  type="text"
                  id="cropType"
                  name="cropType"
                  value={proposalData.cropType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={t('proposal.creation.cropTypePlaceholder')}
                />
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-bold text-gray-700 mb-2">
                  {t('proposal.creation.duration')}
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={proposalData.duration}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={t('proposal.creation.durationPlaceholder')}
                />
              </div>
              
              <div>
                <label htmlFor="monthlySalary" className="block text-sm font-bold text-gray-700 mb-2">
                  {t('proposal.creation.monthlySalary')}
                </label>
                <input
                  type="text"
                  id="monthlySalary"
                  name="monthlySalary"
                  value={proposalData.monthlySalary}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={t('proposal.creation.monthlySalaryPlaceholder')}
                />
              </div>
              
              <div>
                <label htmlFor="inputSupply" className="block text-sm font-bold text-gray-700 mb-2">
                  {t('proposal.creation.inputSupply')}
                </label>
                <input
                  type="text"
                  id="inputSupply"
                  name="inputSupply"
                  value={proposalData.inputSupply}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={t('proposal.creation.inputSupplyPlaceholder')}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">
                {t('proposal.creation.descriptionLabel')}
              </label>
              <textarea
                id="description"
                name="description"
                value={proposalData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={t('proposal.creation.descriptionPlaceholder')}
              ></textarea>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="submit"
                className="py-4 px-8 rounded-xl font-bold text-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 bg-gradient-to-r from-green-500 to-green-600 border-2 border-green-500 hover:from-green-600 hover:to-green-700"
              >
                {t('proposal.creation.submitButton')}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                className="py-4 px-8 rounded-xl font-bold text-lg text-gray-800 bg-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border-2 border-gray-300 hover:bg-gray-300"
              >
                {t('proposal.creation.cancelButton')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProposalCreation;