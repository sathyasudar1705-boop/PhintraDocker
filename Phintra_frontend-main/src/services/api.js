import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://127.0.0.1:8001'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT Token contextually
api.interceptors.request.use(
  (config) => {
    const isAdmin = window.location.pathname.startsWith('/admin') || 
                    window.location.pathname === '/login' || 
                    window.location.pathname === '/register' || 
                    window.location.pathname === '/forgot-password';
    const token = localStorage.getItem(isAdmin ? 'adminToken' : 'employeeToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handler, Automatic Logout on 401, & Offline Detection
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAdmin = window.location.pathname.startsWith('/admin') || 
                      window.location.pathname === '/login' || 
                      window.location.pathname === '/register' || 
                      window.location.pathname === '/forgot-password';
      if (isAdmin) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminRole');
        localStorage.removeItem('adminUser');
        
        // Redirect to admin login if not already on the login/register paths
        const currentPath = window.location.pathname;
        if (currentPath !== '/admin/login' && currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/forgot-password') {
          window.location.href = '/admin/login';
        }
      } else {
        localStorage.removeItem('employeeToken');
        localStorage.removeItem('employeeAuth');
        localStorage.removeItem('employeeRole');
        localStorage.removeItem('employeeUser');
        
        // Redirect to user login if not already on the login paths
        const currentPath = window.location.pathname;
        if (currentPath !== '/user/login' && currentPath !== '/employee-login') {
          window.location.href = '/user/login';
        }
      }
    } else if (!error.response) {
      // Backend is offline / unreachable (e.g. ERR_CONNECTION_REFUSED or Network Error)
      console.error("API connection error. The backend server appears to be offline or unreachable.", error);
      const baseUrl = api.defaults.baseURL || '';
      const portMatch = baseUrl.match(/:(\d+)/);
      const port = portMatch ? portMatch[1] : '8000';
      error.message = `The Phintra backend server is offline or unreachable. Please verify that the backend is running on port ${port}.`;
    }
    return Promise.reject(error);
  }
);

export default api;
