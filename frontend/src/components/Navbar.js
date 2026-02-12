import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../services/api';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  const [user, setUser] = useState(null);
  const [menuActive, setMenuActive] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data.data.user);
        } catch (error) {
          if (error.response?.status !== 403 && error.response?.status !== 404) {
            console.error('Failed to fetch user profile:', error);
          }
        }
      }
    };

    fetchUserProfile();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('profileComplete');
    localStorage.removeItem('userId');
    navigate('/');
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  /* ===============================
     Active State Helpers
  =============================== */

  const isActive = (path) => location.pathname === path;

  const isHomeActive = () =>
    location.pathname === '/' || location.pathname === '/app-home';

  const isDashboardActive = () =>
    location.pathname.includes('dashboard') ||
    location.pathname === '/admin';

  /* ===============================
     Render
  =============================== */

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 z-50">
      <div className="px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          to={token ? "/app-home" : "/"}
          className="text-2xl font-bold text-green-700 hover:opacity-80 transition"
        >
          {t('common.appName')}
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">

          {/* Home */}
          <Link
            to={token ? "/app-home" : "/"}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              isHomeActive()
                ? 'bg-green-100 text-green-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Home
          </Link>

          {/* Dashboard */}
          {token && (
            <Link
              to={
                userRole === 'farmer'
                  ? '/farmer-dashboard'
                  : userRole === 'contractor'
                  ? '/contractor-dashboard'
                  : '/admin'
              }
              className={`px-3 py-1 rounded-lg font-medium transition ${
                isDashboardActive()
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
          )}

          {/* Requests */}
          {token && (
            <Link
              to="/connection-requests"
              className={`px-3 py-1 rounded-lg font-medium transition ${
                isActive('/connection-requests')
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Requests
            </Link>
          )}

          {/* Directory */}
          <Link
            to="/users-directory"
            className={`px-3 py-1 rounded-lg font-medium transition ${
              isActive('/users-directory')
                ? 'bg-green-100 text-green-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Directory
          </Link>

          {/* Help */}
          <Link
            to="/help"
            className={`px-3 py-1 rounded-lg font-medium transition ${
              isActive('/help')
                ? 'bg-green-100 text-green-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Help
          </Link>

          {/* Language */}
          <select
            onChange={(e) => changeLanguage(e.target.value)}
            value={i18n.language}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="en">EN</option>
            <option value="hi">हिंदी</option>
            <option value="te">తెలుగు</option>
            <option value="ta">தமிழ்</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="ml">മലയാളം</option>
          </select>

          {/* Auth Section */}
          {!token ? (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-green-600 font-medium transition"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition shadow-sm"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <NotificationBell />

              {/* Profile */}
              <div
                onClick={() => navigate('/profile')}
                className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold cursor-pointer hover:bg-green-700 transition"
              >
                {user && user.name
                  ? getUserInitials(user.name)
                  : 'U'}
              </div>

              <button
                onClick={handleLogout}
                className="text-red-600 font-medium hover:text-red-700 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-700 text-xl"
          onClick={() => setMenuActive(!menuActive)}
        >
          ☰
        </button>

      </div>
    </nav>
  );
};

export default Navbar;
