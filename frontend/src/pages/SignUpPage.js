import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../services/api';

const SignUpPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info'); // 'info', 'success', 'error'
  const [step, setStep] = useState(1); // 1: select role, 2: enter details

  const handleRoleSelect = (role) => {
    setUserType(role);
    setStep(2);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setModalMessage(t('signUp.passwordMismatch'));
      setModalType('error');
      setShowModal(true);
      return;
    }

    try {
      // Call the actual API
      const response = await authAPI.register({
        ...formData,
        role: userType
      });
      
      // Store token, userId, and user role
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('userId', response.data.data.user.id);
      localStorage.setItem('userRole', userType);
      
      setModalMessage(t('signUp.successMessage'));
      setModalType('success');
      setShowModal(true);
      
      // Navigate to profile builder after a short delay
      setTimeout(() => {
        navigate('/profile-builder');
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response && error.response.data) {
        setModalMessage(error.response.data.message || t('signUp.errorMessage'));
      } else {
        setModalMessage('Signup failed. Please try again.');
      }
      setModalType('error');
      setShowModal(true);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="signup-page" style={{ paddingTop: '0px' }}>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-lg shadow-xl w-full max-w-md p-6 ${modalType === 'success' ? 'border-t-4 border-green-500' : modalType === 'error' ? 'border-t-4 border-red-500' : 'border-t-4 border-blue-500'}`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${modalType === 'success' ? 'bg-green-100' : modalType === 'error' ? 'bg-red-100' : 'bg-blue-100'}`}>
                {modalType === 'success' ? (
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : modalType === 'error' ? (
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalType === 'success' ? t('signUp.modal.successTitle') : modalType === 'error' ? t('signUp.modal.errorTitle') : t('signUp.modal.infoTitle')}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {modalMessage}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                onClick={() => setShowModal(false)}
              >
                {t('signUp.modal.okButton')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-lg shadow-md relative z-20">
        <h2>{step === 1 ? t('signUp.selectRoleTitle') : t('signUp.createAccountTitle')}</h2>
        
        {step === 1 ? (
          <div className="text-center">
            <p>{t('signUp.roleSelectionSubtitle')}</p>
            <div className="flex flex-col gap-4 mt-8">
              <button 
                className="p-6 border-2 border-gray-300 rounded-lg bg-white cursor-pointer transition-all duration-300 text-left hover:border-green-500 hover:shadow-md"
                onClick={() => handleRoleSelect('farmer')}
              >
                <h3 className="mt-0 text-green-800">{t('signUp.farmer')}</h3>
                <p>{t('signUp.farmerDescription')}</p>
              </button>
              <button 
                className="p-6 border-2 border-gray-300 rounded-lg bg-white cursor-pointer transition-all duration-300 text-left hover:border-blue-500 hover:shadow-md"
                onClick={() => handleRoleSelect('contractor')}
              >
                <h3 className="mt-0 text-green-800">{t('signUp.contractor')}</h3>
                <p>{t('signUp.contractorDescription')}</p>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="text-left">
            <div className="mb-6">
              <label htmlFor="name" className="block mb-2 font-medium text-gray-700">{t('signUp.fullNameLabel')}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded box-border text-base"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="email" className="block mb-2 font-medium text-gray-700">{t('signUp.emailLabel')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded box-border text-base"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="phone" className="block mb-2 font-medium text-gray-700">{t('signUp.phoneLabel')}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded box-border text-base"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block mb-2 font-medium text-gray-700">{t('signUp.passwordLabel')}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded box-border text-base pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block mb-2 font-medium text-gray-700">{t('signUp.confirmPasswordLabel')}</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded box-border text-base pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <button type="button" onClick={handleBack} className="p-3 border-none rounded cursor-pointer font-medium transition-bg duration-300 bg-gray-200 text-gray-700 hover:bg-gray-300">
                {t('signUp.backButton')}
              </button>
              <button type="submit" className="p-3 border-none rounded cursor-pointer font-medium transition-bg duration-300 text-white" style={{backgroundColor: userType === 'farmer' ? '#0db60c' : '#29003b'}} onMouseEnter={(e) => { e.target.style.opacity = '0.8'; }} onMouseLeave={(e) => { e.target.style.opacity = '1'; }}>
                {t('signUp.createAccountButton')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;