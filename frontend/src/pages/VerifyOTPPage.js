import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { email, phone, userType } = location.state || {};

  const handleVerify = async () => {
    try {
      // Prepare data based on user type
      const requestData = {
        otp
      };

      if (userType === 'farmer' && phone) {
        requestData.phone = phone;
      } else if (email) {
        requestData.email = email;
      }

      const res = await authAPI.verifyOTP(requestData);

      if (res.data.status === 'success') {
        alert('Verification successful!');
        navigate('/profile-builder');
      }

    } catch (err) {
      console.error('Verification error:', err);
      alert(err.response?.data?.message || 'Invalid OTP');
    }
  };

  // Handle case where neither email nor phone is provided
  if (!email && !phone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-xl">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p className="text-gray-600">Verification information not found. Please try again from the signup page.</p>
          <button
            onClick={() => navigate('/signup')}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            Go to Signup
          </button>
        </div>
      </div>
    );
  }

  const targetContact = userType === 'farmer' ? phone : email;
  const contactType = userType === 'farmer' ? 'phone' : 'email';

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          Verify {contactType.charAt(0).toUpperCase() + contactType.slice(1)}
        </h2>
        <p className="text-gray-600 mb-4">
          Enter the OTP sent to {targetContact}
        </p>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="border p-3 rounded w-full mb-4"
        />

        <button
          onClick={handleVerify}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          Verify
        </button>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
