import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // 1. While checking localStorage, show a loader to prevent premature redirect
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#E3ECFF] dark:bg-overall_bg-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 2. If user exists, allow access (Outlet). If not, redirect to Login (path="/")
  return user ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;