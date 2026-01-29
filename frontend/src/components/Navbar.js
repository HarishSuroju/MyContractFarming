import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../services/api';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const [user, setUser] = useState(null);
  // const [loading, setLoading] = useState(true); // Commented out as it's not currently used
  const [menuActive, setMenuActive] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
      // setLoading(false); // Commented out as it's not currently used
    };

    fetchUserProfile();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('profileComplete');
    setUser(null);
    navigate('/');
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  const closeMenu = () => {
    setMenuActive(false);
  };

  const handleProfileClick = () => {
    closeMenu();
    navigate('/profile');
  };
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="flex justify-between items-center px-5 bg-green-800 text-white shadow-md fixed top-0 w-full h-12 z-50 overflow-visible">
      <div className="flex items-center">
        <Link to="/" className="text-white no-underline">
          <h2 className="m-0 text-xl">{t('common.appName')}</h2>
        </Link>
      </div>
      
      <button className="md:hidden flex flex-col justify-around w-8 h-8 bg-transparent border-none cursor-pointer p-0 z-10" onClick={toggleMenu}>
        <span className="w-full h-0.5 bg-white rounded-full transition-all duration-300 relative origin-left"></span>
        <span className="w-full h-0.5 bg-white rounded-full transition-all duration-300 relative origin-left"></span>
        <span className="w-full h-0.5 bg-white rounded-full transition-all duration-300 relative origin-left"></span>
      </button>
      
      <ul className={`flex list-none m-0 p-0 gap-4 items-center flex-wrap fixed left-0 top-0 h-screen w-full bg-green-800 flex-col items-center justify-center gap-8 z-40 transform ${menuActive ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex-row md:h-auto md:w-auto md:bg-transparent md:pr-10 md:gap-4 md:flex-wrap`}>
        <li><Link to="/" onClick={closeMenu} className="text-gray-300 no-underline font-medium transition-colors duration-300 whitespace-nowrap hover:text-green-300">{t('navbar.home')}</Link></li>
        {token && (
          <>
            <li><Link to={userRole === 'farmer' ? '/farmer-dashboard' : '/contractor-dashboard'} onClick={closeMenu} className="text-gray-300 no-underline font-medium transition-colors duration-300 whitespace-nowrap hover:text-green-300">{t('navbar.dashboard')}</Link></li>
            <li><Link to="/connection-requests" onClick={closeMenu} className="text-gray-300 no-underline font-medium transition-colors duration-300 whitespace-nowrap hover:text-green-300">Connection Requests</Link></li>
          </>
        )}
        <li><Link to="/users-directory" onClick={closeMenu} className="text-gray-300 no-underline font-medium transition-colors duration-300 whitespace-nowrap hover:text-green-300">{t('navbar.userDirectory')}</Link></li>
        {userRole === 'admin' && (
          <li><Link to="/admin" onClick={closeMenu} className="text-gray-300 no-underline font-medium transition-colors duration-300 whitespace-nowrap hover:text-green-300">{t('navbar.adminDashboard')}</Link></li>
        )}
        <li><Link to="/help" onClick={closeMenu} className="text-gray-300 no-underline font-medium transition-colors duration-300 whitespace-nowrap hover:text-green-300">{t('navbar.help')}</Link></li>
        <li className="relative inline-block group">
          <div className="flex items-center">
            <select 
              className="bg-green-800 text-white border-none focus:outline-none rounded px-2 py-1"
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
            >
              <option value="en">EN</option>
              <option value="hi">हिंदी</option>
              <option value="te">తెలుగు</option>
              <option value="ta">தமிழ்</option>
              <option value="kn">ಕನ್ನಡ</option>
              <option value="ml">മലയാളം</option>
            </select>
          </div>
        </li>
        
        {!token ? (
          <li className="flex gap-2">
            <Link to="/login" onClick={closeMenu}><button className="bg-transparent border border-green-300 text-green-300 px-4 py-2 rounded cursor-pointer font-medium transition-all duration-300 whitespace-nowrap hover:bg-green-300 hover:text-green-800">{t('navbar.login')}</button></Link>
            <Link to="/signup" onClick={closeMenu}><button className="bg-green-300 text-green-800 border border-green-300 px-4 py-2 rounded cursor-pointer font-medium transition-all duration-300 ml-2 whitespace-nowrap hover:bg-green-400 hover:text-green-900">{t('navbar.signUp')}</button></Link>
          </li>
        ) : (
          <>
            <li>
              <NotificationBell />
            </li>
            <li className="relative inline-block group">
              <div className="cursor-pointer flex items-center" onClick={handleProfileClick}>
                {user && user.name ? (
                  <div className="w-10 h-10 rounded-full bg-green-300 text-green-800 flex items-center justify-center font-bold text-base border-2 border-white cursor-pointer">
                    {getUserInitials(user.name)}
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-green-300 text-green-800 flex items-center justify-center font-bold text-base border-2 border-white cursor-pointer">
                    U
                  </div>
                )}
              </div>
              <div className="absolute top-full right-0 bg-white text-gray-800 rounded shadow-lg w-50 p-4 hidden group-hover:block z-50">
                <div className="pb-4 border-b border-gray-300 mb-4">
                  {user && (
                    <>
                      <div className="font-bold mb-1">{user.name}</div>
                      <div className="text-xs text-gray-600">{user.email}</div>
                    </>
                  )}
                </div>
                <Link to="/profile" className="block text-green-800 no-underline py-2 mb-2 rounded transition-colors duration-300 hover:bg-gray-100" onClick={closeMenu}>{t('navbar.profile')}</Link>
                <button className="bg-red-500 text-white border-none py-2 rounded cursor-pointer w-full font-medium transition-colors duration-300 hover:bg-red-700" onClick={() => { handleLogout(); closeMenu(); }}>{t('navbar.logout')}</button>
              </div>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;