import React, { useState, useEffect, useCallback } from 'react';
import { profileAPI } from '../services/api';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode to get user info from token
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UsersDirectory = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cropFilter, setCropFilter] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Clear any potentially expired tokens on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT to check if it's expired (simple check without verification)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < currentTime) {
          console.log('Removing expired token from localStorage');
          localStorage.removeItem('token');
        }
      } catch (e) {
        // If token is malformed, just remove it
        console.log('Removing malformed token from localStorage');
        localStorage.removeItem('token');
      }
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const filterUsersCallback = useCallback(() => {
    console.log('Filtering users. Total users:', users.length);
    console.log('Current filters:', { searchTerm, cropFilter, seasonFilter, roleFilter });
    
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // For crops, check both crops (for farmers) and cropDemand (for contractors)
      const matchesCrop = !cropFilter || 
                         (user.crops && user.crops.includes(cropFilter)) || 
                         (user.cropDemand && user.cropDemand.includes(cropFilter));
      
      // For seasons, match either the season field or the seasons array
      const matchesSeason = !seasonFilter || 
                         (user.season && user.season === seasonFilter) ||
                         (user.seasons && user.seasons.includes(seasonFilter));
      
      // For roles, match the role field
      const matchesRole = !roleFilter || user.role.toLowerCase() === roleFilter.toLowerCase();
      
      const result = matchesSearch && matchesCrop && matchesSeason && matchesRole;
      
      // Log filtering details for debugging when result is false
      if (!result) {
        console.log('User filtered out:', user.name, {
          matchesSearch,
          matchesCrop,
          matchesSeason,
          matchesRole,
          userCrops: user.crops,
          userSeason: user.season,
          userRole: user.role,
          searchTerm,
          cropFilter,
          seasonFilter,
          roleFilter
        });
      }
      
      return result;
    });
    
    console.log('Filtered users count:', filtered.length);
    setFilteredUsers(filtered);
  }, [users, searchTerm, cropFilter, seasonFilter, roleFilter]);

  useEffect(() => {
    filterUsersCallback();
  }, [filterUsersCallback]);

  // Add a debug effect to see when filtering happens
  useEffect(() => {
    console.log('Users state updated, count:', users.length);
    console.log('FilteredUsers state updated, count:', filteredUsers.length);
  }, [users, filteredUsers]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get current user ID from the token
      const token = localStorage.getItem('token');
      let currentUserId = null;
      if (token) {
        try {
          const decoded = jwtDecode(token);
          currentUserId = decoded.userId;
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
      
      // Fetch users from the backend API
      console.log('Starting to fetch users...');
      const response = await profileAPI.getAllUsers();
      console.log('API Response received:', response);
      console.log('API Response data:', response?.data);
      console.log('API Response users:', response?.data?.data?.users);
      
      if (response.data && response.data.data && response.data.data.users) {
        console.log('Processing', response.data.data.users.length, 'users');
        // Filter out the current user and transform the API response to match our component's expected format
        const filteredUsers = response.data.data.users.filter(user => user.id !== currentUserId);
        console.log('After filtering out current user:', filteredUsers.length, 'users');
        
        const transformedUsers = filteredUsers.map(user => {
          try {
            if (user.role === 'farmer' && user.profile) {
              console.log('Transforming farmer:', user.name);
              return {
                id: user.id,
                name: user.name,
                role: 'Farmer',
                email: user.email,
                phone: user.phone,
                location: user.profile.landLocation || '',
                crops: user.profile.cropsGrown || [],
                season: user.profile.selectedSeason || '',
                experience: user.profile.experience || '',
                landSize: user.profile.landSize || '',
                seasons: user.profile.seasons || [] // Add seasons array for potential future use
              };
            } else if (user.role === 'contractor' && user.profile) {
              console.log('Transforming contractor:', user.name);
              return {
                id: user.id,
                name: user.name,
                role: 'Contractor',
                email: user.email,
                phone: user.phone,
                company: user.profile.companyName || '',
                location: user.profile.companyLocation || '',
                specialization: user.profile.contractPreferences || '',
                projects: 'N/A', // This would need to be calculated from agreements
                crops: user.profile.cropDemand || [], // Also map cropDemand to crops for consistent filtering
                cropDemand: user.profile.cropDemand || [],
                season: user.profile.selectedSeason || '' // Map selected season for contractors
              };
            }
            // Return basic user info if no profile exists
            console.log('Transforming user without profile:', user.name, 'role:', user.role);
            return {
              id: user.id,
              name: user.name,
              role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
              email: user.email,
              phone: user.phone,
              location: '',
              crops: [],
              season: '',
              seasons: [],
              experience: '',
              landSize: '',
              company: '',
              specialization: '',
              projects: '',
              cropDemand: []
            };
          } catch (transformError) {
            console.error('Error transforming user:', user, transformError);
            // Return a safe default object
            return {
              id: user.id || Math.random(),
              name: user.name || 'Unknown',
              role: (user.role || '').charAt(0).toUpperCase() + (user.role || '').slice(1),
              email: user.email || '',
              phone: user.phone || '',
              location: '',
              crops: [],
              season: '',
              seasons: [],
              experience: '',
              landSize: '',
              company: '',
              specialization: '',
              projects: '',
              cropDemand: []
            };
          }
        });
        
        console.log('Setting users:', transformedUsers.length);
        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
      } else {
        console.log('No users data in response');
        console.log('Response structure:', Object.keys(response.data || {}));
        console.log('Checking for nested data structure...');
        console.log('response.data.data:', response.data?.data);
        console.log('response.data.data.users:', response.data?.data?.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error details:', error?.response || error?.message);
      // If the error is related to authentication, clear the token
      if (error.response && error.response.status === 403) {
        localStorage.removeItem('token');
      }
      // Fallback to sample data if API fails
      const sampleUsers = [
        {
          id: 1,
          name: 'Rakesh Kumar',
          role: 'Farmer',
          email: 'rakesh@example.com',
          phone: '6858409847',
          location: 'Assam',
          crops: ['Coffee', 'Tobacco'],
          season: 'Zaid',
          experience: '11 years',
          landSize: '3 acres'
        },
        {
          id: 2,
          name: 'Priya Singh',
          role: 'Contractor',
          email: 'priya@example.com',
          phone: '9876543210',
          company: 'AgriTech Solutions',
          location: 'Punjab',
          specialization: 'Irrigation Systems',
          projects: '25+ completed'
        }
      ];
      console.log('Using sample users:', sampleUsers.length);
      setUsers(sampleUsers);
      setFilteredUsers(sampleUsers);
    } finally {
      setLoading(false);
    }
  };


  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const navigate = useNavigate();

  const viewMore = (userId) => {
    // Navigate to the user profile detail page
    navigate(`/user-profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-xl text-gray-600">{t('userDirectory.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{t('userDirectory.title')}</h1>
        
        {/* Search and Filters */}
        <div className="sticky top-16 bg-gray-50 z-10 pb-6 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('userDirectory.searchPlaceholder')}
            className="w-full px-5 py-4 pl-12 border-2 border-gray-300 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cpath d='m21 21-4.35-4.35'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: '16px center'
            }}
          />
          
          <div className="flex flex-wrap gap-3 mt-4">
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 min-w-[150px]"
            >
              <option value="">{t('userDirectory.allCrops')}</option>
              <option value="Rice">{t('userDirectory.rice')}</option>
              <option value="Wheat">{t('userDirectory.wheat')}</option>
              <option value="Coffee">{t('userDirectory.coffee')}</option>
              <option value="Tobacco">{t('userDirectory.tobacco')}</option>
              <option value="Cotton">{t('userDirectory.cotton')}</option>
            </select>
            
            <select
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 min-w-[150px]"
            >
              <option value="">{t('userDirectory.allSeasons')}</option>
              <option value="Kharif">{t('userDirectory.kharif')}</option>
              <option value="Rabi">{t('userDirectory.rabi')}</option>
              <option value="Zaid">{t('userDirectory.zaid')}</option>
            </select>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 min-w-[150px]"
            >
              <option value="">{t('userDirectory.allRoles')}</option>
              <option value="Farmer">{t('userDirectory.farmers')}</option>
              <option value="Contractor">{t('userDirectory.contractors')}</option>
            </select>
          </div>
        </div>
        
        {/* User Cards Container */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-lg text-gray-500">
            {t('userDirectory.noUsersFound')}
          </div>
        ) : (
          <div className="space-y-5">
            {filteredUsers.map(user => {
              const roleClass = user.role.toLowerCase();
              const initials = getInitials(user.name);
              
              return (
                <div
                  key={user.id}
                  className={`flex rounded-2xl p-5 transition-all duration-300 cursor-pointer border-2 border-transparent hover:-translate-y-1 ${
                    roleClass === 'farmer'
                      ? 'bg-gradient-to-br from-green-50 to-green-100 hover:border-green-500 hover:shadow-lg hover:shadow-green-200'
                      : 'bg-gradient-to-br from-blue-50 to-blue-100 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-200'
                  }`}
                >
                  <div
                    className={`w-24 h-24 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl font-bold mr-5 shadow-lg ${
                      roleClass === 'farmer'
                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-green-300'
                        : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-300'
                    }`}
                  >
                    {initials}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">{user.name}</div>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full inline-block ${
                            roleClass === 'farmer'
                              ? 'bg-green-500 text-white'
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          {user.role === 'Farmer' ? t('userDirectory.farmer') : t('userDirectory.contractor')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      {user.role === 'Farmer' ? (
                        <>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-600 opacity-70">{t('userDirectory.location')}:</span> {user.location}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-600 opacity-70">{t('userDirectory.crops')}:</span> {user.crops.join(', ')}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-600 opacity-70">{t('userDirectory.season')}:</span> {user.season}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-600 opacity-70">{t('userDirectory.experience')}:</span> {user.experience}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-600 opacity-70">{t('userDirectory.landSize')}:</span> {user.landSize}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-600 opacity-70">{t('userDirectory.phone')}:</span> {user.phone}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-600 opacity-70">{t('userDirectory.company')}:</span> {user.company}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-600 opacity-70">{t('userDirectory.location')}:</span> {user.location}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-600 opacity-70">{t('userDirectory.specialization')}:</span> {user.specialization}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-600 opacity-70">{t('userDirectory.projects')}:</span> {user.projects}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-600 opacity-70">{t('userDirectory.phone')}:</span> {user.phone}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-600 opacity-70">{t('userDirectory.email')}:</span> {user.email}
                          </div>
                        </>
                      )}
                    </div>
                    
                    <button
                      onClick={() => viewMore(user.id)}
                      className={`self-start px-6 py-2.5 rounded-lg font-semibold text-sm border-2 transition-all duration-200 hover:scale-105 ${
                        roleClass === 'farmer'
                          ? 'bg-green-500 border-green-500 text-white hover:bg-green-600 hover:border-green-600'
                          : 'bg-blue-500 border-blue-500 text-white hover:bg-blue-600 hover:border-blue-600'
                      }`}
                    >
                      {t('userDirectory.viewProfile')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersDirectory;