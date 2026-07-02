import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { AdminProtectedRoute, EmployeeProtectedRoute } from './ProtectedRoute';

// Layout Wrappers
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';
import UserLayout from '../layouts/UserLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import EmployeeLogin from '../pages/auth/EmployeeLogin';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Admin Portal Pages
import Dashboard from '../pages/admin/Dashboard';
import Campaigns from '../pages/admin/Campaigns';
import CreateCampaign from '../pages/admin/CreateCampaign';
import EmailTemplates from '../pages/admin/EmailTemplates';
import Employees from '../pages/admin/Employees';
import Departments from '../pages/admin/Departments';
import TrainingModules from '../pages/admin/TrainingModules';
import Quizzes from '../pages/admin/Quizzes';
import ReportedEmails from '../pages/admin/ReportedEmails';
import Analytics from '../pages/admin/Analytics';
import Leaderboard from '../pages/admin/Leaderboard';
import Settings from '../pages/admin/Settings';
import TemplateBuilder from '../pages/admin/TemplateBuilder';
import LandingPageBuilder from '../pages/admin/LandingPageBuilder';
import CampaignCalendar from '../pages/admin/CampaignCalendar';
import AuditLogs from '../pages/admin/AuditLogs';
import EmailLogs from '../pages/admin/EmailLogs';
import RolesPermissions from '../pages/admin/RolesPermissions';
import SecurityMaturity from '../pages/admin/SecurityMaturity';
import ExecutiveDashboard from '../pages/admin/ExecutiveDashboard';
import ThreatFeed from '../pages/admin/ThreatFeed';
import AwarenessBuilder from '../pages/admin/AwarenessBuilder';
import EmailSimulator from '../pages/admin/EmailSimulator';
import AwarenessInsights from '../pages/admin/AwarenessInsights';
import ManagerDashboard from '../pages/admin/ManagerDashboard';

// Employee / User Portal Pages
import Home from '../pages/employee/Home';
import MyTraining from '../pages/employee/MyTraining';
import Simulations from '../pages/employee/Simulations';
import ReportEmail from '../pages/employee/ReportEmail';
import MyProgress from '../pages/employee/MyProgress';
import Certificates from '../pages/employee/Certificates';
import HelpCenter from '../pages/employee/HelpCenter';
import Profile from '../pages/employee/Profile';
import LearningFeed from '../pages/employee/LearningFeed';
import ScenarioTraining from '../pages/employee/ScenarioTraining';
import RedFlagTraining from '../pages/employee/RedFlagTraining';
import LoginAwareness from '../pages/employee/LoginAwareness';
import LearningCenter from '../pages/employee/LearningCenter';
import Challenges from '../pages/employee/Challenges';
import SecurityJourney from '../pages/employee/SecurityJourney';
import KnowledgeHub from '../pages/employee/KnowledgeHub';
import ReportLandingPage from '../pages/employee/ReportLandingPage';
import UserLeaderboard from '../pages/employee/Leaderboard';
import MessageWithAdmin from '../pages/employee/MessageWithAdmin';
import EmployeeQuizzes from '../pages/employee/Quizzes';
import SupportMessages from '../pages/admin/SupportMessages';





const AdminRedirect = () => {
  const { userRole } = useAppContext();
  if (userRole === 'Security Manager') {
    return <Navigate to="/admin/manager-dashboard" replace />;
  }
  return <Navigate to="/admin/dashboard" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated, userRole } = useAppContext();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page for Phishing click tracking */}
        <Route path="/report/:track_id" element={<ReportLandingPage />} />
        


        {/* 1. Auth Routing */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />
          <Route path="/employee-login" element={<Navigate to="/user/login" replace />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/user/login" element={<EmployeeLogin />} />
          <Route path="/register" element={<Navigate to="/admin/login" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* 2. Admin Portal Routing */}
        <Route path="/admin" element={
          <AdminProtectedRoute allowedRoles={['Security Administrator', 'Security Manager']}>
            <AdminLayout />
          </AdminProtectedRoute>
        }>
          <Route index element={<AdminRedirect />} />
          <Route path="dashboard" element={
            <AdminProtectedRoute allowedRoles={['Security Administrator']}>
              <Dashboard />
            </AdminProtectedRoute>
          } />
          <Route path="manager-dashboard" element={
            <AdminProtectedRoute allowedRoles={['Security Manager']}>
              <ManagerDashboard />
            </AdminProtectedRoute>
          } />
          <Route path="executive-dashboard" element={<ExecutiveDashboard />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="create-campaign" element={<CreateCampaign />} />
          <Route path="email-templates" element={<EmailTemplates />} />
          <Route path="employees" element={<Employees />} />
          <Route path="departments" element={<Departments />} />
          <Route path="training-modules" element={<TrainingModules />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="reported-emails" element={<ReportedEmails />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="template-builder" element={<TemplateBuilder />} />
          <Route path="landing-builder" element={<LandingPageBuilder />} />
          <Route path="calendar" element={<CampaignCalendar />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="email-logs" element={<EmailLogs />} />
          <Route path="roles-permissions" element={<RolesPermissions />} />
          <Route path="security-maturity" element={<SecurityMaturity />} />
          <Route path="threat-feed" element={<ThreatFeed />} />
          <Route path="awareness-builder" element={<AwarenessBuilder />} />
          <Route path="email-simulator" element={<EmailSimulator />} />
          <Route path="support-messages" element={<SupportMessages />} />
          <Route path="awareness-insights" element={<AwarenessInsights />} />
        </Route>

        {/* 3. Employee Portal Routing */}
        <Route path="/user" element={<EmployeeProtectedRoute><UserLayout /></EmployeeProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Home />} />
          <Route path="home" element={<Navigate to="/user/dashboard" replace />} />
          <Route path="training" element={<MyTraining />} />
          <Route path="quizzes" element={<EmployeeQuizzes />} />
          <Route path="simulations" element={<Simulations />} />
          <Route path="report" element={<ReportEmail />} />
          <Route path="progress" element={<MyProgress />} />
          <Route path="leaderboard" element={<UserLeaderboard />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="help" element={<HelpCenter />} />
          <Route path="profile" element={<Profile />} />
          <Route path="learning-feed" element={<LearningFeed />} />
          <Route path="scenario-training" element={<ScenarioTraining />} />
          <Route path="red-flag-training" element={<RedFlagTraining />} />
          <Route path="login-awareness" element={<LoginAwareness />} />
          <Route path="learning-center" element={<LearningCenter />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="security-journey" element={<SecurityJourney />} />
          <Route path="knowledge-hub" element={<KnowledgeHub />} />
          <Route path="messages" element={<MessageWithAdmin />} />
</Route>
        {/* 4. Root Catch Redirect */}
        <Route path="/" element={
          isAuthenticated ? (
            userRole === 'Security Administrator' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : userRole === 'Security Manager' ? (
              <Navigate to="/admin/manager-dashboard" replace />
            ) : (
              <Navigate to="/user/dashboard" replace />
            )
          ) : (
            <Navigate to="/user/login" replace />
          )
        } />
        <Route path="*" element={<Navigate to="/user/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
