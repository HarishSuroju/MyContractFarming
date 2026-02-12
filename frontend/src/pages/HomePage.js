import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (token) {
      setIsLoggedIn(true);
      setRole(userRole);
    }
  }, []);

  const getDashboardRoute = () => {
    if (role === "farmer") return "/farmer-dashboard";
    if (role === "contractor") return "/contractor-dashboard";
    if (role === "admin") return "/admin";
    return "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-700 text-white text-center">
      <div>
        <h1 className="text-5xl font-bold mb-6">ACF</h1>

        <p className="mb-8 text-lg">
          Connecting farmers and contractors through secure smart contracts.
        </p>

        <div className="flex gap-4 justify-center">
          {isLoggedIn ? (
            <button
              onClick={() => navigate(getDashboardRoute())}
              className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/signup")}
                className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold"
              >
                Sign Up
              </button>

              <button
                onClick={() => navigate("/login")}
                className="border border-white px-8 py-3 rounded-lg font-semibold"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
