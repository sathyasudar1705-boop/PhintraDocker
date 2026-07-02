import React, { useState, useEffect } from 'react';
import { X, Bell, ShieldAlert, CheckCircle, Brain, Target, MessageSquare } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const NotificationDrawer = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('All');
  const { notifications: rawNotifications, markNotificationAsRead, markAllNotificationsAsRead } = useAppContext();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatTime = (isoString) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getIconAndColor = (title) => {
    const t = title.toLowerCase();
    if (t.includes('critical') || t.includes('phishing threat') || t.includes('alert')) {
      return { icon: ShieldAlert, color: '#EF4444', type: 'Alert' };
    }
    if (t.includes('completed') || t.includes('training')) {
      return { icon: CheckCircle, color: '#10B981', type: 'Training' };
    }
    if (t.includes('ai') || t.includes('recommendation')) {
      return { icon: Brain, color: '#2563EB', type: 'AI' };
    }
    if (t.includes('campaign')) {
      return { icon: Target, color: '#0078D4', type: 'Campaign' };
    }
    return { icon: MessageSquare, color: '#F59E0B', type: 'Report' };
  };

  const getAvatarGradient = (title) => {
    const t = title.toLowerCase();
    if (t.includes('critical') || t.includes('phishing threat') || t.includes('alert')) {
      return {
        bg: 'linear-gradient(135deg, #FECACA 0%, #EF4444 100%)',
        initial: 'A',
        badgeBg: '#EF4444'
      };
    }
    if (t.includes('completed') || t.includes('training')) {
      return {
        bg: 'linear-gradient(135deg, #D1FAE5 0%, #10B981 100%)',
        initial: 'T',
        badgeBg: '#10B981'
      };
    }
    if (t.includes('ai') || t.includes('recommendation')) {
      return {
        bg: 'linear-gradient(135deg, #E0F2FE 0%, #2563EB 100%)',
        initial: 'AI',
        badgeBg: '#2563EB'
      };
    }
    if (t.includes('campaign')) {
      return {
        bg: 'linear-gradient(135deg, #E0F7FA 0%, #0078D4 100%)',
        initial: 'C',
        badgeBg: '#0078D4'
      };
    }
    return {
      bg: 'linear-gradient(135deg, #FFE8D6 0%, #F59E0B 100%)',
      initial: 'S',
      badgeBg: '#F59E0B'
    };
  };

  const notifications = (rawNotifications || []).map(n => {
    const meta = getIconAndColor(n.title);
    const grad = getAvatarGradient(n.title);
    
    // Parse actor / action from title
    let actor = "Security Alert";
    let actionText = n.title;
    
    if (n.title.toLowerCase().includes('critical phishing')) {
      actor = "Threat Intel";
      actionText = "detected a suspicious simulation click";
    } else if (n.title.toLowerCase().includes('training completed')) {
      actor = "Security Coach";
      actionText = "marked your training module as completed";
    } else if (n.title.toLowerCase().includes('campaign launched')) {
      actor = "Campaign Center";
      actionText = "launched a new simulation campaign";
    }

    return {
      id: n.id,
      actor,
      actionText,
      detailText: n.message,
      time: formatTime(n.created_at),
      read: n.is_read,
      icon: meta.icon,
      avatarGrad: grad.bg,
      avatarInitial: grad.initial,
      badgeBg: grad.badgeBg
    };
  });

  const handleNotificationClick = (n) => {
    if (!n.read) {
      markNotificationAsRead(n.id);
    }
  };

  const markAllAsRead = () => {
    markAllNotificationsAsRead();
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatActionText = (text) => {
    if (!text) return '';
    // Bold specific keyword targets (e.g. after 'on ', 'edit ', 'as ')
    const triggers = ['on ', 'edit ', 'as '];
    for (const trigger of triggers) {
      if (text.includes(trigger)) {
        const parts = text.split(trigger);
        return (
          <span>
            {parts[0]}{trigger}<strong>{parts.slice(1).join(trigger)}</strong>
          </span>
        );
      }
    }
    return <span>{text}</span>;
  };

  return (
    <div 
      className="modal-overlay" 
      style={{ 
        backgroundColor: 'rgba(15, 23, 42, 0.05)', 
        zIndex: 1000 
      }} 
      onClick={onClose}
    >
      {/* Floating Popover Card */}
      <div 
        style={{ 
          position: 'fixed',
          top: '76px',
          right: '24px',
          width: 'calc(100vw - 48px)',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 120px)',
          zIndex: 1001,
          animation: 'fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Section */}
        <div style={{ 
          padding: '20px 24px 16px 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>Notifications</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* All / Unread Pills */}
            <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F3F4F6', padding: '3px', borderRadius: '20px' }}>
              {['All', 'Unread'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: activeTab === tab ? '#FFFFFF' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: activeTab === tab ? '#111827' : '#64748B',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    transition: 'all 0.15s ease',
                    boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button 
              onClick={onClose} 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', padding: 0 }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Notifications List Container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                style={{ 
                  padding: '16px 24px', 
                  borderBottom: '1px solid #F3F4F6',
                  display: 'flex', 
                  gap: '16px',
                  transition: 'background 0.2s',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => handleNotificationClick(notification)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFC'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {/* Custom Avatar with Initials and Lucide overlay badge */}
                <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
                  <div style={{
                    width: '40px', height: '40px',
                    borderRadius: '50%',
                    background: notification.avatarGrad,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#FFFFFF', fontWeight: '700', fontSize: '13px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    {notification.avatarInitial}
                  </div>
                  
                  {/* Badge overlay at bottom-right of avatar */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '16px', height: '16px',
                    borderRadius: '50%',
                    backgroundColor: notification.badgeBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px solid #FFFFFF',
                    color: '#FFFFFF'
                  }}>
                    <notification.icon size={9} strokeWidth={3} />
                  </div>
                </div>

                {/* Content Panel */}
                <div style={{ flex: 1, paddingRight: '12px' }}>
                  {/* Metadata Row: Actor + Time */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginBottom: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>
                      {notification.actor}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                      {notification.time}
                    </span>
                  </div>

                  {/* Action Description */}
                  <p style={{ fontSize: '13px', color: '#374151', margin: 0, lineHeight: '1.4' }}>
                    {formatActionText(notification.actionText)}
                  </p>

                  {/* Descriptive message detail */}
                  {notification.detailText && (
                    <p style={{
                      fontSize: '12px',
                      color: '#64748B',
                      marginTop: '6px',
                      lineHeight: '1.5',
                      margin: '6px 0 0 0'
                    }}>
                      {notification.detailText}
                    </p>
                  )}
                </div>

                {/* Unread indicator dot on the right side */}
                {!notification.read && (
                  <div style={{
                    width: '8px', height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    alignSelf: 'center',
                    flexShrink: 0
                  }} />
                )}
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ margin: '24px', border: 'none' }}>
              <div className="empty-state-icon" style={{ backgroundColor: '#F3F4F6', color: '#64748B' }}>
                <Bell size={28} />
              </div>
              <h3>All caught up!</h3>
              <p>You have no {activeTab === 'All' ? '' : activeTab.toLowerCase()} notifications.</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {unreadCount > 0 && (
          <div style={{ 
            padding: '12px 20px', 
            borderTop: '1px solid #F3F4F6', 
            display: 'flex', 
            justifyContent: 'flex-end', 
            backgroundColor: '#F9FAFB' 
          }}>
            <button 
              onClick={markAllAsRead} 
              style={{ 
                fontSize: '12px', 
                color: '#2563EB', 
                fontWeight: '600', 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer' 
              }}
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDrawer;
