import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaCheckCircle,
  FaChevronDown,
  FaComments,
  FaFacebook,
  FaFileContract,
  FaHandshake,
  FaInstagram,
  FaLeaf,
  FaLinkedin,
  FaLock,
  FaMoneyBillWave,
  FaShieldAlt,
  FaUserCheck,
} from "react-icons/fa";
import { MdOutlineMonitorHeart } from "react-icons/md";

const problems = [
  { icon: FaMoneyBillWave, text: "Price uncertainty" },
  { icon: FaHandshake, text: "Middlemen exploitation" },
  { icon: FaFileContract, text: "Payment delays" },
  { icon: FaShieldAlt, text: "No legal protection" },
];

const solutions = [
  { icon: FaCheckCircle, text: "Pre-agreed pricing" },
  { icon: FaUserCheck, text: "Verified contractors" },
  { icon: FaFileContract, text: "Digital legal agreements" },
  { icon: FaComments, text: "Transparent communication" },
];

const howItWorks = [
  "Create Profile",
  "Connect Securely",
  "Discuss & Agree",
  "Digital Contract & Monitoring",
];

const features = [
  {
    icon: FaLock,
    title: "Secure Agreements",
    description: "Tamper-resistant digital contracts with clear terms.",
  },
  {
    icon: FaMoneyBillWave,
    title: "Assured Pricing",
    description: "Pre-negotiated pricing protects both parties from volatility.",
  },
  {
    icon: MdOutlineMonitorHeart,
    title: "Crop Monitoring",
    description: "Track progress and obligations through each contract stage.",
  },
  {
    icon: FaComments,
    title: "Built-in Communication",
    description: "Discuss requirements and updates inside one unified platform.",
  },
  {
    icon: FaFileContract,
    title: "Proposal & Agreement Management",
    description: "Create, review, approve, and manage proposals end-to-end.",
  },
  {
    icon: FaUserCheck,
    title: "Verified Profiles",
    description: "Trustworthy network with role-based verified participants.",
  },
];

const testimonials = [
  {
    name: "Ramesh Kumar",
    role: "Farmer, Telangana",
    quote:
      "ACF gave me fixed pricing before sowing. It removed uncertainty and helped me plan confidently.",
  },
  {
    name: "Anita Verma",
    role: "Procurement Lead, AgroSphere",
    quote:
      "The digital agreement flow is clear and fast. We now work with farmers more transparently.",
  },
  {
    name: "Sandeep Reddy",
    role: "Contractor, Andhra Pradesh",
    quote:
      "Communication and contract tracking in one place reduced misunderstandings dramatically.",
  },
];

const faqs = [
  {
    question: "What if crop fails due to natural calamities?",
    answer:
      "Contracts can include risk-sharing and contingency clauses. Both parties can define safeguards upfront before agreement finalization.",
  },
  {
    question: "Is the agreement legally valid?",
    answer:
      "Yes. ACF agreements are digitally documented with explicit terms, helping both sides maintain legal clarity and accountability.",
  },
  {
    question: "Are there hidden charges?",
    answer:
      "No. Pricing and conditions are shown transparently during proposal and contract stages so both parties know the exact terms.",
  },
  {
    question: "How secure is my data?",
    answer:
      "ACF follows secure authentication and role-based access controls so contract and participant data remain protected.",
  },
  {
    question: "Can I cancel a contract?",
    answer:
      "Cancellation is governed by agreed contract terms. ACF records every action to keep the process transparent for both parties.",
  },
];

const SectionHeading = ({ title, subtitle, centered = true }) => (
  <div className={centered ? "text-center mb-12" : "mb-8"}>
    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
    {subtitle ? (
      <p className="mt-4 text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
        {subtitle}
      </p>
    ) : null}
  </div>
);

const IconItem = ({ icon: Icon, text }) => (
  <div className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-blue-100 text-green-700">
        <Icon aria-hidden="true" />
      </div>
      <p className="font-medium text-gray-800">{text}</p>
    </div>
  </div>
);

const FAQItem = ({ item, isOpen, onToggle }) => (
  <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
    <button
      aria-expanded={isOpen}
      aria-label={item.question}
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
    >
      <span className="font-semibold text-gray-900">{item.question}</span>
      <FaChevronDown
        className={`text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
      />
    </button>
    <div
      className={`grid overflow-hidden transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
    >
      <div className="overflow-hidden px-5 pb-5 text-gray-600">{item.answer}</div>
    </div>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="bg-white text-gray-900">
      <section className="relative min-h-[92vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80"
            alt="Agriculture landscape"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/70" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl items-center px-6 py-20"
        >
          <div className="w-full text-center text-white">
            <p className="mb-5 inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              Assured Contract Farming Platform
            </p>
            <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Secure Contract Farming Made Simple
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base text-slate-200 md:text-xl">
              Build trusted farmer-contractor partnerships with transparent pricing,
              legally clear digital agreements, and reliable communication at every step.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                aria-label="Start as Farmer"
                onClick={() => navigate("/signup")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-7 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-600"
              >
                Start as Farmer <FaArrowRight className="text-sm" />
              </button>
              <button
                aria-label="Join as Contractor"
                onClick={() => navigate("/signup")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/50 bg-white/10 px-7 py-3 font-semibold text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20"
              >
                Join as Contractor
              </button>
            </div>

            <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-white/15 bg-white/10 px-6 py-4 text-sm text-slate-100 backdrop-blur md:text-base">
              500+ Farmers | 120+ Active Contracts | Secure & Transparent
            </div>
          </div>
        </motion.div>
      </section>

      <section className="bg-slate-50 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:gap-12">
          <div>
            <SectionHeading
              centered={false}
              title="Current Challenges in Contract Farming"
              subtitle="Farmers and contractors often face uncertainty, lack of legal structure, and delayed settlements."
            />
            <div className="space-y-4">
              {problems.map((item) => (
                <IconItem key={item.text} icon={item.icon} text={item.text} />
              ))}
            </div>
          </div>
          <div>
            <SectionHeading
              centered={false}
              title="How ACF Solves This"
              subtitle="ACF transforms informal arrangements into trustworthy digital workflows with clear terms."
            />
            <div className="space-y-4">
              {solutions.map((item) => (
                <IconItem key={item.text} icon={item.icon} text={item.text} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            title="How It Works"
            subtitle="A simple 4-step process to create secure and accountable farming partnerships."
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {howItWorks.map((step, index) => (
              <div
                key={step}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-500 font-semibold text-white">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            title="Platform Features"
            subtitle="Everything needed to run contract farming relationships with speed, trust, and visibility."
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-blue-100 text-green-700">
                    <Icon aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            title="Built for Every Stakeholder"
            subtitle="ACF is optimized for both farmers and contractors with role-focused workflows."
          />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-white p-8 shadow-md">
              <h3 className="text-2xl font-bold text-green-800">For Farmers</h3>
              <ul className="mt-5 space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="mt-1 text-green-600" /> Guaranteed Buyers
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="mt-1 text-green-600" /> Pre-fixed price
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="mt-1 text-green-600" /> Reduced market risk
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="mt-1 text-green-600" /> Legal safety
                </li>
              </ul>
              <button
                aria-label="Start as Farmer"
                onClick={() => navigate("/signup")}
                className="mt-8 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-green-700"
              >
                Start as Farmer
              </button>
            </div>

            <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8 shadow-md">
              <h3 className="text-2xl font-bold text-blue-800">For Contractors</h3>
              <ul className="mt-5 space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="mt-1 text-blue-600" /> Assured crop supply
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="mt-1 text-blue-600" /> Transparent agreements
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="mt-1 text-blue-600" /> Reliable partnerships
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="mt-1 text-blue-600" /> Organized contract tracking
                </li>
              </ul>
              <button
                aria-label="Join as Contractor"
                onClick={() => navigate("/signup")}
                className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-blue-700"
              >
                Join as Contractor
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            title="What Our Users Say"
            subtitle="Trusted by farming communities and procurement teams."
          />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div
                key={item.name}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <p className="text-gray-700">"{item.quote}"</p>
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionHeading
            title="Frequently Asked Questions"
            subtitle="Everything you need to know before starting with ACF."
          />
          <div className="space-y-4">
            {faqs.map((item, index) => (
              <FAQItem
                key={item.question}
                item={item}
                isOpen={openFaq === index}
                onToggle={() => setOpenFaq(openFaq === index ? -1 : index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-green-600 to-blue-600 py-16 text-white md:py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Ready to Secure Your Farming Future?
          </h2>
          <p className="mt-4 max-w-2xl text-slate-100">
            Join ACF and build transparent, reliable farming partnerships backed by digital agreements.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              aria-label="Get Started Now"
              onClick={() => navigate("/signup")}
              className="rounded-xl bg-white px-7 py-3 font-semibold text-green-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Get Started Now
            </button>
            <button
              aria-label="Contact Us"
              onClick={() => navigate("/help")}
              className="rounded-xl border border-white/60 bg-white/10 px-7 py-3 font-semibold text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div>
            <p className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <FaLeaf className="text-green-600" /> Assured Contract Farming
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Trusted digital contracts for modern agriculture.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-gray-600">
            <button onClick={() => navigate("/")} className="transition hover:text-green-700">
              About
            </button>
            <button onClick={() => navigate("/help")} className="transition hover:text-green-700">
              Contact
            </button>
            <button onClick={() => navigate("/")} className="transition hover:text-green-700">
              Privacy Policy
            </button>
            <button onClick={() => navigate("/")} className="transition hover:text-green-700">
              Terms
            </button>
          </div>

          <div className="flex items-center gap-3 text-gray-500">
            <a href="/" aria-label="Facebook" className="transition hover:text-blue-600">
              <FaFacebook />
            </a>
            <a href="/" aria-label="Instagram" className="transition hover:text-pink-600">
              <FaInstagram />
            </a>
            <a href="/" aria-label="LinkedIn" className="transition hover:text-blue-700">
              <FaLinkedin />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
