import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [adminAuth, setAdminAuth] = useState(() => {
    return localStorage.getItem('adminAuth') === 'true';
  });
  const [adminRole, setAdminRole] = useState(() => {
    return localStorage.getItem('adminRole') || 'Security Administrator';
  });
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('adminUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [employeeAuth, setEmployeeAuth] = useState(() => {
    return localStorage.getItem('employeeAuth') === 'true';
  });
  const [employeeRole, setEmployeeRole] = useState(() => {
    return localStorage.getItem('employeeRole') || 'Employee';
  });
  const [employeeUser, setEmployeeUser] = useState(() => {
    const saved = localStorage.getItem('employeeUser');
    return saved ? JSON.parse(saved) : {
      name: 'New Employee',
      email: 'employee@phintra.com',
      role: 'Employee',
      department: 'Finance',
      streakDays: 0,
      securityScore: 0,
      rewards_balance: 0
    };
  });

  const [isInitializing, setIsInitializing] = useState(true);



  // Map backend roles (Admin, Manager, Employee) to frontend UI expected roles
  const mapBackendRoleToFrontend = (role) => {
    if (role === 'Admin') return 'Security Administrator';
    if (role === 'Manager') return 'Security Manager';
    return 'Employee';
  };

  const mapFrontendRoleToBackend = (role) => {
    if (role === 'Security Administrator') return 'Admin';
    if (role === 'Security Manager') return 'Manager';
    return 'Employee';
  };

  const clearAllAuthStorage = () => {
    setAdminAuth(false);
    setAdminRole('Security Administrator');
    setAdminUser(null);
    setEmployeeAuth(false);
    setEmployeeRole('Employee');
    setEmployeeUser(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employeeAuth');
    localStorage.removeItem('employeeRole');
    localStorage.removeItem('employeeUser');
    localStorage.removeItem('phintra_token');
    localStorage.removeItem('role');
    localStorage.removeItem('portal_type');
    localStorage.removeItem('user');
  };

  const logoutAdmin = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      console.warn("Logout notification to server failed:", e);
    }
    
    setAdminAuth(false);
    setAdminRole('Security Administrator');
    setAdminUser(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminUser');
    
    // Clear generic keys if admin was active portal
    if (localStorage.getItem('portal_type') === 'admin') {
      localStorage.removeItem('phintra_token');
      localStorage.removeItem('role');
      localStorage.removeItem('portal_type');
      localStorage.removeItem('user');
    }
  };

  const logoutEmployee = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      console.warn("Logout notification to server failed:", e);
    }
    
    setEmployeeAuth(false);
    setEmployeeRole('Employee');
    setEmployeeUser(null);
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employeeAuth');
    localStorage.removeItem('employeeRole');
    localStorage.removeItem('employeeUser');
    
    // Clear generic keys if employee was active portal
    if (localStorage.getItem('portal_type') === 'employee') {
      localStorage.removeItem('phintra_token');
      localStorage.removeItem('role');
      localStorage.removeItem('portal_type');
      localStorage.removeItem('user');
    }
  };

  // On mount: validate existing token based on path context
  useEffect(() => {
    const validateToken = async () => {
      if (window.location.pathname === '/auth/microsoft/callback') {
        setIsInitializing(false);
        return;
      }
      // Intercept URL dashboard token parameter for passwordless auto-login
      const urlParams = new URLSearchParams(window.location.search);
      const queryToken = urlParams.get('token');
      if (queryToken) {
        try {
          const response = await api.get(`/auth/verify-dashboard-token?token=${queryToken}`);
          const { access_token, employee, user } = response.data;
          
          if (employee) {
            localStorage.setItem('employeeToken', access_token);
            localStorage.setItem('employeeAuth', 'true');
            localStorage.setItem('employeeRole', 'Employee');
            
            setEmployeeAuth(true);
            setEmployeeRole('Employee');
            setEmployeeUser({
              employee_id: employee.employee_id || employee.id,
              name: employee.name,
              email: employee.email,
              role: 'Employee',
              department: employee.department,
              streakDays: 4,
              securityScore: employee.personal_score || 80,
              rewards_balance: employee.rewards_balance || 1010
            });
          } else if (user) {
            const mappedRole = mapBackendRoleToFrontend(user.role);
            localStorage.setItem('adminToken', access_token);
            localStorage.setItem('adminAuth', 'true');
            localStorage.setItem('adminRole', mappedRole);
            
            setAdminAuth(true);
            setAdminRole(mappedRole);
            setAdminUser({
              employee_id: user.employee_id || user.id,
              name: user.name,
              email: user.email,
              role: mappedRole,
              department: user.department || 'Management',
              streakDays: 4,
              securityScore: user.personal_score || 95
            });
          }
          
          // Clean URL token parameter
          urlParams.delete('token');
          const newSearch = urlParams.toString();
          const newPath = window.location.pathname + (newSearch ? `?${newSearch}` : '');
          window.history.replaceState({}, '', newPath);
          setIsInitializing(false);
          return;
        } catch (error) {
          console.error("Dashboard secure token verification failed:", error);
          // Clean token parameter and fall back to regular login verification
          urlParams.delete('token');
          const newSearch = urlParams.toString();
          const newPath = window.location.pathname + (newSearch ? `?${newSearch}` : '');
          window.history.replaceState ? window.history.replaceState({}, '', newPath) : null;
        }
      }

      const isAdmin = window.location.pathname.startsWith('/admin') || 
                      window.location.pathname === '/login' || 
                      window.location.pathname === '/register' || 
                      window.location.pathname === '/forgot-password';
                      
      if (isAdmin) {
        localStorage.removeItem('employeeToken');
        localStorage.removeItem('employeeAuth');
        localStorage.removeItem('employeeRole');
        localStorage.removeItem('employeeUser');
        setEmployeeAuth(false);
        setEmployeeRole('Employee');
        setEmployeeUser(null);
      } else {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminRole');
        localStorage.removeItem('adminUser');
        setAdminAuth(false);
        setAdminRole('Security Administrator');
        setAdminUser(null);
      }

      const token = localStorage.getItem(isAdmin ? 'adminToken' : 'employeeToken');
      if (!token) {
        if (isAdmin) logoutAdmin(); else logoutEmployee();
        setIsInitializing(false);
        return;
      }
      try {
        const response = await api.get('/auth/validate');
        if (response.data.valid) {
          // Fetch complete profile details to keep frontend state sync'd
          const profileResponse = await api.get('/auth/me/profile');
          const profile = profileResponse.data;
          const mappedRole = mapBackendRoleToFrontend(profile.role);
          
          if (isAdmin) {
            setAdminAuth(true);
            setAdminRole(mappedRole);
            setAdminUser({
              employee_id: profile.employee_id,
              name: profile.name,
              email: profile.email,
              role: mappedRole,
              department: profile.department,
              streakDays: 4,
              securityScore: profile.personal_score
            });
            localStorage.setItem('adminAuth', 'true');
            localStorage.setItem('adminRole', mappedRole);
          } else {
            setEmployeeAuth(true);
            setEmployeeRole(mappedRole);
            setEmployeeUser({
              employee_id: profile.employee_id,
              name: profile.name,
              email: profile.email,
              role: mappedRole,
              department: profile.department,
              streakDays: 4,
              securityScore: profile.personal_score,
              rewards_balance: profile.xp
            });
            localStorage.setItem('employeeAuth', 'true');
            localStorage.setItem('employeeRole', mappedRole);
          }
        } else {
          if (isAdmin) logoutAdmin(); else logoutEmployee();
        }
      } catch (error) {
        console.error("Session token validation failed:", error);
        if (isAdmin) logoutAdmin(); else logoutEmployee();
      } finally {
        setIsInitializing(false);
      }
    };

    validateToken();
  }, []);

  // Persist admin auth status to local storage
  useEffect(() => {
    localStorage.setItem('adminAuth', adminAuth);
    localStorage.setItem('adminRole', adminRole);
    if (adminUser) {
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
    } else {
      localStorage.removeItem('adminUser');
    }
  }, [adminAuth, adminRole, adminUser]);

  // Persist employee auth status to local storage
  useEffect(() => {
    localStorage.setItem('employeeAuth', employeeAuth);
    localStorage.setItem('employeeRole', employeeRole);
    if (employeeUser) {
      localStorage.setItem('employeeUser', JSON.stringify(employeeUser));
    } else {
      localStorage.removeItem('employeeUser');
    }
  }, [employeeAuth, employeeRole, employeeUser]);

  const login = async (email, password) => {
    // Clear employee session
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employeeAuth');
    localStorage.removeItem('employeeRole');
    localStorage.removeItem('employeeUser');
    setEmployeeAuth(false);
    setEmployeeRole('Employee');
    setEmployeeUser(null);

    try {
      // /auth/login uses OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append('username', email.trim());
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;
      localStorage.setItem('adminToken', access_token);

      // Fetch user profile info
      const profileResponse = await api.get('/auth/me/profile');
      const profile = profileResponse.data;
      const mappedRole = mapBackendRoleToFrontend(profile.role);

      setAdminAuth(true);
      setAdminRole(mappedRole);
      setAdminUser({
        employee_id: profile.employee_id,
        name: profile.name,
        email: profile.email,
        role: mappedRole,
        department: profile.department,
        streakDays: 4,
        securityScore: profile.personal_score
      });

      return { success: true, role: mappedRole };
    } catch (error) {
      console.error("Login failure:", error);
      const errMsg = error.response?.data?.detail || 'Incorrect credentials or server connection failed.';
      return { success: false, message: errMsg };
    }
  };

  const employeeLogin = async (email, password) => {
    // Clear admin session
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminUser');
    setAdminAuth(false);
    setAdminRole('Security Administrator');
    setAdminUser(null);

    try {
      const response = await api.post('/auth/employee-login', {
        email: email.trim(),
        password: password
      });

      const { access_token, employee } = response.data;
      const employeeUserData = {
        employee_id: employee.employee_id || employee.id,
        name: employee.name,
        email: employee.email,
        role: 'Employee',
        department: employee.department,
        streakDays: 4,
        securityScore: employee.personal_score || 80,
        rewards_balance: employee.rewards_balance || 1010
      };

      // Write directly to local storage synchronously before setting context states
      localStorage.setItem('phintra_token', access_token);
      localStorage.setItem('role', 'Employee');
      localStorage.setItem('portal_type', 'employee');
      localStorage.setItem('user', JSON.stringify(employeeUserData));
      localStorage.setItem('employeeToken', access_token);
      localStorage.setItem('employeeAuth', 'true');
      localStorage.setItem('employeeRole', 'Employee');
      localStorage.setItem('employeeUser', JSON.stringify(employeeUserData));

      setEmployeeAuth(true);
      setEmployeeRole('Employee');
      setEmployeeUser(employeeUserData);

      return { success: true, role: 'Employee' };
    } catch (error) {
      console.error("Employee login failure:", error);
      const errMsg = error.response?.data?.detail || 'Incorrect credentials or server connection failed.';
      return { success: false, message: errMsg };
    }
  };

  const register = async (name, email, companyName, password, companySize = '', industry = '') => {
    try {
      await api.post('/auth/register', {
        full_name: name,
        email: email.trim(),
        company_name: companyName,
        password: password,
        company_size: companySize || null,
        industry: industry || null
      });
      return { success: true };
    } catch (error) {
      console.error("[DEBUG] Registration failure. Full Axios error response:", error.response || error);
      const errMsg = error.response?.data?.detail || 'Registration failed. Please check inputs.';
      return { success: false, message: errMsg };
    }
  };

  const selectRole = (role) => {
    const isAdmin = window.location.pathname.startsWith('/admin') || 
                    window.location.pathname === '/login' || 
                    window.location.pathname === '/register' || 
                    window.location.pathname === '/forgot-password';
    if (isAdmin) {
      setAdminRole(role);
      setAdminUser(prev => prev ? { ...prev, role } : null);
    } else {
      setEmployeeRole(role);
      setEmployeeUser(prev => prev ? { ...prev, role } : null);
    }
  };

  const logout = async () => {
    const isAdmin = window.location.pathname.startsWith('/admin') || 
                    window.location.pathname === '/login' || 
                    window.location.pathname === '/register' || 
                    window.location.pathname === '/forgot-password';
    if (isAdmin) {
      await logoutAdmin();
    } else {
      await logoutEmployee();
    }
  };

  const setCurrentUser = (updater) => {
    const isAdmin = window.location.pathname.startsWith('/admin') || 
                    window.location.pathname === '/login' || 
                    window.location.pathname === '/register' || 
                    window.location.pathname === '/forgot-password';
    if (isAdmin) {
      setAdminUser(prev => typeof updater === 'function' ? updater(prev) : updater);
    } else {
      setEmployeeUser(prev => typeof updater === 'function' ? updater(prev) : updater);
    }
  };

  const microsoftLogin = async (accessToken, idToken, portalType) => {
    try {
      clearAllAuthStorage();

      const response = await api.post('/auth/microsoft-login', {
        access_token: accessToken,
        id_token: idToken,
        portal_type: portalType
      });
      
      const { access_token, role, user, employee, redirect_path } = response.data;
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      const mappedRole = mapBackendRoleToFrontend(role);
      const isBackendAdmin = mappedRole === 'Security Administrator' || mappedRole === 'Security Manager';

      if (isBackendAdmin) {
        const adminUserData = {
          employee_id: user ? (user.employee_id || user.id) : null,
          name: user ? user.name : 'Admin',
          email: user ? user.email : '',
          role: mappedRole,
          department: (user && user.department) || 'Management',
          streakDays: 4,
          securityScore: (user && user.personal_score) || 95
        };

        // Write directly to local storage synchronously before setting context states
        localStorage.setItem('phintra_token', access_token);
        localStorage.setItem('role', mappedRole);
        localStorage.setItem('portal_type', 'admin');
        localStorage.setItem('user', JSON.stringify(adminUserData));
        localStorage.setItem('adminToken', access_token);
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminRole', mappedRole);
        localStorage.setItem('adminUser', JSON.stringify(adminUserData));

        setAdminAuth(true);
        setAdminRole(mappedRole);
        setAdminUser(adminUserData);
        setIsInitializing(false);
        return { success: true, role: mappedRole, redirect_path };
      } else {
        const employeeUserData = {
          employee_id: employee ? (employee.employee_id || employee.id) : (user ? user.id : null),
          name: employee ? employee.name : (user ? user.name : 'Employee'),
          email: employee ? employee.email : (user ? user.email : ''),
          role: 'Employee',
          department: (employee && employee.department) || 'Unknown',
          streakDays: 4,
          securityScore: (employee && employee.personal_score) || 80,
          rewards_balance: (employee && employee.rewards_balance) || 1010
        };

        // Write directly to local storage synchronously before setting context states
        localStorage.setItem('phintra_token', access_token);
        localStorage.setItem('role', 'Employee');
        localStorage.setItem('portal_type', 'employee');
        localStorage.setItem('user', JSON.stringify(employeeUserData));
        localStorage.setItem('employeeToken', access_token);
        localStorage.setItem('employeeAuth', 'true');
        localStorage.setItem('employeeRole', 'Employee');
        localStorage.setItem('employeeUser', JSON.stringify(employeeUserData));

        setEmployeeAuth(true);
        setEmployeeRole('Employee');
        setEmployeeUser(employeeUserData);
        setIsInitializing(false);
        return { success: true, role: 'Employee', redirect_path };
      }
    } catch (error) {
      console.error('Microsoft login verification failed:', error);
      clearAllAuthStorage();
      const errMsg = error.response?.data?.detail || 'Your account is not registered in Phintra.';
      return { success: false, message: errMsg };
    }
  };

  const value = {
    get isAuthenticated() {
      const isAdmin = window.location.pathname.startsWith('/admin') || 
                      window.location.pathname === '/login' || 
                      window.location.pathname === '/register' || 
                      window.location.pathname === '/forgot-password';
      return isAdmin ? adminAuth : employeeAuth;
    },
    get userRole() {
      const isAdmin = window.location.pathname.startsWith('/admin') || 
                      window.location.pathname === '/login' || 
                      window.location.pathname === '/register' || 
                      window.location.pathname === '/forgot-password';
      return isAdmin ? adminRole : employeeRole;
    },
    get currentUser() {
      const isAdmin = window.location.pathname.startsWith('/admin') || 
                      window.location.pathname === '/login' || 
                      window.location.pathname === '/register' || 
                      window.location.pathname === '/forgot-password';
      return isAdmin ? adminUser : employeeUser;
    },
    adminAuth,
    employeeAuth,
    adminRole,
    employeeRole,
    isInitializing,
    login,
    employeeLogin,
    microsoftLogin,
    register,
    selectRole,
    logout,
    setCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
