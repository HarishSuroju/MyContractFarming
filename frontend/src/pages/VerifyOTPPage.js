import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleVerify = async () => {
    try {
      const res = await axios.post('/api/auth/verify-otp', {
        email,
        otp
      });

      if (res.data.status === 'success') {
        alert('Email verified successfully!');
        navigate('/profile-builder');
      }

    } catch (err) {
      alert(err.response?.data?.message || 'Invalid OTP');
    }
  };

  // Handle case where email is not provided
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-xl">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p className="text-gray-600">Email not found. Please try again from the signup page.</p>
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

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          Verify Email
        </h2>
        <p className="text-gray-600 mb-4">
          Enter the OTP sent to {email}
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
