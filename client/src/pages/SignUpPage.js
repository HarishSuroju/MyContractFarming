import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../App.css';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
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
      alert('Passwords do not match');
      return;
    }

    try {
      // Call the actual API
      const response = await authAPI.register({
        ...formData,
        role: userType
      });
      
      // Store token and user data
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('userRole', userType);
      
      alert('Account created successfully! Redirecting to profile builder...');
      
      // Navigate to profile builder
      navigate('/profile-builder');
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response && error.response.data) {
        alert(error.response.data.message || 'Signup failed. Please try again.');
      } else {
        alert('Signup failed. Please try again.');
      }
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
    <div className="signup-page" style={{ paddingTop: '50px' }}>
      <div className="auth-container">
        <h2>{step === 1 ? 'Select Your Role' : 'Create Account'}</h2>
        
        {step === 1 ? (
          <div className="role-selection">
            <p>Please select your role in the contract farming ecosystem:</p>
            <div className="role-options">
              <button 
                className="role-button farmer"
                onClick={() => handleRoleSelect('farmer')}
              >
                <h3>Farmer</h3>
                <p>Looking for contractors to grow your crops</p>
              </button>
              <button 
                className="role-button contractor"
                onClick={() => handleRoleSelect('contractor')}
              >
                <h3>Contractor</h3>
                <p>Looking for farmers to grow crops for your business</p>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={handleBack} className="back-button">
                Back
              </button>
              <button type="submit" className="submit-button">
                Create Account
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;