import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">🌾 ACF</h3>
            <p className="text-gray-300 leading-relaxed">
              {t('footer.description') || 'Connecting farmers and contractors for sustainable agricultural partnerships.'}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold border-b border-gray-600 pb-2">
              {t('footer.quickLinks') || 'Quick Links'}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.about') || 'About Us'}
                </a>
              </li>
              <li>
                <a href="/how-it-works" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.howItWorks') || 'How It Works'}
                </a>
              </li>
              <li>
                <a href="/benefits" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.benefits') || 'Benefits'}
                </a>
              </li>
              <li>
                <a href="/success-stories" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.successStories') || 'Success Stories'}
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold border-b border-gray-600 pb-2">
              {t('footer.resources') || 'Resources'}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/blog" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.blog') || 'Blog'}
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.faq') || 'FAQ'}
                </a>
              </li>
              <li>
                <a href="/support" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.support') || 'Support'}
                </a>
              </li>
              <li>
                <a href="/documentation" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.documentation') || 'Documentation'}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold border-b border-gray-600 pb-2">
              {t('footer.contact') || 'Contact Us'}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300">
                  {t('footer.address') || '123 Agriculture Street, Farm City, FC 12345'}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FaPhone className="text-gray-400" />
                <span className="text-gray-300">
                  {t('footer.phone') || '+1 (555) 123-4567'}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="text-gray-400" />
                <span className="text-gray-300">
                  {t('footer.email') || 'info@acfarmland.com'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-xl font-semibold mb-4">
              {t('footer.newsletterTitle') || 'Stay Updated'}
            </h4>
            <p className="text-gray-300 mb-6">
              {t('footer.newsletterDesc') || 'Subscribe to our newsletter for the latest farming tips and platform updates.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder') || 'Enter your email'}
                className="flex-grow px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                {t('footer.subscribe') || 'Subscribe'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} Assured Contract Farming. {t('footer.allRightsReserved') || 'All rights reserved.'}
            </p>
            <div className="flex space-x-6">
              <a href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                {t('footer.privacyPolicy') || 'Privacy Policy'}
              </a>
              <a href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                {t('footer.termsOfService') || 'Terms of Service'}
              </a>
              <a href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                {t('footer.cookiePolicy') || 'Cookie Policy'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;