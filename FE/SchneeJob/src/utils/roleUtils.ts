/**
 * Extract role from userInfo object
 * API may return role as string or array depending on endpoint
 */
export function extractRole(userInfo: any): string {
  if (!userInfo) return "JobSeeker";
  
  // If roles is an array, get first element
  if (Array.isArray(userInfo?.roles)) {
    const roleFromArray = userInfo.roles[0];
    if (roleFromArray) return roleFromArray;
  }
  
  // If role is a string, use it directly
  if (typeof userInfo?.role === 'string') {
    return userInfo.role;
  }
  
  // Default fallback
  return "JobSeeker";
}

/**
 * Get user from localStorage with safe parsing
 */
export function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(role: string | string[], allowedRoles: string[]): boolean {
  if (Array.isArray(role)) {
    return role.some(r => allowedRoles.includes(r));
  }
  return allowedRoles.includes(role);
}

/**
 * Check if user can access employer pages
 */
export function isEmployer(role: string): boolean {
  return role === "Employer";
}

/**
 * Check if user can access admin pages
 */
export function isAdmin(role: string): boolean {
  return role === "Admin";
}
