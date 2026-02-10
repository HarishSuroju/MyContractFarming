import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = ({ isLoggedIn, userName }) => {
  const navigate = useNavigate();

  const handleFarmerClick = () => {
    navigate('/signup');
  };

  const handleBuyerClick = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {/* Hero Section */}
      <header
        className="bg-gradient-to-b from-black/60 to-black/60 bg-cover bg-center h-screen flex items-center justify-center text-white mt-16 relative z-10"
        style={{ backgroundImage: "url('./assets/Photos/HomeBG.jpg')" }}
      >
        <div className="max-w-4xl p-8 relative z-20 text-center">
          <h1 className="text-5xl mb-4 text-shadow-lg">
            Connecting Farmers and Buyers Through Smart Contracts
          </h1>
          <p className="text-xl mb-8 text-shadow-md">
            Our platform ensures fair prices and reliable partnerships in agriculture through blockchain-based smart contracts.
          </p>

          {!isLoggedIn ? (
            <div className="flex justify-center gap-4 flex-wrap">
              <button
                className="bg-green-500 border-none text-white px-8 py-4 rounded transition-bg duration-300 hover:bg-green-600"
                onClick={handleFarmerClick}
              >
                Get Started as Farmer
              </button>
              <button
                className="bg-blue-500 border-none text-white px-8 py-4 rounded transition-bg duration-300 hover:bg-blue-700"
                onClick={handleBuyerClick}
              >
                Get Started as Buyer
              </button>
            </div>
          ) : (
            <div className="mt-8">
              <h2 className="text-3xl font-semibold mb-4">
                Welcome back, {userName || 'Valued User'}!
              </h2>
              <p className="text-lg text-gray-200 max-w-2xl mx-auto">
                Keep growing your network, explore new opportunities, and make your farming journey more rewarding with our smart contract system.
              </p>
              <p className="mt-4 text-green-400 font-medium">
                “The future of farming is digital — and you’re already part of it.”
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Features Section */}
      <section className="flex justify-center flex-wrap gap-8 p-16 bg-gray-100 relative z-10">
        <div className="bg-white rounded-lg shadow-md p-8 w-60 transition-transform duration-300 hover:-translate-y-1 relative z-20">
          <h3 className="text-green-800 mt-0">Secure Contracts</h3>
          <p className="text-gray-600 text-sm">
            Blockchain-based smart contracts ensure transparency and security for all parties involved.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 w-60 transition-transform duration-300 hover:-translate-y-1 relative z-20">
          <h3 className="text-green-800 mt-0">Fair Pricing</h3>
          <p className="text-gray-600 text-sm">
            Guaranteed fair prices for farmers and competitive rates for buyers.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 w-60 transition-transform duration-300 hover:-translate-y-1 relative z-20">
          <h3 className="text-green-800 mt-0">Real-time Tracking</h3>
          <p className="text-gray-600 text-sm">
            Monitor contract progress and crop growth with our advanced tracking system.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-800 text-white text-center p-6 mt-auto relative z-10">
        <p>&copy; 2026 Assured Contract Farming. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;