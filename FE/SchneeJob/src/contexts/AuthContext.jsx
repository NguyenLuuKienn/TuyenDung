import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { useTheme } from './ThemeContext';

const AuthContext = createContext(null);

/**
 * Utility: Decode JWT token and check if it's valid
 */
const validateAndDecodeToken = (token) => {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('[Auth] Invalid token format: expected 3 parts, got', parts.length);
      return null;
    }

    // Decode payload (base64url decode)
    // Note: base64url uses - and _ instead of + and /
    let payload;
    try {
      const decoded = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      payload = JSON.parse(decoded);
    } catch (decodeErr) {
      console.warn('[Auth] Failed to decode token payload:', decodeErr.message);
      return null;
    }

    const expirationTime = payload.exp * 1000; // exp is in seconds
    const nowTime = Date.now();

    // Token is valid if not expired
    if (nowTime < expirationTime) {
      return payload;
    }
    console.warn('[Auth] Token expired at', new Date(expirationTime).toISOString());
    return null;
  } catch (err) {
    console.error('[Auth] Unexpected error validating token:', err.message);
    return null;
  }
};

/**
 * Utility: Restore user from localStorage or token claims
 */
const restoreUserFromStorage = () => {
  const token = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  console.log('[Auth] Attempting to restore user from storage...');
  console.log('[Auth] Token in storage:', token ? `${token.substring(0, 20)}...` : null);
  console.log('[Auth] User in storage:', savedUser ? `${savedUser.substring(0, 50)}...` : null);

  // First validate token
  const tokenPayload = validateAndDecodeToken(token);
  if (!tokenPayload) {
    // Token invalid or expired, clear everything
    console.log('[Auth] Token is invalid/expired, clearing storage');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }

  console.log('[Auth] Token is valid, payload:', tokenPayload);

  // Token is valid, try to restore user
  if (savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);
      console.log('[Auth] ✓ Restored user from storage:', parsedUser);
      return parsedUser;
    } catch (err) {
      console.error('[Auth] Failed to parse saved user:', err.message);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  } else {
    // Token valid but user data missing - reconstruct from token claims
    const reconstructedUser = {
      id: tokenPayload.nameid || tokenPayload.sub || '',
      email: tokenPayload.email || '',
      fullName: tokenPayload.name || '',
      avatarURL: '',
      role: tokenPayload.role || 'JobSeeker',
    };
    console.warn('[Auth] Reconstructed user from token claims:', reconstructedUser);
    return reconstructedUser;
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    console.log('[Auth] ===== AUTH CHECK START =====');
    try {
      const restoredUser = restoreUserFromStorage();
      if (restoredUser) {
        console.log('[Auth] ✓ User restored from storage:', restoredUser);
        setUser(restoredUser);
      } else {
        console.log('[Auth] ⓘ No valid session found in storage');
        setUser(null);
      }
    } catch (err) {
      console.error('[Auth] ✗ Error during auth initialization:', err.message);
      setUser(null);
    }

    console.log('[Auth] Setting hasCheckedAuth=true, isLoading=false');
    console.log('[Auth] ===== AUTH CHECK COMPLETE =====');
    setHasCheckedAuth(true);
    setIsLoading(false);
  }, []);

  // Monitor token expiration and auto-logout
  useEffect(() => {
    // Check token validity every minute
    const tokenCheckInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = validateAndDecodeToken(token);
        if (!payload) {
          // Token expired or invalid
          console.warn('[Auth] Token invalid or expired, auto-logging out');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          // Optionally redirect to login or show message
        }
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(tokenCheckInterval);
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      console.log('[Auth] Login attempt for:', email);
      const response = await authService.login(email, password);
      const data = response.data;
      console.log('[Auth] Login response:', data);

      // Backend returns: { success, message, token, userInfo }
      if (!data.success) {
        const errorMsg = data.message || 'Login failed';
        console.error('[Auth] Login failed:', errorMsg);
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Prepare user object with proper structure
      const userInfo = {
        id: data.userInfo.userID,
        email: data.userInfo.email,
        fullName: data.userInfo.fullName,
        avatarURL: data.userInfo.avatarURL,
        role: data.userInfo.roles?.[0] || 'JobSeeker', // Get first role
        companyId: data.userInfo.companyId || null,
        companyVerified: data.userInfo.companyVerified || false,
      };

      console.log('[Auth] Saving user info:', userInfo);
      console.log('[Auth] Saving token:', data.token.substring(0, 30) + '...');
      console.log('[Auth] Token format check:', {
        length: data.token.length,
        parts: data.token.split('.').length,
        preview: data.token.substring(0, 50)
      });

      // Try to decode and show token claims
      if (data.token) {
        try {
          const parts = data.token.split('.');
          if (parts.length === 3) {
            // Decode JWT payload (base64url)
            const decoded = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
            const payload = JSON.parse(decoded);
            console.log('[Auth] Token claims:', payload);
          }
        } catch (e) {
          console.warn('[Auth] Could not decode token for logging:', e.message);
        }
      }

      // Save token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userInfo));

      console.log('[Auth] Updating user state');
      setUser(userInfo);

      console.log('[Auth] Login successful');
      return { success: true, user: userInfo };
    } catch (err) {
      console.error('[Auth] Login error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const registerJobSeeker = async (userData) => {
    setError(null);
    try {
      console.log('[Auth] Registering job seeker:', userData.email);
      const response = await authService.registerJobSeeker(userData);
      const data = response.data;
      console.log('[Auth] Registration response:', data);

      // Backend returns: {userID, email, fullName, avatarURL, roles} directly (no success field for register)
      // Login returns: {success, message, token, userInfo}
      // Check if we got user data (registration successful)
      if (!data.userID && !data.email) {
        const errorMsg = data.message || 'Registration failed';
        console.error('[Auth] Registration failed:', errorMsg);
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Prepare user object with response data
      const userInfo = {
        id: data.userID,
        email: data.email,
        fullName: data.fullName,
        avatarURL: data.avatarURL,
        role: data.roles?.[0] || 'JobSeeker',
        companyId: data.companyId || null,
        companyVerified: data.companyVerified || false,
      };

      console.log('[Auth] Registration successful, user info:', userInfo);

      // For register, backend doesn't return token, so user needs to login
      // Save user info but not token yet
      localStorage.setItem('user', JSON.stringify(userInfo));

      setUser(userInfo);
      return { success: true, user: userInfo };
    } catch (err) {
      console.error('[Auth] Registration error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const registerEmployer = async (userData) => {
    setError(null);
    try {
      console.log('[Auth] Registering employer:', userData.email);
      const response = await authService.registerEmployer(userData);
      const data = response.data;
      console.log('[Auth] Registration response:', data);

      // Backend returns: {userID, email, fullName, avatarURL, roles} directly (no success field for register)
      // Check if we got user data (registration successful)
      if (!data.userID && !data.email) {
        const errorMsg = data.message || 'Registration failed';
        console.error('[Auth] Registration failed:', errorMsg);
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Prepare user object with response data
      const userInfo = {
        id: data.userID,
        email: data.email,
        fullName: data.fullName,
        avatarURL: data.avatarURL,
        role: data.roles?.[0] || 'Employer',
        companyId: data.companyId || null,
        companyVerified: data.companyVerified || false,
      };

      console.log('[Auth] Registration successful, user info:', userInfo);

      // For register, backend doesn't return token, so user needs to login
      // Save user info but not token yet
      localStorage.setItem('user', JSON.stringify(userInfo));

      setUser(userInfo);
      return { success: true, user: userInfo };
    } catch (err) {
      console.error('[Auth] Registration error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const { setMode } = useTheme();

  const logout = useCallback(() => {
    console.log('[Auth] Logging out...');
    authService.logout();
    setUser(null);
    setError(null);
    setMode('light'); // Reset theme to light mode
    console.log('[Auth] Logout complete');
  }, [setMode]);

  const updateProfile = (profileData) => {
    const updatedUser = {
      ...user,
      profile: { ...user?.profile, ...profileData }
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return { success: true };
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return { success: true };
  };

  const value = {
    user,
    isLoading,
    hasCheckedAuth,
    // isAuthenticated returns true if user is loaded AND we have a valid token
    // Token validation happens on app startup - we don't need to validate on every render
    isAuthenticated: !!user && !!localStorage.getItem('token'),
    isJobSeeker: user?.role?.toLowerCase() === 'jobseeker',
    isEmployer: user?.role?.toLowerCase() === 'employer',
    isAdmin: user?.role?.toLowerCase() === 'admin',
    error,
    login,
    registerJobSeeker,
    registerEmployer,
    logout,
    updateProfile,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
