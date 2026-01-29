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

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/profile-builder" element={<ProtectedRoute><ProfileBuilder /></ProtectedRoute>} />
            <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
            <Route path="/contractor-dashboard" element={<ContractorDashboard />} />
            <Route path="/user-matching" element={<UserMatching />} />
            <Route path="/agreement-creation" element={<AgreementCreation />} />
            <Route path="/agreements" element={<Agreements />} />
            <Route path="/user-profile/:userId" element={<UserProfileDetail />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/connection-request/:userId" element={<ConnectionRequestConfirmation />} />
            <Route path="/connection-status/:userId" element={<RequestStatus />} />
            <Route path="/communication/:userId" element={<CommunicationPage />} />
            <Route path="/agreement-summary/:userId" element={<AgreementSummary />} />
            <Route path="/farmer-interest/:userId" element={<FarmerInterestRequest />} />
            <Route path="/contractor-interest/:userId" element={<ContractorInterestSubmission />} />
            <Route path="/farmer-contractor-connection/:userId" element={<FarmerToContractorConnection />} />
            <Route path="/proposal-create/:userId" element={<ProposalCreation />} />
            <Route path="/proposal-status/:userId" element={<ProposalStatus />} />
            <Route path="/agreement-manager" element={<AgreementManager />} />
            <Route path="/agreement-manager/:agreementId" element={<AgreementManager />} />
            <Route path="/agreement-report/:agreementId" element={<AgreementReport />} />
            <Route path="/agreement-edit/:agreementId" element={<AgreementEdit />} />
            <Route path="/connection-requests" element={<ConnectionRequests />} />
            <Route path="/dashboard/requests" element={<Requests />} />
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/users-directory" element={<UsersDirectory />} />
          </Routes>
        </div>
      </Router>
    </I18nextProvider>
  );
}

export default App;