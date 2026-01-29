import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { profileAPI } from '../services/api';

const UserMatching = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'farmer';
  
  const selectedSeason = localStorage.getItem('selectedSeason') || '';
  const selectedCrop = localStorage.getItem('selectedCrop') || '';
  
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [loading] = useState(true);

  useEffect(()=>{
    const fetchMatches=async()=>{
      try{
        const response = await profileAPI.getMatches();
        if(response.data.status === 'success') {
          setMatchedUsers(response.data.data.matches);
        } else {
          console.error('Error fetching matches:', response.data.message);
        }
      }catch(error){
        console.error('Error fetching matches:',error);
      }
    };
    fetchMatches();
  }, []);

  const handleSelectUser = (userId) => {
    // Store selected user for agreement creation
    localStorage.setItem('selectedUserId', userId);
    // Pass crop and season as URL parameters
    navigate(`/agreement-creation?userId=${userId}&crop=${selectedCrop}&season=${selectedSeason}`);
  };

  const handleBack = () => {
    navigate('/users-directory');
  };
  
  const handleRefresh = async () => {
    try {
      const response = await profileAPI.getMatches();
      if(response.data.status === 'success') {
        setMatchedUsers(response.data.data.matches);
      } else {
        console.error('Error fetching matches:', response.data.message);
      }
    } catch(error) {
      console.error('Error fetching matches:', error);
    }
  };

  return (
    <div className="user-matching" style={{ paddingTop: '70px' }}>
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
                    <p><strong>Email:</strong> {user.email}</p>
                    {user.phone && (
                      <p><strong>Phone:</strong> {user.phone}</p>
                    )}
                    {userRole === 'farmer' ? (
                      <>
                        <p><strong>Demand:</strong> {user.cropDemand?.join(', ')}</p>
                        <p><strong>Company:</strong> {user.companyName}</p>
                      </>
                    ) : (
                      <>
                        <p><strong>Crops Grown:</strong> {user.cropsGrown?.join(', ')}</p>
                        <p><strong>Experience:</strong> {user.experience} years</p>
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
          <button type="button" onClick={handleRefresh} className="back-button">
            Refresh Matches
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserMatching;