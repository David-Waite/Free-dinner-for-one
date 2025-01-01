import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, user }) {
  // If there's no user, redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children; // Allow access to the protected page if the user is logged in
}

export default ProtectedRoute;
