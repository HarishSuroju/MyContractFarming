import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const HelpPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="help-page" style={{ paddingTop: '50px' }}>
      <div className="auth-container">
        <h2>Help & Support</h2>
        <p className="subtitle">
          Find answers to common questions and get support for using the Assured Contract Farming platform.
        </p>
        
        <div className="help-section">
          <h3>Getting Started</h3>
          <ul>
            <li>Register as either a Farmer or Contractor</li>
            <li>Complete your profile with relevant information</li>
            <li>Explore the dashboard to access platform features</li>
          </ul>
        </div>
        
        <div className="help-section">
          <h3>Creating Contracts</h3>
          <ol>
            <li>Select crops and seasons from the dashboard</li>
            <li>Browse matching farmers or contractors</li>
            <li>Create and submit contract proposals</li>
            <li>Track contract status in your dashboard</li>
          </ol>
        </div>
        
        <div className="help-section">
          <h3>FAQ</h3>
          <div className="faq-item">
            <h4>How do I reset my password?</h4>
            <p>Contact support at support@assuredcontractfarming.com with your email address.</p>
          </div>
          
          <div className="faq-item">
            <h4>How do I update my profile information?</h4>
            <p>Visit your profile page from the user menu in the navigation bar.</p>
          </div>
          
          <div className="faq-item">
            <h4>What crops are supported on the platform?</h4>
            <p>We currently support major crops including wheat, rice, maize, cotton, sugarcane, potatoes, and tomatoes.</p>
          </div>
        </div>
        
        <div className="help-section">
          <h3>Contact Support</h3>
          <p>If you need further assistance, please contact our support team:</p>
          <p>Email: support@assuredcontractfarming.com</p>
          <p>Phone: +1 (555) 123-4567</p>
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={handleBack} className="back-button">
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;