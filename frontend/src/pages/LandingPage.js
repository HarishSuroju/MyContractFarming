import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../App.css';

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="landing-page">
      <header className="hero-section" style={{ marginTop: '50px' }}>
        <div className="hero-content">
          <h1 className="hero-title">{t('landingPage.title')}</h1>
          <p className="hero-subtitle">
            {t('landingPage.subtitle')}
          </p>
          <div className="cta-buttons">
            <button className="cta-button primary" onClick={handleSignUp}>
              {t('landingPage.signUpButton')}
            </button>
            <button className="cta-button secondary" onClick={handleLogin}>
              {t('landingPage.loginButton')}
            </button>
          </div>
        </div>
      </header>

      <section className="features-section">
        <div className="feature-card">
          <h3>{t('landingPage.features.secureContracts')}</h3>
          <p>{t('landingPage.features.secureContractsDesc')}</p>
        </div>
        <div className="feature-card">
          <h3>{t('landingPage.features.fairPricing')}</h3>
          <p>{t('landingPage.features.fairPricingDesc')}</p>
        </div>
        <div className="feature-card">
          <h3>{t('landingPage.features.realTimeTracking')}</h3>
          <p>{t('landingPage.features.realTimeTrackingDesc')}</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;