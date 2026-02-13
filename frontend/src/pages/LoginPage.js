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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-24 pb-10">

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border-t-4 ${
              modalType === 'success'
                ? 'border-green-500'
                : modalType === 'error'
                ? 'border-red-500'
                : 'border-blue-500'
            }`}
          >
            <h3 className="text-lg font-semibold mb-3">
              {modalType === 'success'
                ? t('login.modal.successTitle')
                : modalType === 'error'
                ? t('login.modal.errorTitle')
                : t('login.modal.infoTitle')}
            </h3>

            <p className="text-gray-600 mb-6">{modalMessage}</p>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
            >
              {t('login.modal.okButton')}
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

        <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
          {showForgotPassword
            ? t('login.resetPasswordTitle')
            : t('login.loginTitle')}
        </h2>

        {/* FORGOT PASSWORD FORM */}
        {showForgotPassword ? (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.emailLabel')}
              </label>
              <input
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                placeholder={t('login.emailPlaceholder')}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={forgotPasswordLoading}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition disabled:opacity-50"
              >
                {forgotPasswordLoading
                  ? t('login.sending')
                  : t('login.sendResetLink')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail('');
                }}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl transition"
              >
                {t('login.cancel')}
              </button>
            </div>

          </form>
        ) : (

          /* LOGIN FORM */
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.emailLabel')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.passwordLabel')}
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 text-gray-500 hover:text-gray-700"
                >
                  👁
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-green-600"
                />
                {t('login.rememberMe')}
              </label>

              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-green-600 hover:underline"
              >
                {t('login.forgotPassword')}
              </button>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl transition"
              >
                {t('login.backButton')}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition disabled:opacity-50"
              >
                {loading
                  ? t('login.signingIn')
                  : t('login.loginButton')}
              </button>
            </div>

          </form>
        )}

        {/* Bottom SignUp Link */}
        <div className="text-center mt-6 text-sm">
          {t('login.noAccount')}{' '}
          <button
            onClick={handleSignUpRedirect}
            className="text-green-600 font-medium hover:underline"
          >
            {t('login.signUp')}
          </button>
        </div>

      </div>
    </div>
  );

};

export default LoginPage;