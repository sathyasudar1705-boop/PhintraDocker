import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useConfirm } from '../../hooks/useConfirm';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Shield, CheckCircle2, AlertCircle, Edit, Building2, 
  Bell, Globe, LogOut, Trophy, Zap, Flame, Award, Clock, CheckSquare, 
  Key, Laptop, Sparkles, CreditCard, ChevronRight, TrendingUp, ShieldCheck, 
  Download, ExternalLink, RefreshCw, Smartphone, BookOpen, ShieldAlert
} from 'lucide-react';
import Button from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';

// Premium Toggle Switch Component
const ToggleSwitch = ({ checked, onChange }) => (
  <div 
    onClick={() => onChange(!checked)}
    style={{
      width: '42px',
      height: '24px',
      borderRadius: '99px',
      backgroundColor: checked ? '#2563eb' : '#cbd5e1',
      padding: '3px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: checked ? 'flex-end' : 'flex-start',
      transition: 'background-color 0.2s',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
    }}
  >
    <motion.div 
      layout
      style={{
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
      }}
    />
  </div>
);

// Premium Circular Progress Ring
const SecurityScoreRing = ({ score }) => {
  const radius = 64;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#f1f5f9"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={score > 80 ? '#10b981' : score > 50 ? '#fbbf24' : '#ef4444'}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ 
            strokeDashoffset, 
            transition: 'stroke-dashoffset 0.5s ease-in-out', 
            transform: 'rotate(-90deg)', 
            transformOrigin: '50% 50%' 
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '20px', fontWeight: '950', color: '#0f172a', fontFamily: "'Fredoka', sans-serif" }}>
          {score}%
        </span>
        <span style={{ fontSize: '9px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {score > 80 ? 'Excellent' : score > 50 ? 'Moderate' : 'Risky'}
        </span>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const { currentUser, updateProfile, logout, certificates = [] } = useAppContext();
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState(currentUser.name || 'Alex Chen');
  const [email, setEmail] = useState(currentUser.email || 'employee@phintra.com');
  const [dept, setDept] = useState(currentUser.department || 'Security Operations');
  const [bio, setBio] = useState(currentUser.bio || 'Cybersecurity training participant.');

  // Password Fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Daily goals state
  const [goals, setGoals] = useState([
    { id: 1, label: 'Complete Assigned Training Module (+100 XP)', completed: true },
    { id: 2, label: 'Attempt Security Awareness Quiz (+50 XP)', completed: false },
    { id: 3, label: 'Report Simulation/Suspicious Email (+50 XP)', completed: true }
  ]);

  // MS Account Sync mock state
  const [msConnected, setMsConnected] = useState(true);
  const [msSyncing, setMsSyncing] = useState(false);
  const [msLastSync, setMsLastSync] = useState('5 minutes ago');

  // Security rotating tips
  const tips = [
    { title: "MFA Authentication", text: "Enable Multi-Factor Authentication (MFA) on all portal logins to restrict credential theft attacks.", icon: Key },
    { title: "Sender Verification", text: "Always verify the sender's domain address in Outlook before opening links or downloading assets.", icon: Mail },
    { title: "Workstation Hygiene", text: "Press Win + L (Cmd + Ctrl + Q on Mac) to lock your computer screens whenever leaving your desk.", icon: Laptop },
    { title: "Safe Password Reuse", text: "Never reuse enterprise database credentials for personal software or public accounts.", icon: ShieldCheck }
  ];
  const [activeTipIndex, setActiveTipIndex] = useState(0);

  // Notification Toggles state
  const [notifTraining, setNotifTraining] = useState(true);
  const [notifCampaigns, setNotifCampaigns] = useState(true);
  const [notifLeaderboard, setNotifLeaderboard] = useState(false);
  const [notifBadges, setNotifBadges] = useState(true);
  const [notifDigest, setNotifDigest] = useState(currentUser.preferences?.weeklyDigest ?? true);
  const [notifMonthly, setNotifMonthly] = useState(true);
  const [notifAlerts, setNotifAlerts] = useState(currentUser.preferences?.emailAlerts ?? true);

  // Helper: calculate XP progression
  const getLevelInfo = (xp) => {
    if (xp < 100) return { level: 1, current: xp, target: 100, remaining: 100 - xp };
    if (xp < 250) return { level: 2, current: xp - 100, target: 150, remaining: 250 - xp };
    if (xp < 500) return { level: 3, current: xp - 250, target: 250, remaining: 500 - xp };
    if (xp < 800) return { level: 4, current: xp - 500, target: 300, remaining: 800 - xp };
    if (xp < 1200) return { level: 5, current: xp - 800, target: 400, remaining: 1200 - xp };
    const base = xp - 1200;
    const extraLevels = Math.floor(base / 500);
    const currentLevel = 6 + extraLevels;
    const currentXpInLevel = base % 500;
    return { level: currentLevel, current: currentXpInLevel, target: 500, remaining: 500 - currentXpInLevel };
  };

  const levelInfo = getLevelInfo(currentUser.xp || 0);
  const xpPercent = Math.min(100, (levelInfo.current / levelInfo.target) * 100);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;

    updateProfile({
      name,
      email,
      department: dept,
      bio
    });

    toast.success('Settings: Profile details updated successfully!');
    setShowEditModal(false);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please complete all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Settings: Password successfully changed!');
    }, 800);
  };

  const handleSyncMicrosoft = () => {
    setMsSyncing(true);
    setTimeout(() => {
      setMsSyncing(false);
      setMsLastSync('Just now');
      toast.success('Settings: Microsoft 365 Account state synchronized successfully!');
    }, 1200);
  };

  const toggleGoal = (id) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextState = !g.completed;
        if (nextState) {
          toast.success(`Completed Goal: ${g.label.split(' (+')[0]}!`);
        }
        return { ...g, completed: nextState };
      }
      return g;
    }));
  };

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Confirm Log Out',
      description: 'Are you sure you want to log out of the employee portal?',
      confirmText: 'Log Out',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      logout();
      navigate('/user/login');
    }
  };

  return (
    <div style={{ padding: '0 8px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      {/* Header */}
      <div className="saas-header" style={{ marginBottom: '32px' }}>
        <div className="saas-title-group">
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', fontFamily: "'Fredoka', sans-serif" }}>Portal Settings</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Supervise your personal credentials, workspace preferences, and security connection configurations.</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.35fr',
        gap: '32px',
        alignItems: 'start'
      }} className="responsive-profile-grid">
        
        {/* ========================================================
            LEFT COLUMN
            ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* 1. Profile Overview Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '32px 24px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}
          >
            <div style={{
              width: '76px',
              height: '76px',
              borderRadius: '24px',
              backgroundColor: '#eff6ff',
              border: '2px solid #2563eb',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              fontWeight: '800',
              margin: '0 auto 16px auto',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
            }}>
              <img 
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.name || 'John'}`}
                alt="Avatar" 
                style={{ width: '68px', height: '68px', objectFit: 'cover' }}
              />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', fontFamily: "'Fredoka', sans-serif" }}>{currentUser.name}</h3>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{currentUser.email}</span>
            
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              padding: '4px 12px',
              borderRadius: '99px',
              fontWeight: '800',
              marginTop: '10px'
            }}>
              {currentUser.role || 'Employee'}
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '16px', lineHeight: '1.5', fontStyle: 'italic', fontWeight: '500' }}>
              "{currentUser.bio || 'Cybersecurity training participant.'}"
            </p>

            <Button 
              variant="secondary"
              size="sm"
              icon={Edit}
              onClick={() => setShowEditModal(true)}
              style={{ width: '100%', marginTop: '24px', borderRadius: '12px', fontWeight: '750' }}
            >
              Edit Profile Details
            </Button>
          </motion.div>

          {/* 2. XP Progress Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}
          >
            <h4 style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Fredoka', sans-serif" }}>
              <Zap size={18} style={{ color: '#2563eb' }} /> XP Progression
            </h4>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>
              <span>Level {levelInfo.level}</span>
              <span>{currentUser.xp || 0} XP</span>
            </div>

            {/* Simulated premium progress bar */}
            <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '99px', overflow: 'hidden', margin: '12px 0', border: '1px solid #e2e8f0' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 0.8 }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '99px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
              <span>Next Level: {levelInfo.level * 500} XP</span>
              <strong style={{ color: '#2563eb' }}>{levelInfo.remaining} XP Remaining</strong>
            </div>
          </motion.div>

          {/* 3. Security Health Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '60%' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Fredoka', sans-serif" }}>
                <ShieldCheck size={18} style={{ color: '#10b981' }} /> Security Health
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4', margin: '6px 0 0 0', fontWeight: '500' }}>
                Your personal security score matches critical corporate safety metrics. Maintain high compliance.
              </p>
            </div>
            <SecurityScoreRing score={currentUser.securityScore || 95} />
          </motion.div>

          {/* 4. Employee Security Statistics Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}
          >
            <h4 style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Fredoka', sans-serif" }}>
              <Trophy size={18} style={{ color: '#fbbf24' }} /> Employee Security Stats
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <Zap size={16} style={{ color: '#2563eb' }} />
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '600' }}>Current Level</span>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>Level {levelInfo.level}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <TrendingUp size={16} style={{ color: '#0ea5e9' }} />
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '600' }}>Current XP</span>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>{currentUser.xp || 0} XP</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <Flame size={16} style={{ color: '#f97316' }} />
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '600' }}>Current Streak</span>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>{currentUser.streakDays || 0} Days 🔥</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <Award size={16} style={{ color: '#8b5cf6' }} />
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '600' }}>Best Streak</span>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>{currentUser.streakDays ? currentUser.streakDays + 5 : 5} Days</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <Trophy size={16} style={{ color: '#eab308' }} />
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '600' }}>Leaderboard Rank</span>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>#{currentUser.leaderboard_rank || 'N/A'} Place</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <ShieldCheck size={16} style={{ color: '#10b981' }} />
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '600' }}>Security Score</span>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>{currentUser.securityScore || 0}%</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <BookOpen size={16} style={{ color: '#6366f1' }} />
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '600' }}>Trainings Done</span>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>{currentUser.training_completed_count || 0} Modules</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <CheckCircle2 size={16} style={{ color: '#06b6d4' }} />
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '600' }}>Quizzes Done</span>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>{currentUser.quiz_completed_count || 0} Quizzes</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <Mail size={16} style={{ color: '#f43f5e' }} />
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '600' }}>Emails Reported</span>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>{currentUser.campaigns_reported || 0} Reports</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <Award size={16} style={{ color: '#ec4899' }} />
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '600' }}>Badges Earned</span>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>3 Earned</strong>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 5. Microsoft Account Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}
          >
            <h4 style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Fredoka', sans-serif" }}>
              <Globe size={18} style={{ color: '#0078d4' }} /> Microsoft 365 Connection
            </h4>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', marginBottom: '16px', fontWeight: '500' }}>
              Authentication status mappings for enterprise directory profiles and single sign-on access.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>SSO Status:</span>
                <span style={{ color: msConnected ? '#10b981' : '#ef4444', fontWeight: '800' }}>{msConnected ? '● Connected' : '○ Disconnected'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Directory User:</span>
                <strong style={{ color: '#0f172a' }}>{currentUser.email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Last Sync:</span>
                <strong style={{ color: '#64748b' }}>{msLastSync}</strong>
              </div>
            </div>
            
            {msConnected ? (
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button 
                  onClick={handleSyncMicrosoft} 
                  variant="secondary" 
                  size="sm" 
                  loading={msSyncing}
                  disabled={msSyncing}
                  style={{ flex: 1, borderRadius: '10px', fontSize: '12px', fontWeight: '750' }}
                >
                  <RefreshCw size={12} style={{ marginRight: '6px' }} /> Sync Now
                </Button>
                <Button 
                  onClick={() => {
                    setMsConnected(false);
                    toast.success('Microsoft account connection disconnected.');
                  }} 
                  variant="secondary" 
                  size="sm" 
                  style={{ borderRadius: '10px', fontSize: '12px', fontWeight: '750', color: '#ef4444' }}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => {
                  setMsConnected(true);
                  setMsLastSync('Just now');
                  toast.success("Successfully authenticated and connected with Microsoft 365 Account!");
                }}
                style={{
                  width: '100%',
                  background: '#0078d4',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  height: '38px',
                  fontWeight: '750',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0, 120, 212, 0.2)'
                }}
              >
                Connect Microsoft Account
              </Button>
            )}
          </motion.div>

          {/* 6. Organization Details Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}
          >
            <h4 style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Fredoka', sans-serif" }}>
              <Building2 size={18} style={{ color: '#6366f1' }} /> Organization Details
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Company Name:</span>
                <strong style={{ color: '#0f172a' }}>{currentUser.companyName || 'Systech USA'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Department Unit:</span>
                <strong style={{ color: '#0f172a' }}>{currentUser.department || 'Security Operations'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Reporting Manager:</span>
                <strong style={{ color: '#0f172a' }}>Sarah Jenkins (CISO)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Employee ID:</span>
                <strong style={{ color: '#475569', fontFamily: 'monospace' }}>{currentUser.employee_id ? currentUser.employee_id.substring(0, 8).toUpperCase() : 'EMP-98234'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Joined Date:</span>
                <strong style={{ color: '#0f172a' }}>Feb 15, 2026</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Employment Status:</span>
                <strong style={{ color: '#10b981' }}>Active Verified</strong>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ========================================================
            RIGHT COLUMN
            ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* 7. Profile Completion Status Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Fredoka', sans-serif" }}>
                <CheckSquare size={18} style={{ color: '#22c55e' }} /> Profile Setup Status
              </h4>
              <span style={{ fontSize: '12px', fontWeight: '850', color: '#22c55e', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '99px' }}>90% Complete</span>
            </div>

            {/* Mini Progress Bar */}
            <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '99px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ width: '90%', height: '100%', backgroundColor: '#22c55e', borderRadius: '99px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857' }}>
                <CheckCircle2 size={14} fill="#22c55e" color="#ffffff" />
                <span>Uploaded secure avatar photo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857' }}>
                <CheckCircle2 size={14} fill="#22c55e" color="#ffffff" />
                <span>Assigned department operations unit</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857' }}>
                <CheckCircle2 size={14} fill="#22c55e" color="#ffffff" />
                <span>Connected Microsoft 365 single sign-on</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857' }}>
                <CheckCircle2 size={14} fill="#22c55e" color="#ffffff" />
                <span>Strong master password verified</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #cbd5e1' }} />
                <span>Add secondary phone number (+10 XP)</span>
              </div>
            </div>
          </motion.div>

          {/* 8. Reward Wallet Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}
          >
            <h4 style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Fredoka', sans-serif" }}>
              <CreditCard size={18} style={{ color: '#0ea5e9' }} /> Rewards Wallet
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: '#f0f9ff', padding: '14px', borderRadius: '16px', border: '1px solid #e0f2fe' }}>
                <span style={{ fontSize: '11px', color: '#0369a1', display: 'block', fontWeight: '750' }}>Balance Coins</span>
                <strong style={{ fontSize: '20px', color: '#0284c7', fontFamily: "'Fredoka', sans-serif" }}>250 Phintra Coins</strong>
              </div>

              <div style={{ background: '#f5f3ff', padding: '14px', borderRadius: '16px', border: '1px solid #ede9fe' }}>
                <span style={{ fontSize: '11px', color: '#6d28d9', display: 'block', fontWeight: '750' }}>Redeemable Items</span>
                <strong style={{ fontSize: '20px', color: '#7c3aed', fontFamily: "'Fredoka', sans-serif" }}>2 Active Giftcards</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
              <span>Next reward unlocks at 350 Coins</span>
              <a href="#" onClick={(e) => { e.preventDefault(); toast.success('Redemption portal loading...'); }} style={{ color: '#2563eb', fontWeight: '800', display: 'flex', alignItems: 'center' }}>Redeem Store <ChevronRight size={12} /></a>
            </div>
          </motion.div>

          {/* 9. Notification Preferences */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Fredoka', sans-serif" }}>
              <Bell size={18} style={{ color: '#2563eb' }} />
              Communication Settings
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>Assigned Training Alerts</strong>
                  <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginTop: '2px', fontWeight: '600' }}>
                    Receive alerts immediately when a new training is assigned.
                  </span>
                </div>
                <ToggleSwitch checked={notifTraining} onChange={setNotifTraining} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>Simulation Campaign Reports</strong>
                  <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginTop: '2px', fontWeight: '600' }}>
                    Receive performance results after completing simulation runs.
                  </span>
                </div>
                <ToggleSwitch checked={notifCampaigns} onChange={setNotifCampaigns} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>Leaderboard Ranking Syncs</strong>
                  <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginTop: '2px', fontWeight: '600' }}>
                    Alert me when someone passes my position on the leaderboard.
                  </span>
                </div>
                <ToggleSwitch checked={notifLeaderboard} onChange={setNotifLeaderboard} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>Badge Achievement Unlocks</strong>
                  <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginTop: '2px', fontWeight: '600' }}>
                    Congratulate me via email when I unlock security achievements.
                  </span>
                </div>
                <ToggleSwitch checked={notifBadges} onChange={setNotifBadges} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>Weekly Security Digest</strong>
                  <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginTop: '2px', fontWeight: '600' }}>
                    Get weekly summaries of completed security runs.
                  </span>
                </div>
                <ToggleSwitch checked={notifDigest} onChange={setNotifDigest} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>Critical Security Alerts</strong>
                  <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginTop: '2px', fontWeight: '600' }}>
                    High-priority security updates sent directly to your workspace.
                  </span>
                </div>
                <ToggleSwitch checked={notifAlerts} onChange={setNotifAlerts} />
              </div>
            </div>

            <Button onClick={() => toast.success('Settings: Notification preferences saved successfully!')} variant="primary" size="sm" style={{ borderRadius: '10px', fontWeight: '750', width: '100%' }}>
              Save Preferences
            </Button>
          </motion.div>

          {/* 10. Change Password Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Fredoka', sans-serif" }}>
              <Shield size={18} style={{ color: '#0d9488' }} />
              Modify Password
            </h3>

            {passwordError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#fdf2f2',
                border: '1px solid #fca5a5',
                color: '#ef4444',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                marginBottom: '16px'
              }}>
                <AlertCircle size={16} />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ display: 'block', fontSize: '12.5px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>Old Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={loading}
                  style={{ height: '38px', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '8px 12px', width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }} className="responsive-profile-inputs">
                <div className="form-group">
                  <label className="form-label" style={{ display: 'block', fontSize: '12.5px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    style={{ height: '38px', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '8px 12px', width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'block', fontSize: '12.5px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    style={{ height: '38px', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '8px 12px', width: '100%' }}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                variant="secondary"
                size="sm"
                loading={loading}
                disabled={loading}
                style={{ borderRadius: '10px', fontWeight: '750', width: '100%' }}
              >
                Update Password
              </Button>
            </form>
          </motion.div>

          {/* 11. Login Activity Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}
          >
            <h4 style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Fredoka', sans-serif" }}>
              <Laptop size={18} style={{ color: '#475569' }} /> Secure Session Logs
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifySelf: 'start', gap: '12px', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <Smartphone size={16} style={{ color: '#2563eb' }} />
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '600' }}>Active Device Session</span>
                  <strong style={{ color: '#0f172a' }}>Chrome Browser on Windows OS (Current Session)</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifySelf: 'start', gap: '12px', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <Clock size={16} style={{ color: '#0ea5e9' }} />
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '600' }}>Login Timestamp</span>
                  <strong style={{ color: '#0f172a' }}>{new Date().toLocaleString()}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifySelf: 'start', gap: '12px', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <Globe size={16} style={{ color: '#10b981' }} />
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '600' }}>IP Location</span>
                  <strong style={{ color: '#0f172a' }}>117.195.42.108 (Chennai, India)</strong>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

      </div>

      {/* ========================================================
          BOTTOM FULL-WIDTH SECTION
          ======================================================== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '32px' }}>
        
        {/* Row: Streak Widget + Daily Goals Checklist + Tip Card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '32px'
        }} className="responsive-profile-grid">
          
          {/* 12. Streak Widget */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px'
            }}
          >
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Fredoka', sans-serif" }}>
                <Flame size={18} style={{ color: '#f97316' }} /> Active Streak
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4', margin: 0, fontWeight: '500' }}>
                Log in and interact with simulations daily to maintain your security standing.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '16px 0' }}>
              <span style={{ fontSize: '38px', fontWeight: '950', color: '#f97316', fontFamily: "'Fredoka', sans-serif" }}>{currentUser.streakDays || 0}</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#475569' }}>Days Active 🔥</span>
            </div>

            <div style={{ fontSize: '11px', color: '#f97316', fontWeight: '800', backgroundColor: '#fff7ed', padding: '8px 12px', borderRadius: '12px', border: '1px solid #ffedd5' }}>
              Keep your streak alive today to secure your bonus coins!
            </div>
          </motion.div>

          {/* 13. Daily Goals Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Fredoka', sans-serif" }}>
                  <CheckSquare size={18} style={{ color: '#6366f1' }} /> Today's Goals
                </h4>
                <span style={{ fontSize: '11.5px', fontWeight: '850', color: '#6366f1' }}>
                  {goals.filter(g => g.completed).length} / {goals.length} Completed
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {goals.map(goal => (
                  <label 
                    key={goal.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      fontSize: '11.5px', 
                      color: goal.completed ? '#64748b' : '#0f172a', 
                      cursor: 'pointer', 
                      textDecoration: goal.completed ? 'line-through' : 'none',
                      fontWeight: '600'
                    }}
                  >
                    <input 
                      type="checkbox" 
                      checked={goal.completed} 
                      onChange={() => toggleGoal(goal.id)}
                      style={{ width: '15px', height: '15px', borderRadius: '4px', cursor: 'pointer' }}
                    />
                    <span>{goal.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '99px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <div style={{ width: `${(goals.filter(g => g.completed).length / goals.length) * 100}%`, height: '100%', backgroundColor: '#6366f1', borderRadius: '99px', transition: 'width 0.3s' }} />
            </div>
          </motion.div>

          {/* 14. Security Tip Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px'
            }}
          >
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Fredoka', sans-serif" }}>
                <Sparkles size={18} style={{ color: '#a855f7' }} /> Security Tip of the Day
              </h4>
              <strong style={{ fontSize: '12.5px', color: '#0f172a', display: 'block', marginTop: '12px' }}>
                {tips[activeTipIndex].title}
              </strong>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', margin: '4px 0 0 0', fontWeight: '500' }}>
                {tips[activeTipIndex].text}
              </p>
            </div>

            <Button 
              onClick={() => setActiveTipIndex(prev => (prev + 1) % tips.length)}
              variant="secondary" 
              size="sm" 
              style={{ width: '100%', borderRadius: '10px', fontSize: '11px', fontWeight: '750' }}
            >
              Next Security Tip
            </Button>
          </motion.div>

        </div>

        {/* 15. Achievement Showcase (Recently Earned Badges) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Fredoka', sans-serif" }}>
              <Award size={18} style={{ color: '#fbbf24' }} /> Achievements Showcase
            </h4>
            <a href="#" onClick={(e) => { e.preventDefault(); toast.success('Badges modal loading...'); }} style={{ color: '#2563eb', fontSize: '12.5px', fontWeight: '800' }}>View All Badges</a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="responsive-profile-grid">
            <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
              <ShieldCheck size={28} style={{ color: '#22c55e' }} />
              <div>
                <strong style={{ fontSize: '12.5px', color: '#166534', display: 'block', fontFamily: "'Fredoka', sans-serif" }}>Human Firewall</strong>
                <span style={{ fontSize: '10px', color: '#15803d', fontWeight: '600' }}>All Trainings Done</span>
              </div>
            </div>

            <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
              <Flame size={28} style={{ color: '#f97316' }} />
              <div>
                <strong style={{ fontSize: '12.5px', color: '#9a3412', display: 'block', fontFamily: "'Fredoka', sans-serif" }}>Quick Reporter</strong>
                <span style={{ fontSize: '10px', color: '#c2410c', fontWeight: '600' }}>Reported under 10s</span>
              </div>
            </div>

            <div style={{ background: '#f5f3ff', border: '1px solid #ede9fe', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
              <Award size={28} style={{ color: '#7c3aed' }} />
              <div>
                <strong style={{ fontSize: '12.5px', color: '#5b21b6', display: 'block', fontFamily: "'Fredoka', sans-serif" }}>Cyber Guardian</strong>
                <span style={{ fontSize: '10px', color: '#6d28d9', fontWeight: '600' }}>Score &gt; 90% for 30d</span>
              </div>
            </div>

            <div style={{ background: '#fef3c7', border: '1px solid #fef3c7', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
              <Trophy size={28} style={{ color: '#d97706' }} />
              <div>
                <strong style={{ fontSize: '12.5px', color: '#92400e', display: 'block', fontFamily: "'Fredoka', sans-serif" }}>Security Champion</strong>
                <span style={{ fontSize: '10px', color: '#b45309', fontWeight: '600' }}>Earned 500+ XP</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 16. Certificates Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
          }}
        >
          <h4 style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Fredoka', sans-serif" }}>
            <Award size={18} style={{ color: '#10b981' }} /> Your Earned Certificates
          </h4>

          {certificates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '16px' }}>
              <ShieldAlert size={36} style={{ color: '#94a3b8', marginBottom: '12px' }} />
              <h5 style={{ fontSize: '14px', fontWeight: '800', color: '#475569', margin: '0 0 4px 0' }}>No Certificates Earned Yet</h5>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Complete assigned training modules to earn verified course completion certificates.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="responsive-profile-grid">
              {certificates.map(cert => (
                <div key={cert.id} style={{ border: '1px solid #e2e8f0', background: '#f8fafc', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <h5 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{cert.name}</h5>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px' }}>Course: {cert.courseName} | Earned: {cert.dateEarned}</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace', display: 'block', marginTop: '4px' }}>Verification Code: {cert.verification_code}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button onClick={() => toast.success(`Viewing certificate verification code: ${cert.verification_code}`)} variant="secondary" size="xs" style={{ flex: 1, borderRadius: '8px', fontSize: '11px', height: '28px' }}>
                      <ExternalLink size={10} style={{ marginRight: '4px' }} /> View
                    </Button>
                    <Button onClick={() => toast.success(`Starting PDF download process for ${cert.name}...`)} variant="secondary" size="xs" style={{ flex: 1, borderRadius: '8px', fontSize: '11px', height: '28px' }}>
                      <Download size={10} style={{ marginRight: '4px' }} /> Download PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* 17. Security Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
          }}
        >
          <h4 style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Fredoka', sans-serif" }}>
            <Clock size={18} style={{ color: '#475569' }} /> Security Activity Timeline
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '20px', borderLeft: '2px solid #e2e8f0' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-27px', top: '3px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2563eb', border: '3px solid #ffffff' }} />
              <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Attempted Daily Goals Security Quiz</strong>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Today, 2:30 PM</span>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-27px', top: '3px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981', border: '3px solid #ffffff' }} />
              <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Reported Suspicious Campaign Email</strong>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Yesterday, 10:15 AM</span>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-27px', top: '3px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#a855f7', border: '3px solid #ffffff' }} />
              <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Unlocked Badge: Human Firewall</strong>
              <span style={{ fontSize: '11px', color: '#64748b' }}>3 days ago, 4:45 PM</span>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-27px', top: '3px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3b82f6', border: '3px solid #ffffff' }} />
              <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Completed Course: Phishing Foundations</strong>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Last Week, Monday</span>
            </div>
          </div>
        </motion.div>

        {/* 18. Logout Alert Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#fdf2f2',
            border: '1px solid #fde2e2',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '850', color: '#991b1b', margin: 0, fontFamily: "'Fredoka', sans-serif" }}>Secure Portal Sign-out</h4>
            <p style={{ fontSize: '11.5px', color: '#b91c1c', marginTop: '2px', fontWeight: '600' }}>You are securely signed in. Confirming this action will destroy current tokens.</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: '750',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
            }}
          >
            <LogOut size={14} /> Sign Out Securely
          </button>
        </motion.div>

      </div>

      {/* Profile Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px', maxWidth: '480px', width: '100%', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Edit Profile</h2>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ height: '38px', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '8px 12px', width: '100%' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>Work Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ height: '38px', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '8px 12px', width: '100%' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>Department Assign</label>
                  <select
                    className="form-control"
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    style={{ height: '38px', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '8px 12px', width: '100%', fontWeight: '600', color: '#475569' }}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>Profile Bio</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    style={{ borderRadius: '10px', border: '1px solid #e2e8f0', padding: '12px', width: '100%', lineHeight: '1.5' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
