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

  if (!user) return <Navigate to="/login" replace />;
  // Do a case-insensitive check for allowed roles to avoid casing mismatches
  const allowedLower = allowedRoles.map((r) => r.toLowerCase());
  if (!allowedLower.includes(user.role.toLowerCase())) return <Navigate to="/" replace />;

  return children;
}
