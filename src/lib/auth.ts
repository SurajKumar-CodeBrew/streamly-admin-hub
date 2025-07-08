export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  const user = localStorage.getItem('adminUser') || sessionStorage.getItem('adminUser');
  
  return !!(token && user);
};

export const getStoredUser = () => {
  const userStr = localStorage.getItem('adminUser') || sessionStorage.getItem('adminUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
};

export const clearAuthData = (): void => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  sessionStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminUser');
}; 