import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LoginPrompt = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('login.loginRequired')}
        </h2>
        
        <p className="text-gray-600 mb-8">
          {t('login.loginMessage')}
        </p>

        <button
          onClick={() => navigate('/login')}
          className="w-full text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          style={{backgroundColor: '#0db60c'}}
          onMouseEnter={(e) => { e.target.style.opacity = '0.8'; }}
          onMouseLeave={(e) => { e.target.style.opacity = '1'; }}
        >
          {t('login.loginButton')}
        </button>

        <div className="mt-4 text-center text-gray-600">
          <p>
            {t('login.noAccount')}{' '}
            <button
              onClick={() => navigate('/signup')}
              className="font-semibold" style={{color: '#0db60c'}}
            >
              {t('login.signUp')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;
