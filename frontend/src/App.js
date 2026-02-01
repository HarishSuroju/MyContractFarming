import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import HomePage from './components/HomePage';
import LandingPage from './pages/LandingPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfileBuilder from './pages/ProfileBuilder';
import FarmerDashboard from './pages/FarmerDashboard';
import ContractorDashboard from './pages/ContractorDashboard';
import CropSelection from './pages/CropSelection';
import UserMatching from './pages/UserMatching';
import AgreementCreation from './pages/AgreementCreation';
import HelpPage from './pages/HelpPage';
import ProfilePage from './pages/ProfilePage';
import Agreements from './pages/Agreements';
import UsersDirectory from './pages/UsersDirectory';
import UserProfileDetail from './pages/UserProfileDetail';
import ProfileEdit from './pages/ProfileEdit';
import Navbar from './components/Navbar';
import ConnectionRequestConfirmation from './pages/ConnectionRequestConfirmation';
import RequestStatus from './pages/RequestStatus';
import CommunicationPage from './pages/CommunicationPage';
import AgreementSummary from './pages/AgreementSummary';
import FarmerInterestRequest from './pages/FarmerInterestRequest';
import ContractorInterestSubmission from './pages/ContractorInterestSubmission';
import FarmerToContractorConnection from './pages/FarmerToContractorConnection';
import AdminDashboard from './pages/AdminDashboard';
import ProposalCreation from './pages/ProposalCreation';
import ProposalStatus from './pages/ProposalStatus';
import Unauthorized from './pages/Unauthorized';
import AgreementManager from './pages/AgreementManager';
import AgreementReport from './pages/AgreementReport';
import AgreementEdit from './pages/AgreementEdit';
import ConnectionRequests from './pages/ConnectionRequests';
import Requests from './pages/Requests';
import ProtectedRoute from './components/ProtectedRoute';
import Chatbot from './components/Chatbot';
import FloatingChatButton from './components/FloatingChatButton';
import Footer from './components/Footer';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <div className="App">
          <Navbar />
          <FloatingChatButton />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/profile-builder" element={<ProtectedRoute><ProfileBuilder /></ProtectedRoute>} />
            <Route path="/farmer-dashboard" element={<ProtectedRoute><FarmerDashboard /></ProtectedRoute>} />
            <Route path="/contractor-dashboard" element={<ProtectedRoute><ContractorDashboard /></ProtectedRoute>} />
            <Route path="/user-matching" element={<ProtectedRoute><UserMatching /></ProtectedRoute>} />
            <Route path="/agreement-creation" element={<ProtectedRoute><AgreementCreation /></ProtectedRoute>} />
            <Route path="/agreements" element={<ProtectedRoute><Agreements /></ProtectedRoute>} />
            <Route path="/user-profile/:userId" element={<ProtectedRoute><UserProfileDetail /></ProtectedRoute>} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/connection-request/:userId" element={<ProtectedRoute><ConnectionRequestConfirmation /></ProtectedRoute>} />
            <Route path="/connection-status/:userId" element={<ProtectedRoute><RequestStatus /></ProtectedRoute>} />
            <Route path="/communication/:userId" element={<ProtectedRoute><CommunicationPage /></ProtectedRoute>} />
            <Route path="/agreement-summary/:userId" element={<ProtectedRoute><AgreementSummary /></ProtectedRoute>} />
            <Route path="/farmer-interest/:userId" element={<ProtectedRoute><FarmerInterestRequest /></ProtectedRoute>} />
            <Route path="/contractor-interest/:userId" element={<ProtectedRoute><ContractorInterestSubmission /></ProtectedRoute>} />
            <Route path="/farmer-contractor-connection/:userId" element={<ProtectedRoute><FarmerToContractorConnection /></ProtectedRoute>} />
            <Route path="/proposal-create/:userId" element={<ProtectedRoute><ProposalCreation /></ProtectedRoute>} />
            <Route path="/proposal-status/:userId" element={<ProtectedRoute><ProposalStatus /></ProtectedRoute>} />
            <Route path="/agreement-manager" element={<ProtectedRoute><AgreementManager /></ProtectedRoute>} />
            <Route path="/agreement-manager/:agreementId" element={<ProtectedRoute><AgreementManager /></ProtectedRoute>} />
            <Route path="/agreement-report/:agreementId" element={<ProtectedRoute><AgreementReport /></ProtectedRoute>} />
            <Route path="/agreement-edit/:agreementId" element={<ProtectedRoute><AgreementEdit /></ProtectedRoute>} />
            <Route path="/connection-requests" element={<ProtectedRoute><ConnectionRequests /></ProtectedRoute>} />
            <Route path="/dashboard/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/users-directory" element={<UsersDirectory />} />
            <Route path="/profile-edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
            <Route path="/chatbot" element={<Chatbot />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </I18nextProvider>
  );
}

export default App;