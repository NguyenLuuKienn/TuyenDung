import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const EmployerProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [companyStatus, setCompanyStatus] = useState(null);
  const [checkingCompany, setCheckingCompany] = useState(true);

  useEffect(() => {
    const checkCompanyStatus = async () => {
      // First check: is user authenticated and loading?
      if (isLoading) {
        console.log('[EmployerProtectedRoute] Auth still loading...');
        return;
      }

      if (!isAuthenticated) {
        console.log('[EmployerProtectedRoute] Not authenticated');
        setCompanyStatus('not-authenticated');
        setCheckingCompany(false);
        return;
      }

      if (user?.role?.toLowerCase() !== 'employer') {
        console.log('[EmployerProtectedRoute] User role is not employer:', user?.role);
        setCompanyStatus('not-employer');
        setCheckingCompany(false);
        return;
      }

      console.log('[EmployerProtectedRoute] Checking company status for employer:', user?.id);
      
      try {
        setCheckingCompany(true);
        // Fetch company from backend API
        const response = await api.get('/api/companies/my-company');
        const company = response.data || response;
        
        console.log('[EmployerProtectedRoute] Company found:', company);
        // If company exists, employer is approved
        setCompanyStatus('approved');
      } catch (error) {
        console.log('[EmployerProtectedRoute] Error checking company:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          url: error.config?.url
        });
        
        // 404 means no company found
        if (error.response?.status === 404) {
          console.log('[EmployerProtectedRoute] No company found (404)');
          setCompanyStatus('none');
        } else if (error.response?.status === 401) {
          // Unauthorized - not logged in or token invalid
          console.log('[EmployerProtectedRoute] Unauthorized (401) - redirecting to login');
          setCompanyStatus('not-authenticated');
        } else {
          // Other errors might be network issues, so fallback to localStorage check
          console.log('[EmployerProtectedRoute] API error, checking localStorage');
          const requests = JSON.parse(localStorage.getItem('companyRequests') || '[]');
          const userRequest = requests.find(r => r.requestedBy === user?.id);
          
          console.log('[EmployerProtectedRoute] localStorage requests:', requests);
          console.log('[EmployerProtectedRoute] userRequest:', userRequest);
          
          if (userRequest?.status === 'pending') {
            console.log('[EmployerProtectedRoute] Found pending request in localStorage');
            setCompanyStatus('pending');
          } else if (userRequest?.status === 'rejected') {
            console.log('[EmployerProtectedRoute] Found rejected request in localStorage');
            setCompanyStatus('rejected');
          } else {
            console.log('[EmployerProtectedRoute] No request found in localStorage');
            setCompanyStatus('none');
          }
        }
      } finally {
        setCheckingCompany(false);
      }
    };

    checkCompanyStatus();
  }, [isAuthenticated, user, isLoading]);

  if (isLoading || checkingCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  console.log('[EmployerProtectedRoute] Final company status:', companyStatus);

  // Not authenticated - redirect to login
  if (companyStatus === 'not-authenticated') {
    return <Navigate to="/login" replace />;
  }

  // Not employer role - redirect to home
  if (companyStatus === 'not-employer') {
    return <Navigate to="/" replace />;
  }

  // If no company, redirect to registration
  if (companyStatus === 'none') {
    return <Navigate to="/employer/company/create" replace />;
  }

  // If pending, redirect to pending page
  if (companyStatus === 'pending') {
    return <Navigate to="/employer/pending" replace />;
  }

  // If rejected, redirect to pending page to see rejection reason
  if (companyStatus === 'rejected') {
    return <Navigate to="/employer/pending" replace />;
  }

  // If approved, allow access
  return children;
};

export default EmployerProtectedRoute;
