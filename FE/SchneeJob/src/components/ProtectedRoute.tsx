import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser } from "@/utils/roleUtils";

interface ProtectedRouteProps {
  readonly children: React.ReactNode;
  readonly requiredRoles: string[];
  readonly fallbackPath?: string;
}

/**
 * Protected route component that checks user role before rendering
 * Redirects to home if user doesn't have required role
 */
export function ProtectedRoute({
  children,
  requiredRoles,
  fallbackPath = "/",
}: ProtectedRouteProps) {
  const user = getStoredUser();
  const token = localStorage.getItem("token");

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // User logged in but doesn't have required role
  if (!requiredRoles.includes(user.role)) {
    console.warn(`Access denied: User role "${user.role}" not in allowed roles:`, requiredRoles);
    return <Navigate to={fallbackPath} replace />;
  }

  // User has required role
  return <>{children}</>;
}
