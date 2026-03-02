import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

import LandingPage from './pages/LandingPage';
import UserHomePage from './pages/UserHomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfileBuilder from './pages/ProfileBuilder';
import FarmerDashboard from './pages/FarmerDashboard';
import ContractorDashboard from './pages/ContractorDashboard';
import HelpPage from './pages/HelpPage';
import ProfilePage from './pages/ProfilePage';
import Agreements from './pages/Agreements';
import UsersDirectory from './pages/UsersDirectory';
import UserProfileDetail from './pages/UserProfileDetail';
import ProfileEdit from './pages/ProfileEdit';
import CommunicationPage from './pages/CommunicationPage';
import AgreementSummary from './pages/AgreementSummary';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';
import ConnectionRequests from './pages/ConnectionRequests';
import Requests from './pages/Requests';
import VerifyOTPPage from "./pages/VerifyOTPPage";
import FarmerToContractorConnection from './pages/FarmerToContractorConnection';
import ContractorInterestSubmission from './pages/ContractorInterestSubmission';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Chatbot from './components/Chatbot';
import FloatingChatButton from './components/FloatingChatButton';
import Footer from './components/Footer';
import { cleanupSessionAuthOnStartup } from './utils/authStorage';


// ✅ This component CAN use useLocation
function AppContent() {
  const location = useLocation();
  useEffect(() => {
    cleanupSessionAuthOnStartup();
  }, []);

  const hideLayoutRoutes = ["/login", "/signup", "/verify-otp"];
  const hideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <div className="App">
      {!hideLayout && <Navbar />}
      {!hideLayout && <FloatingChatButton />}

      <Routes>

        {/* 🌍 PUBLIC ROUTES */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/users-directory" element={<UsersDirectory />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* 🏠 AUTHENTICATED HOME */}
        <Route
          path="/app-home"
          element={
            <ProtectedRoute>
              <UserHomePage />
            </ProtectedRoute>
          }
        />

        {/* 👤 PROFILE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile-edit"
          element={
            <ProtectedRoute>
              <ProfileEdit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile-builder"
          element={
            <ProtectedRoute>
              <ProfileBuilder />
            </ProtectedRoute>
          }
        />

        {/* 📊 DASHBOARDS */}
        <Route
          path="/farmer-dashboard"
          element={
            <ProtectedRoute>
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contractor-dashboard"
          element={
            <ProtectedRoute>
              <ContractorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 📩 REQUESTS */}
        <Route
          path="/connection-requests"
          element={
            <ProtectedRoute>
              <ConnectionRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/requests"
          element={
            <ProtectedRoute>
              <Requests />
            </ProtectedRoute>
          }
        />

        {/* 💬 COMMUNICATION */}
        <Route
          path="/communication/:userId"
          element={
            <ProtectedRoute>
              <CommunicationPage />
            </ProtectedRoute>
          }
        />

        {/* 📄 AGREEMENTS */}
        <Route
          path="/agreements"
          element={
            <ProtectedRoute>
              <Agreements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agreement-summary/:userId"
          element={
            <ProtectedRoute>
              <AgreementSummary />
            </ProtectedRoute>
          }
        />

        {/* 👤 USER DETAIL */}
        <Route
          path="/user-profile/:userId"
          element={
            <ProtectedRoute>
              <UserProfileDetail />
            </ProtectedRoute>
          }
        />

        {/* 🔄 CONNECTION FLOWS */}
        <Route
          path="/farmer-contractor-connection/:userId"
          element={
            <ProtectedRoute>
              <FarmerToContractorConnection />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contractor-interest/:userId"
          element={
            <ProtectedRoute>
              <ContractorInterestSubmission />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!hideLayout && <Footer />}
    </div>
  );
}


// ✅ Main App ONLY wraps Router
function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <AppContent />
      </Router>
    </I18nextProvider>
  );
}

export default App;
