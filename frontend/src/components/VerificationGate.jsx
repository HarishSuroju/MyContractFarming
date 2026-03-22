import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaExclamationTriangle, FaHourglassHalf, FaSyncAlt, FaTimesCircle } from 'react-icons/fa';
import { authAPI } from '../services/api';

const StatusCard = ({ icon, title, description, badgeClass, badgeText, children }) => (
  <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-white to-blue-50">
    <div className="w-full max-w-xl rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-lg p-8 text-center transition-all duration-300 hover:shadow-xl">
      <div className="flex justify-center mb-4 text-5xl">{icon}</div>
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4 ${badgeClass}`}>
        {badgeText}
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
      <p className="text-gray-600 leading-relaxed">{description}</p>
      {children}
    </div>
  </div>
);

const VerificationGate = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const loadProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data?.data?.user || null);
    } catch (error) {
      console.error('Verification gate profile fetch error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpload = async () => {
    const normalized = fileUrl.trim();
    if (!normalized) {
      setMessage('Please provide a valid document URL.');
      return;
    }

    setUploading(true);
    setMessage('');
    try {
      await authAPI.uploadVerificationDocument(normalized);
      setMessage('Document uploaded. Verification is now in progress.');
      await loadProfile();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <StatusCard
        icon={<FaSyncAlt className="text-blue-600 animate-spin" />}
        title="Checking Verification Status"
        description="Please wait while we load your account verification details."
        badgeClass="bg-blue-100 text-blue-700"
        badgeText="Loading"
      />
    );
  }

  const hasDocument = Boolean(user?.verificationDocument?.fileUrl);
  const verificationStatus = user?.verificationStatus || 'pending';

  if (!hasDocument) {
    return (
      <StatusCard
        icon={<FaCloudUploadAlt className="text-amber-500" />}
        title="Complete Your Verification"
        description="You must upload verification documents to access the platform."
        badgeClass="bg-amber-100 text-amber-700"
        badgeText="Action Required"
      >
        <div className="mt-6 space-y-3">
          <input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="Paste verification document URL"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-3 transition disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Upload Documents'}
          </button>
          {message ? <p className="text-sm text-gray-600">{message}</p> : null}
        </div>
      </StatusCard>
    );
  }

  if (verificationStatus === 'pending') {
    return (
      <StatusCard
        icon={<FaHourglassHalf className="text-amber-500 animate-pulse" />}
        title="Verification in Progress"
        description="Our team is reviewing your submitted documents. You will be notified once verification is complete."
        badgeClass="bg-amber-100 text-amber-700"
        badgeText="Pending Review"
      >
        <div className="mt-6 inline-flex items-center text-sm text-gray-500">
          <FaSyncAlt className="animate-spin mr-2" />
          Review in progress
        </div>
      </StatusCard>
    );
  }

  if (verificationStatus === 'rejected') {
    return (
      <StatusCard
        icon={<FaTimesCircle className="text-red-500" />}
        title="Verification Rejected"
        description="Your documents were not approved. Please upload valid documents to continue."
        badgeClass="bg-red-100 text-red-700"
        badgeText="Rejected"
      >
        <div className="mt-5 bg-red-50 border border-red-100 rounded-xl p-4 text-left">
          <p className="text-xs uppercase tracking-wide text-red-500 font-semibold mb-1">Admin Remarks</p>
          <p className="text-sm text-red-700">{user?.verificationRemarks || 'No remarks provided.'}</p>
        </div>
        <div className="mt-5 space-y-3">
          <input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="Paste new verification document URL"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-3 transition disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Upload New Documents'}
          </button>
          {message ? <p className="text-sm text-gray-600">{message}</p> : null}
        </div>
      </StatusCard>
    );
  }

  if (verificationStatus === 'approved') {
    return children;
  }

  return (
    <StatusCard
      icon={<FaExclamationTriangle className="text-amber-500" />}
      title="Verification Status Unknown"
      description="We could not determine your verification status. Please return to your profile and try again."
      badgeClass="bg-amber-100 text-amber-700"
      badgeText="Unknown"
    >
      <button
        onClick={() => navigate('/profile')}
        className="mt-6 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold px-5 py-3 transition"
      >
        Go to Profile
      </button>
    </StatusCard>
  );
};

export default VerificationGate;
