import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const UserMatching = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'farmer';
  
  const selectedSeason = localStorage.getItem('selectedSeason') || '';
  const selectedCrop = localStorage.getItem('selectedCrop') || '';
  
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const mockFarmers = [
    { id: 1, name: 'Raj Kumar', location: 'Punjab', experience: '15 years', landSize: '10 acres' },
    { id: 2, name: 'Suresh Patel', location: 'Gujarat', experience: '8 years', landSize: '5 acres' },
    { id: 3, name: 'Mahesh Singh', location: 'UP', experience: '12 years', landSize: '8 acres' }
  ];

  const mockContractors = [
    { id: 1, name: 'AgroTech Solutions', location: 'Delhi', cropDemand: 'Wheat, Rice' },
    { id: 2, name: 'FarmFuture Ltd', location: 'Mumbai', cropDemand: 'Cotton, Sugarcane' },
    { id: 3, name: 'GreenHarvest Corp', location: 'Bangalore', cropDemand: 'Vegetables' }
  ];

  useEffect(() => {
    // Simulate API call to fetch matched users
    setTimeout(() => {
      if (userRole === 'farmer') {
        setMatchedUsers(mockContractors);
      } else {
        setMatchedUsers(mockFarmers);
      }
      setLoading(false);
    }, 1000);
  }, [userRole]); // Add mockContractors and mockFarmers as dependencies

  const handleSelectUser = (userId) => {
    // Store selected user for agreement creation
    localStorage.setItem('selectedUserId', userId);
    navigate('/agreement-creation');
  };

  const handleBack = () => {
    navigate('/users-directory');
  };

  return (
    <div className="user-matching" style={{ paddingTop: '50px' }}>
      <div className="matching-container">
        <h2>User Matching</h2>
        <p className="subtitle">
          {userRole === 'farmer' 
            ? `Contractors interested in ${selectedCrop} during ${selectedSeason} season` 
            : `Farmers growing ${selectedCrop} during ${selectedSeason} season`}
        </p>
        
        <div className="selection-summary">
          <p><strong>Season:</strong> {selectedSeason}</p>
          <p><strong>Crop:</strong> {selectedCrop}</p>
        </div>
        
        {loading ? (
          <div className="loading">Finding matching users...</div>
        ) : (
          <div className="user-list">
            <h3>
              {userRole === 'farmer' ? 'Available Contractors' : 'Available Farmers'}
            </h3>
            {matchedUsers.length > 0 ? (
              <div className="user-cards">
                {matchedUsers.map(user => (
                  <div key={user.id} className="user-card">
                    <h4>{user.name}</h4>
                    <p><strong>Location:</strong> {user.location}</p>
                    {userRole === 'farmer' ? (
                      <p><strong>Demand:</strong> {user.cropDemand}</p>
                    ) : (
                      <>
                        <p><strong>Experience:</strong> {user.experience}</p>
                        <p><strong>Land Size:</strong> {user.landSize}</p>
                      </>
                    )}
                    <button 
                      className="select-button"
                      onClick={() => handleSelectUser(user.id)}
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No matching users found. Try different crop or season.</p>
            )}
          </div>
        )}
        
        <div className="form-actions">
          <button type="button" onClick={handleBack} className="back-button">
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserMatching;