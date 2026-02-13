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
  const [emailVerified, setEmailVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOTPField, setShowOTPField] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

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
  const handleSendOTP = async () => {
    try {
      setOtpLoading(true);
      await authAPI.sendOTP({ email: formData.email });
      setShowOTPField(true);
      alert("OTP sent to email");
    } catch (error) {
      alert("Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      await authAPI.verifyOTP({
        email: formData.email,
        otp
      });

      setEmailVerified(true);
      alert("Email verified successfully");
    } catch (error) {
      alert("Invalid OTP");
    }
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
        navigate('/verify-otp', { state: { userId: response.data.userId } });
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
                ? t('signUp.modal.successTitle')
                : modalType === 'error'
                ? t('signUp.modal.errorTitle')
                : t('signUp.modal.infoTitle')}
            </h3>

            <p className="text-gray-600 mb-6">{modalMessage}</p>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
            >
              {t('signUp.modal.okButton')}
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

        {/* STEP 1 – ROLE SELECTION */}
        {step === 1 ? (
          <>
            <h2 className="text-2xl font-bold text-center text-green-700 mb-4">
              {t('signUp.selectRoleTitle')}
            </h2>

            <p className="text-center text-gray-500 mb-8">
              {t('signUp.roleSelectionSubtitle')}
            </p>

            <div className="space-y-4">
              <button
                onClick={() => handleRoleSelect('farmer')}
                className="w-full p-6 border-2 border-gray-200 rounded-2xl text-left hover:border-green-500 hover:shadow-lg hover:-translate-y-1 transition"
              >
                <h3 className="text-lg font-semibold text-green-700">
                  🌾 {t('signUp.farmer')}
                </h3>
                <p className="text-gray-500 mt-1">
                  {t('signUp.farmerDescription')}
                </p>
              </button>

              <button
                onClick={() => handleRoleSelect('contractor')}
                className="w-full p-6 border-2 border-gray-200 rounded-2xl text-left hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition"
              >
                <h3 className="text-lg font-semibold text-blue-700">
                  🏢 {t('signUp.contractor')}
                </h3>
                <p className="text-gray-500 mt-1">
                  {t('signUp.contractorDescription')}
                </p>
              </button>
            </div>

            <button
              onClick={handleBack}
              className="w-full mt-8 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl transition"
            >
              {t('signUp.backButton')}
            </button>
          </>
        ) : (
          <>
            {/* STEP 2 – ACCOUNT FORM */}
            <h2 className="text-2xl font-bold text-center text-green-700 mb-6">
              {t('signUp.createAccountTitle')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('signUp.fullNameLabel')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                />
              </div>

              {/* Email */}
              <div className="mb-6">
              <label>{t('signUp.emailLabel')}</label>

              <div className="flex gap-2">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="flex-1 p-3 border rounded"
                  required
                />

                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={!formData.email || emailVerified}
                  className="px-4 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  {emailVerified ? "Verified" : "Verify Email"}
                </button>
              </div>
            </div>

            {showOTPField && !emailVerified && (
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="flex-1 p-3 border rounded"
                />

                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  className="px-4 bg-green-600 text-white rounded"
                >
                  Verify OTP
                </button>
              </div>
            </div>
          )}

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('signUp.phoneLabel')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('signUp.passwordLabel')}
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

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('signUp.confirmPasswordLabel')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute inset-y-0 right-3 text-gray-500 hover:text-gray-700"
                  >
                    👁
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl transition"
                >
                  {t('signUp.backButton')}
                </button>

                <button
                  type="submit"
                  disabled={!emailVerified}
                  className="p-3 bg-green-600 text-white rounded disabled:opacity-50"
                >
                  Create Account
                </button>

              </div>

            </form>
          </>
        )}
      </div>
    </div>
  );

};

export default SignUpPage;