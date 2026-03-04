import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser } from "@/utils/roleUtils";
import companyService from "@/services/companyService";

interface EmployerDashboardRouteProps {
  readonly children: React.ReactNode;
}

/**
 * Protected route component for Employer Dashboard
 * Checks if user has Employer role AND has approved company registration
 * Otherwise redirects appropriately
 */
export function EmployerDashboardRoute({
  children,
}: EmployerDashboardRouteProps) {
  const user = getStoredUser();
  const token = localStorage.getItem("token");
  const [isValidated, setIsValidated] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const checkEmployerStatus = async () => {
      // Not logged in
      if (!token || !user) {
        setRedirectPath("/login");
        return;
      }

      // Not an employer
      if (user.role !== "Employer") {
        setRedirectPath("/");
        return;
      }

      // Check company registration status
      try {
        const registrationRes = await companyService.getMyRegistration();
        const registration = registrationRes.data;

        if (!registration) {
          // No registration found - redirect to register-company
          setRedirectPath("/employer/register-company");
          return;
        }

        // Check registration status
        const status = (registration.status || "").toLowerCase().trim();

        if (status === "approved") {
          // Already approved - allow access
          setIsValidated(true);
        } else if (status === "pending" || status === "submitted") {
          // Registration pending - redirect to registrations list
          setRedirectPath("/employer/registrations");
        } else if (status === "rejected") {
          // Rejected - redirect to re-register
          setRedirectPath("/employer/register-company");
        } else {
          // Unknown status - redirect to register
          setRedirectPath("/employer/register-company");
        }
      } catch (err: any) {
        console.error("Error checking company registration:", err);
        // If error (404 or other), assume no registration
        setRedirectPath("/employer/register-company");
      }
    };

    checkEmployerStatus();
  }, [user, token]);

  // Still loading/validating
  if (redirectPath === null && !isValidated) {
    return <div>Loading...</div>; // Or a loading spinner component
  }

  // Need to redirect
  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  // Validation passed
  return <>{children}</>;
}
