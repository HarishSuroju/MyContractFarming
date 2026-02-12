import React from "react";
import { useNavigate } from "react-router-dom";

const UserHomePage = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");

  const goToDashboard = () => {
    if (role === "farmer") navigate("/farmer-dashboard");
    else if (role === "contractor") navigate("/contractor-dashboard");
    else if (role === "admin") navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-700 to-emerald-600 text-white text-center">
      <div>
        <h1 className="text-5xl font-bold mb-6">Welcome Back 👋</h1>
        <p className="mb-8 text-lg">
          Continue managing your contracts and connections.
        </p>

        <button
          onClick={goToDashboard}
          className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default UserHomePage;
