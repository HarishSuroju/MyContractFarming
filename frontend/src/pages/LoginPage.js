import React, { useState } from 'react';
import { authAPI } from '../services/api';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info'); // 'info', 'success', 'error'
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authAPI.login(formData);
      
      if (response.data.status === 'success') {
        const { token, user } = response.data.data;
        
        // Store token and user info in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userRole', user.role);
        
        // Set token in axios header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setModalMessage(`${t('login.welcomeBack', { name: user.name })} ${t('login.loggedInAs', { role: user.role })}`);
        setModalType('success');
        setShowModal(true);
        
        // Redirect based on user role
        setTimeout(() => {
          if (user.role === 'farmer') {
            navigate('/farmer-dashboard');
          } else {
            navigate('/contractor-dashboard');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Login error:', error);
      setModalMessage(error.response?.data?.message || t('login.errorMessage'));
      setModalType('error');
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      setModalMessage(t('login.enterEmail'));
      setModalType('error');
      setShowModal(true);
      return;
    }
    
    setForgotPasswordLoading(true);
    
    try {
      const response = await authAPI.forgotPassword(forgotPasswordEmail);
      
      setModalMessage(response.data.message);
      setModalType('success');
      setShowModal(true);
      
      // Close the forgot password form after successful submission
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordEmail('');
      }, 2000);
      
    } catch (error) {
      console.error('Forgot password error:', error);
      setModalMessage(error.response?.data?.message || t('login.resetEmailError'));
      setModalType('error');
      setShowModal(true);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleSignUpRedirect = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen flex flex-col relative z-10 pt-12">
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
                  {modalType === 'success' ? t('login.modal.successTitle') : modalType === 'error' ? t('login.modal.errorTitle') : t('login.modal.infoTitle')}
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
                {t('login.modal.okButton')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-lg shadow-md relative z-20">
        <h2 className="text-green-800 mt-0">
          {showForgotPassword ? t('login.resetPasswordTitle') : t('login.loginTitle')}
        </h2>
        
        {/* Forgot Password Form - Shown when user clicks "Forgot Password?" */}
        {showForgotPassword ? (
          <form onSubmit={handleForgotPasswordSubmit} className="text-left">
            <div className="mb-6">
              <label htmlFor="forgot-email" className="block mb-2 font-medium text-gray-700">{t('login.emailLabel')}</label>
              <input
                type="email"
                id="forgot-email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded box-border text-base"
                placeholder={t('login.emailPlaceholder')}
                required
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={forgotPasswordLoading}
                className="flex-1 p-3 border-none rounded cursor-pointer font-medium transition-bg duration-300 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{backgroundColor: '#0db60c'}}
                onMouseEnter={(e) => { if (!forgotPasswordLoading) e.target.style.opacity = '0.8'; }}
                onMouseLeave={(e) => { e.target.style.opacity = '1'; }}
              >
                {forgotPasswordLoading ? t('login.sending') : t('login.sendResetLink')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail('');
                }}
                className="p-3 border border-gray-300 rounded cursor-pointer font-medium transition-bg duration-300 bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                {t('login.cancel')}
              </button>
            </div>
            
            <div className="text-center mt-6">
              <p>{t('login.noAccount')} <button onClick={handleSignUpRedirect} className="bg-none border-none cursor-pointer underline font-medium" style={{color: '#0db60c'}}>{t('login.signUp')}</button></p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="text-left">
            <div className="mb-6">
              <label htmlFor="email" className="block mb-2 font-medium text-gray-700">{t('login.emailLabel')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded box-border text-base"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block mb-2 font-medium text-gray-700">{t('login.passwordLabel')}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded box-border text-base pr-10"
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
            
            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  {t('login.rememberMe')}
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-medium" style={{color: '#0db60c'}}
              >
                {t('login.forgotPassword')}
              </button>
            </div>
            
            <div className="flex justify-between mt-6">
              <button type="button" onClick={handleBack} className="p-3 border-none rounded cursor-pointer font-medium transition-bg duration-300 bg-gray-200 text-gray-700 hover:bg-gray-300">
                {t('login.backButton')}
              </button>
              <button type="submit" disabled={loading} className="p-3 border-none rounded cursor-pointer font-medium transition-bg duration-300 text-white disabled:opacity-50 disabled:cursor-not-allowed" style={{backgroundColor: '#0db60c'}} onMouseEnter={(e) => { if (!loading) e.target.style.opacity = '0.8'; }} onMouseLeave={(e) => { e.target.style.opacity = '1'; }}>
                {loading ? t('login.signingIn') : t('login.loginButton')}
              </button>
            </div>
          </form>
        )}
        
        <div className="text-center mt-6">
          <p>{t('login.noAccount')} <button onClick={handleSignUpRedirect} className="bg-none border-none text-green-500 cursor-pointer underline font-medium">{t('login.signUp')}</button></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;