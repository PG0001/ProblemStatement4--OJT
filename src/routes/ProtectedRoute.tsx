import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { user } = useAuth();

  // Check token/session storage directly as fallback
  const token = localStorage.getItem("token");
  const sessionRole = sessionStorage.getItem("user_role");

  // If no user and no token → redirect to login
  if (!user && !token) return <Navigate to="/login" replace />;

  // Determine the current role (from user state first, then session)
  const currentRole = user?.role || sessionRole || "";
  const allowedLower = allowedRoles.map((r) => r.toLowerCase());

  if (!allowedLower.includes(currentRole.toLowerCase())) return <Navigate to="/" replace />;

  return children;
}
