import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  const handleVerify = async () => {
    try {
      const res = await axios.post('/api/auth/verify-otp', {
        userId,
        otp
      });

      localStorage.setItem('token', res.data.data.token);
      navigate('/profile-builder');

    } catch (err) {
      alert('Invalid OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          Verify Email
        </h2>

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
