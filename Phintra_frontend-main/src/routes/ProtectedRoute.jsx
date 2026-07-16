import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── Loading screen shown during token validation on mount ──────────────────
const AuthLoadingScreen = () => (
  <div style={{
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', flexDirection: 'column', gap: '16px',
    backgroundColor: '#0f172a', color: '#94a3b8', fontFamily: 'sans-serif'
  }}>
    <div style={{
      width: '36px', height: '36px', borderRadius: '50%',
      border: '3px solid #1e293b', borderTopColor: '#06b6d4',
      animation: 'spin 0.8s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <span style={{ fontSize: '14px', fontWeight: '600' }}>Verifying session...</span>
  </div>
);

// ─── ADMIN PROTECTED ROUTE ──────────────────────────────────────────────────
// Security requirements:
//  • Requires adminAuth === true (not just localStorage)
//  • Requires role to be an admin role from backend JWT
//  • Employees with valid employee tokens are NOT allowed — they get redirected
//  • If allowedRoles specified, further restricts within admin roles
export const AdminProtectedRoute = ({ children, allowedRoles }) => {
  const { adminAuth, employeeAuth, adminRole, employeeRole, isInitializing } = useAuth();

  // Wait for initial token validation before making any routing decision,
  // unless we already have an active admin authentication state.
  if (isInitializing && !adminAuth) return <AuthLoadingScreen />;

  // Security: If user is authenticated as employee, redirect them to their portal.
  // Never allow employee tokens to access admin routes.
  if (!adminAuth && employeeAuth) {
    return <Navigate to="/user/dashboard" replace />;
  }

  // No admin auth at all — send to admin login
  if (!adminAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  // Security: Validate role is actually an admin role (from backend-sourced state)
  const isAdminRole = adminRole === 'Security Administrator' || adminRole === 'Security Manager';
  if (!isAdminRole) {
    // Token exists but role is not admin — clear and redirect
    return <Navigate to="/admin/login" replace />;
  }

  // If further role restriction is requested (e.g. only Security Administrator)
  if (allowedRoles && !allowedRoles.includes(adminRole)) {
    // Redirect to the appropriate admin sub-page for this role
    if (adminRole === 'Security Manager') {
      return <Navigate to="/admin/manager-dashboard" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

// ─── EMPLOYEE PROTECTED ROUTE ───────────────────────────────────────────────
// Security requirements:
//  • Requires employeeAuth === true (not just localStorage)
//  • Requires role === 'Employee' from backend JWT
//  • Admins with valid admin tokens are NOT allowed — they get redirected back
//  • Query token (?token=...) is handled by AuthContext on mount; here we just
//    show loading while that resolves
export const EmployeeProtectedRoute = ({ children }) => {
  const { adminAuth, employeeAuth, adminRole, employeeRole, isInitializing } = useAuth();

  // Wait for initial token validation, unless we already have active employee auth state.
  if (isInitializing && !employeeAuth) return <AuthLoadingScreen />;

  // Security: If user is authenticated as admin, redirect them to admin portal.
  // Admin tokens must NOT grant access to employee routes.
  if (!employeeAuth && adminAuth) {
    const redirectPath = adminRole === 'Security Manager' ? '/admin/manager-dashboard' : '/admin/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // No employee auth — send to employee login
  if (!employeeAuth) {
    return <Navigate to="/user/login" replace />;
  }

  // Security: Validate it's actually an Employee role from backend-sourced state
  if (employeeRole !== 'Employee') {
    return <Navigate to="/user/login" replace />;
  }

  return children;
};

// Backward-compatible default export
export default AdminProtectedRoute;
