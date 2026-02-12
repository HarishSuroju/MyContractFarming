import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white mt-20">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">🌾 ACF</h3>
            <p className="text-green-100 leading-relaxed text-sm">
              Connecting farmers and contractors through secure smart agreements
              for sustainable agricultural partnerships.
            </p>

            <div className="flex gap-4 mt-5">
              <FaFacebook className="hover:text-green-300 cursor-pointer transition" />
              <FaTwitter className="hover:text-green-300 cursor-pointer transition" />
              <FaInstagram className="hover:text-green-300 cursor-pointer transition" />
              <FaLinkedin className="hover:text-green-300 cursor-pointer transition" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-green-100 text-sm">
              <li><a href="/about" className="hover:text-white transition">About</a></li>
              <li><a href="/how-it-works" className="hover:text-white transition">How It Works</a></li>
              <li><a href="/benefits" className="hover:text-white transition">Benefits</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-green-100 text-sm">
              <li><a href="/faq" className="hover:text-white transition">FAQ</a></li>
              <li><a href="/support" className="hover:text-white transition">Support</a></li>
              <li><a href="/documentation" className="hover:text-white transition">Docs</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Stay Updated</h4>
            <p className="text-green-100 text-sm mb-4">
              Get platform updates and farming insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 rounded-lg text-gray-800 focus:outline-none w-full"
              />
              <button className="bg-white text-green-800 font-semibold px-5 py-2 rounded-lg hover:bg-green-100 transition">
                Subscribe
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-green-950 py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-green-200">
          <p>© {currentYear} Assured Contract Farming. All rights reserved.</p>
          <div className="flex gap-6 mt-3 md:mt-0">
            <a href="/privacy" className="hover:text-white transition">Privacy</a>
            <a href="/terms" className="hover:text-white transition">Terms</a>
          </div>
        </div>
      </div>
    </footer>

  );
};

export default Footer;