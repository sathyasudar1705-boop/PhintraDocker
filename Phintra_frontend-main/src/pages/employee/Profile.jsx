import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useConfirm } from '../../hooks/useConfirm';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, CheckCircle2, AlertCircle, Edit, Building2, Bell, Globe, LogOut } from 'lucide-react';
import Button from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';
import { motion } from 'framer-motion';

const UserProfile = () => {
  const { currentUser, updateProfile, logout } = useAppContext();
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState(currentUser.name || 'Alex Chen');
  const [email, setEmail] = useState(currentUser.email || 'employee@phintra.com');
  const [dept, setDept] = useState(currentUser.department || 'Engineering');
  const [bio, setBio] = useState(currentUser.bio || 'Cybersecurity training participant.');

  // Password Fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Preferences
  const [emailAlerts, setEmailAlerts] = useState(currentUser.preferences?.emailAlerts ?? true);
  const [weeklyDigest, setWeeklyDigest] = useState(currentUser.preferences?.weeklyDigest ?? true);
  const [microsoftConnected, setMicrosoftConnected] = useState(false);
  const [lightMode, setLightMode] = useState(true);

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

  const handleSavePreferences = (e) => {
    e.preventDefault();
    updateProfile({
      preferences: {
        emailAlerts,
        weeklyDigest
      }
    });
    toast.success('Settings: Toggles and preferences updated!');
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
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>Portal Settings</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Supervise your personal credentials, workspace preferences, and security connection configurations.</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.8fr',
        gap: '32px',
        alignItems: 'start'
      }} className="responsive-profile-grid">
        
        {/* Left Section: Profile Overview & Microsoft Connection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Profile Card */}
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

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{currentUser.name}</h3>
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

            <div style={{
              borderTop: '1px solid #f1f5f9',
              paddingTop: '20px',
              marginTop: '20px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#64748b'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Department:</span>
                <strong style={{ color: '#0f172a' }}>{currentUser.department} Team</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Company Scope:</span>
                <strong style={{ color: '#0f172a' }}>{currentUser.companyName || 'Phintra Enterprise'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Security Standing:</span>
                <strong style={{ color: '#10b981' }}>Secure Verified</strong>
              </div>
            </div>

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

          {/* Microsoft Connected Account Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}
          >
            <h4 style={{ fontSize: '14px', fontWeight: '850', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={16} style={{ color: '#0078d4' }} /> Connected Accounts
            </h4>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', marginBottom: '16px', fontWeight: '500' }}>
              Link your portal account to Microsoft 365 for seamless single-sign-on access.
            </p>
            
            {microsoftConnected ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px 14px', borderRadius: '12px' }}>
                <span style={{ fontSize: '12.5px', color: '#047857', fontWeight: '800' }}>✓ Connected to Microsoft</span>
                <button onClick={() => setMicrosoftConnected(false)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: '850', cursor: 'pointer' }}>Disconnect</button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMicrosoftConnected(true);
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
              </button>
            )}
          </motion.div>
        </div>

        {/* Right Section: Preferences, Password Change, Logout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Preferences and Theme Toggles */}
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
            <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} style={{ color: '#2563eb' }} />
              Communication Settings
            </h3>
            
            <form onSubmit={handleSavePreferences}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    style={{ marginTop: '3px', width: '16px', height: '16px', borderRadius: '4px' }} 
                  />
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>Email Alerts</strong>
                    <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginTop: '2px', fontWeight: '600' }}>
                      Receive email alerts immediately when a new training course is assigned to you.
                    </span>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    style={{ marginTop: '3px', width: '16px', height: '16px', borderRadius: '4px' }} 
                  />
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>Weekly Security Digest</strong>
                    <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginTop: '2px', fontWeight: '600' }}>
                      Get a summary of security drills completed in the organization.
                    </span>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={lightMode}
                    onChange={(e) => {
                      setLightMode(e.target.checked);
                      toast.success(e.target.checked ? "Switched to Light Theme Mode" : "Switched to Dark Theme Mode");
                    }}
                    style={{ marginTop: '3px', width: '16px', height: '16px', borderRadius: '4px' }} 
                  />
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>Light Mode Display</strong>
                    <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginTop: '2px', fontWeight: '600' }}>
                      Toggle color theme preference between Light and Dark interface templates.
                    </span>
                  </div>
                </label>
              </div>

              <Button type="submit" variant="primary" size="sm" style={{ borderRadius: '10px', fontWeight: '750' }}>Save Preferences</Button>
            </form>
          </motion.div>

          {/* Change Password Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                style={{ borderRadius: '10px', fontWeight: '750' }}
              >
                Update Password
              </Button>
            </form>
          </motion.div>

          {/* Logout Action Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
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
              <h4 style={{ fontSize: '14px', fontWeight: '850', color: '#991b1b', margin: 0 }}>Log Out of Employee Portal</h4>
              <p style={{ fontSize: '11.5px', color: '#b91c1c', marginTop: '2px', fontWeight: '600' }}>Confirming this will end your current secure session.</p>
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
              <LogOut size={14} /> Log Out
            </button>
          </motion.div>

        </div>

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
