import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="bg-white">

      {/* HERO */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white">
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("landingPage.title")}
          </h1>

          <p className="text-lg md:text-xl text-green-100 max-w-3xl mx-auto mb-10">
            {t("landingPage.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-4 rounded-xl bg-white text-green-700 font-semibold shadow-lg hover:bg-gray-100 transition"
            >
              {t("landingPage.signUpButton")}
            </button>

            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 rounded-xl border border-white text-white font-semibold hover:bg-white/10 transition"
            >
              {t("landingPage.loginButton")}
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Empowering agriculture with transparency and trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <Feature
              icon="🔒"
              title={t("landingPage.features.secureContracts")}
              desc={t("landingPage.features.secureContractsDesc")}
            />

            <Feature
              icon="⚖️"
              title={t("landingPage.features.fairPricing")}
              desc={t("landingPage.features.fairPricingDesc")}
            />

            <Feature
              icon="📊"
              title={t("landingPage.features.realTimeTracking")}
              desc={t("landingPage.features.realTimeTrackingDesc")}
            />

          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-green-700 text-white text-center">
        <h2 className="text-3xl font-bold mb-6">
          Ready to build trusted farming partnerships?
        </h2>

        <button
          onClick={() => navigate("/signup")}
          className="bg-white text-green-700 px-10 py-4 rounded-xl font-semibold hover:bg-gray-100 transition shadow-lg"
        >
          Get Started Today
        </button>
      </section>

    </div>
  );
};

const Feature = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition">
    <div className="text-3xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-600">{desc}</p>
  </div>
);

export default LandingPage;
