import React from "react";
import { useNavigate } from "react-router-dom";

const HelpPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-700 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            How can we help you?
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-green-100 mb-8">
            Find answers, guides, and support resources for using the Assured
            Contract Farming platform effectively.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-white text-green-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition"
          >
            ← Back
          </button>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Getting Started */}
          <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-green-700 mb-4">
              🚀 Getting Started
            </h3>
            <ul className="space-y-2 text-gray-600 list-disc list-inside">
              <li>Register as a Farmer or Contractor</li>
              <li>Complete your profile with accurate information</li>
              <li>Explore features from your dashboard</li>
            </ul>
          </div>

          {/* Creating Contracts */}
          <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-green-700 mb-4">
              📄 Creating Contracts
            </h3>
            <ol className="space-y-2 text-gray-600 list-decimal list-inside">
              <li>Select crops and seasons</li>
              <li>Browse matching farmers or contractors</li>
              <li>Send contract proposals</li>
              <li>Track agreement status in real time</li>
            </ol>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-green-700 mb-4">
              ❓ Frequently Asked Questions
            </h3>

            <div className="space-y-4 text-gray-600">
              <div>
                <p className="font-medium">
                  How do I reset my password?
                </p>
                <p>Email us at support@assuredcontractfarming.com</p>
              </div>

              <div>
                <p className="font-medium">
                  How can I update my profile?
                </p>
                <p>Visit the profile section from the navigation bar.</p>
              </div>

              <div>
                <p className="font-medium">
                  Which crops are supported?
                </p>
                <p>
                  Wheat, rice, maize, cotton, sugarcane, potatoes, tomatoes,
                  and more.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-green-50 rounded-xl p-8 border border-green-200">
            <h3 className="text-xl font-semibold text-green-700 mb-4">
              📞 Contact Support
            </h3>
            <p className="text-gray-700 mb-4">
              Still need help? Our support team is always ready to assist you.
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> support@assuredcontractfarming.com
            </p>
            <p className="text-gray-700">
              <strong>Phone:</strong> +1 (555) 123-4567
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpPage;
