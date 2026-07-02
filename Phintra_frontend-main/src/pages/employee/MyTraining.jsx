import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  BookOpen, 
  AlertCircle, 
  Play, 
  CheckCircle2, 
  ExternalLink, 
  Search, 
  Trophy, 
  Lock, 
  Key,
  ShieldAlert, 
  Award, 
  Laptop, 
  MailOpen, 
  Clock, 
  Sparkles, 
  ShieldCheck
} from 'lucide-react';
import Button from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';
import { useAppContext } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

// Asset Imports
import trainingMascotImg from '../../assets/training_mascot.png';
import stackOfBooksImg from '../../assets/stack_of_books_3d.png';

const UserTraining = () => {
  const toast = useToast();
  const { currentUser, certificates, fetchData } = useAppContext();
  
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [playingMod, setPlayingMod] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch employee modules
  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employee/training-modules');
      setModules(res.data);
    } catch (err) {
      setError('Failed to load training modules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  // Mark module as completed
  const handleMarkComplete = async (modId) => {
    try {
      await api.post(`/training-modules/${modId}/complete`);
      toast.success('Course completed! +100 XP awarded.');
      fetchModules();
      if (fetchData) fetchData();
    } catch (err) {
      toast.error('Failed to mark training as completed.');
    }
  };

  // Filter modules
  const filteredModules = modules.filter((mod) => {
    const matchesSearch = mod.title.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesStatus = true;
    if (statusFilter === 'Completed') matchesStatus = mod.status === 'completed';
    else if (statusFilter === 'Not Started') matchesStatus = mod.status === 'not_started';
    
    return matchesSearch && matchesStatus;
  });

  const getMediaUrl = (path) => {
    if (!path) return '';
    const base = api.defaults.baseURL || '';
    const host = base.endsWith('/api') ? base.substring(0, base.length - 4) : base;
    return `${host}${path}`;
  };

  const firstName = currentUser?.name?.split(' ')[0] || 'Agent';

  // Helper to assign a unique pastel theme to training cards
  const getCardTheme = (index) => {
    const themes = [
      {
        bg: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', // Pink
        color: '#db2777',
        icon: Laptop
      },
      {
        bg: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', // Sky Blue
        color: '#0284c7',
        icon: ShieldAlert
      },
      {
        bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', // Yellow
        color: '#d97706',
        icon: Key
      },
      {
        bg: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', // Indigo
        color: '#4939c8',
        icon: BookOpen
      },
      {
        bg: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', // Mint Green
        color: '#16a34a',
        icon: Award
      }
    ];
    return themes[index % themes.length];
  };

  // Static recommendations that match the Phintra game badges
  const recommendedBadges = [
    {
      id: 'badge-1',
      title: 'Zero Click Defender',
      rating: '4.9',
      category: 'Simulations',
      description: 'Pass 3 drills in a row without clicking links.',
      icon: ShieldCheck,
      color: '#10b981',
      bg: '#ecfdf5'
    },
    {
      id: 'badge-2',
      title: 'Vigilant Reporter',
      rating: '4.8',
      category: 'Email Security',
      description: 'Successfully report 3 phishing simulations.',
      icon: MailOpen,
      color: '#3b82f6',
      bg: '#eff6ff'
    },
    {
      id: 'badge-3',
      title: 'Security Champion',
      rating: '5.0',
      category: 'Academy',
      description: 'Score 90%+ on all core academic quizzes.',
      icon: Trophy,
      color: '#f59e0b',
      bg: '#fffbeb'
    }
  ];

  return (
    <div style={{ fontFamily: "'Inter', 'Outfit', sans-serif", maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* ── 1. Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #7c3aed 100%)',
          borderRadius: '24px',
          padding: '40px 48px',
          position: 'relative',
          overflow: 'visible',
          marginBottom: '32px',
          boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.35)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
        className="training-hero-banner"
      >
        {/* Text Container aligned on the left */}
        <div style={{ maxWidth: '540px', position: 'relative', zIndex: 2, textAlign: 'left' }} className="training-hero-text">
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Hi, {firstName}! 👋
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, margin: '0 0 20px 0', fontWeight: '500' }}>
            Welcome to Phintra Security Awareness Academy. Complete your assigned micro-modules, earn XP achievements, and protect your organization.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const el = document.getElementById('popular-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              background: '#ffffff',
              color: '#4f46e5',
              border: 'none',
              padding: '8px 24px',
              borderRadius: '99px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
            }}
          >
            Explore Courses
          </motion.button>
        </div>

        {/* Right Mascot graphic positioned absolutely */}
        <div style={{
          position: 'absolute',
          right: '32px',
          bottom: '-20px',
          height: '270px',
          width: '270px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 3
        }} className="hero-graphic-mascot">
          <img 
            src={trainingMascotImg} 
            alt="Mascot" 
            style={{ 
              maxHeight: '110%', 
              maxWidth: '110%', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 15px 30px rgba(99, 102, 241, 0.3)) drop-shadow(0 4px 10px rgba(0,0,0,0.15))' 
            }} 
          />
        </div>
      </motion.div>

      {/* ── 2. Search & Toolbar Strip ── */}
      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        background: '#ffffff',
        padding: '16px 20px',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)',
        marginBottom: '32px',
        maxWidth: '650px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Search training modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px 10px 42px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
              fontWeight: '500',
              outline: 'none',
              color: '#0f172a'
            }}
          />
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Dropdown status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            fontSize: '13px',
            fontWeight: '600',
            color: '#475569',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '150px',
            background: '#ffffff'
          }}
        >
          <option value="All">All Courses</option>
          <option value="Not Started">Not Completed</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {error && (
        <div style={{ background: '#fdf2f2', border: '1px solid #fca5a5', color: '#ef4444', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* ── 3. Main Two-Column Layout Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2.5fr) minmax(0, 1fr)',
        gap: '32px',
        alignItems: 'start'
      }} className="training-main-grid">
        
        {/* ── Left Column: Course Catalogs (Popular & Ongoing) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          
          {/* Section: Popular Courses */}
          <div id="popular-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                Popular
              </h2>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.05em', cursor: 'pointer', textTransform: 'uppercase' }}>
                View All
              </span>
            </div>

            {loading && modules.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontWeight: '600' }}>Loading courses...</div>
            ) : filteredModules.length === 0 ? (
              <div style={{ background: '#ffffff', padding: '36px', borderRadius: '24px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                <BookOpen size={40} color="#94a3b8" style={{ marginBottom: '12px' }} />
                <h4 style={{ margin: '0 0 4px 0', fontWeight: '800', color: '#0f172a' }}>No courses match search</h4>
                <p style={{ margin: 0, fontSize: '12px' }}>Try resetting filters or typing another query.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                gap: '20px'
              }}>
                {filteredModules.map((mod, index) => {
                  const theme = getCardTheme(index);
                  const Icon = theme.icon;
                  const isCompleted = mod.status === 'completed';
                  
                  return (
                    <motion.div
                      key={`pop-${mod.id}`}
                      whileHover={{ y: -6, boxShadow: '0 12px 24px -10px rgba(0,0,0,0.08)' }}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '20px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '270px',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.3s ease, border-color 0.3s ease'
                      }}
                      onClick={() => {
                        if (mod.video_url || mod.uploaded_video_url) {
                          setPlayingMod(mod);
                        } else {
                          handleMarkComplete(mod.id);
                        }
                      }}
                    >
                      <div>
                        {/* Course image area */}
                        <div style={{
                          borderRadius: '16px',
                          aspectRatio: '1.4 / 1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          background: theme.bg
                        }}>
                          <img
                            src={stackOfBooksImg}
                            alt="Course"
                            style={{
                              width: '80%',
                              height: '80%',
                              objectFit: 'contain',
                              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.12))'
                            }}
                          />
                          {isCompleted && (
                            <div style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              background: '#ffffff',
                              borderRadius: '50%',
                              padding: '2px',
                              display: 'flex'
                            }}>
                              <CheckCircle2 size={16} color="#10b981" fill="#10b981" />
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginTop: '14px', marginBottom: '4px', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {mod.title}
                        </h3>
                        {/* Subtitle description */}
                        <p style={{ fontSize: '11px', color: '#64748b', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                          {mod.description || 'Access and complete security awareness training module.'}
                        </p>
                      </div>

                      {/* Bottom Info Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={10} /> {mod.duration || '10 mins'}
                        </span>
                        
                        {/* Play/Complete Action indicator */}
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isCompleted ? '#ecfdf5' : '#eff6ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {isCompleted ? (
                            <CheckCircle2 size={14} color="#10b981" />
                          ) : (
                            <Play size={12} color="#3b82f6" fill="#3b82f6" style={{ marginLeft: '1px' }} />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Ongoing Courses */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                Ongoing
              </h2>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.05em', cursor: 'pointer', textTransform: 'uppercase' }}>
                View All
              </span>
            </div>

            {loading && modules.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontWeight: '600' }}>Loading courses...</div>
            ) : modules.filter(m => m.status !== 'completed').length === 0 ? (
              <div style={{ 
                background: '#ffffff', 
                border: '1px solid #e2e8f0', 
                borderRadius: '24px', 
                padding: '40px 24px', 
                textAlign: 'center',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)'
              }}>
                <Sparkles size={36} color="#fbbf24" style={{ marginBottom: '12px' }} />
                <h4 style={{ margin: '0 0 4px 0', fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>All caught up!</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  Outstanding! You've cleared all assigned coursework modules.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                gap: '20px'
              }}>
                {modules.filter(m => m.status !== 'completed').map((mod, index) => {
                  const theme = getCardTheme(index + 3); // Shift index for variety
                  const Icon = theme.icon;
                  const isInProgress = mod.status === 'in_progress';
                  
                  return (
                    <motion.div
                      key={`ong-${mod.id}`}
                      whileHover={{ y: -6, boxShadow: '0 12px 24px -10px rgba(0,0,0,0.08)' }}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '20px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '270px',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.3s ease, border-color 0.3s ease'
                      }}
                      onClick={() => {
                        if (mod.video_url || mod.uploaded_video_url) {
                          setPlayingMod(mod);
                        } else {
                          handleMarkComplete(mod.id);
                        }
                      }}
                    >
                      <div>
                        {/* Course image area */}
                        <div style={{
                          background: theme.bg,
                          borderRadius: '16px',
                          aspectRatio: '1.4 / 1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <img
                            src={stackOfBooksImg}
                            alt="Course"
                            style={{
                              width: '80%',
                              height: '80%',
                              objectFit: 'contain',
                              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.12))'
                            }}
                          />
                          {isInProgress && (
                            <div style={{
                              position: 'absolute',
                              bottom: '8px',
                              left: '8px',
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '99px',
                              padding: '2px 8px',
                              fontSize: '8px',
                              fontWeight: '800',
                              color: theme.color,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              In Progress
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginTop: '14px', marginBottom: '4px', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {mod.title}
                        </h3>
                        {/* Subtitle description */}
                        <p style={{ fontSize: '11px', color: '#64748b', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                          {mod.description || 'Access and complete security awareness training module.'}
                        </p>
                      </div>

                      {/* Bottom Info Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={10} /> {mod.duration || '10 mins'}
                        </span>
                        
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: '#eff6ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Play size={12} color="#3b82f6" fill="#3b82f6" style={{ marginLeft: '1px' }} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Achievements & Badges List Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Card 1: Unlocks Achievement */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={16} color="#fbbf24" fill="#fbbf24" /> Unlocks achievement
              </h3>
              {/* Fake Toggle Switch matching reference image */}
              <div style={{ width: '28px', height: '16px', background: '#3b82f6', borderRadius: '99px', position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: '10px', height: '10px', background: '#ffffff', borderRadius: '50%', position: 'absolute', right: '3px', top: '3px' }} />
              </div>
            </div>
            
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 20px 0', fontWeight: '500' }}>
              Goal achieved! successes unlocked.
            </p>

            {/* List of achievements mapped from modules */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {modules.map((mod) => {
                const isCompleted = mod.status === 'completed';
                
                return (
                  <div key={`ach-${mod.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Circle Avatar */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isCompleted ? '#ecfdf5' : '#f8fafc',
                      border: `1px dashed ${isCompleted ? '#a7f3d0' : '#cbd5e1'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isCompleted ? (
                        <Award size={16} color="#10b981" />
                      ) : (
                        <Lock size={14} color="#94a3b8" />
                      )}
                    </div>

                    {/* Achievement Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '12px', fontWeight: '800', color: isCompleted ? '#0f172a' : '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {mod.title} Certification
                      </h4>
                      <p style={{ fontSize: '10px', color: isCompleted ? '#10b981' : '#94a3b8', margin: '2px 0 0 0', fontWeight: '600' }}>
                        {isCompleted ? 'Earned' : 'Locked'}
                      </p>
                    </div>
                  </div>
                );
              })}

              {modules.length === 0 && (
                <div style={{ textAlign: 'center', padding: '12px 0', fontSize: '12px', color: '#94a3b8' }}>
                  No courses assigned to unlock achievements.
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Recommended Badges (Best Sales) */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Recommended Badges
              </h3>
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', cursor: 'pointer' }}>
                VIEW ALL
              </span>
            </div>

            {/* List of recommended achievements */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recommendedBadges.map((badge) => {
                const BadgeIcon = badge.icon;
                return (
                  <div key={badge.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      {/* Icon */}
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: badge.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <BadgeIcon size={18} color={badge.color} />
                      </div>

                      {/* Badge Name & Rating */}
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {badge.title}
                        </h4>
                        <p style={{ fontSize: '10px', color: '#fbbf24', margin: '2px 0 0 0', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          ★ <span style={{ color: '#64748b' }}>{badge.rating}</span>
                        </p>
                      </div>
                    </div>

                    {/* View Button */}
                    <button
                      onClick={() => toast.info(`Badge details: ${badge.description}`)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '99px',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        color: '#2563eb',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      View
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* ── 4. Video Player Modal (Framer Motion Overlay) ── */}
      <AnimatePresence>
        {playingMod && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            style={{ 
              zIndex: 1100, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              backgroundColor: 'rgba(15,23,42,0.4)', 
              backdropFilter: 'blur(4px)' 
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ 
                background: '#ffffff', 
                borderRadius: '24px', 
                padding: '24px', 
                maxWidth: '720px', 
                width: '100%', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                margin: '0 16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Watch: {playingMod.title}</h2>
                <button onClick={() => setPlayingMod(null)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 0 }}>&times;</button>
              </div>
              
              <div style={{ backgroundColor: '#000', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
                {playingMod.uploaded_video_url ? (
                  <video 
                    controls 
                    autoPlay
                    src={getMediaUrl(playingMod.uploaded_video_url)} 
                    style={{ width: '100%', display: 'block', maxHeight: '400px' }} 
                  />
                ) : playingMod.video_url ? (
                  <div style={{ position: 'relative', paddingTop: '56.25%', backgroundColor: '#000' }}>
                    {playingMod.video_url.includes('youtube.com') || playingMod.video_url.includes('youtu.be') ? (
                      <iframe 
                        src={playingMod.video_url.replace('watch?v=', 'embed/')} 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                        allowFullScreen
                        title={playingMod.title}
                      />
                    ) : (
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: '#fff', padding: '20px' }}>
                        <p style={{ marginBottom: '16px', fontSize: '14px' }}>External video requires redirect:</p>
                        <a 
                          href={playingMod.video_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ color: '#3b82f6', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', textDecoration: 'underline', fontWeight: '600' }}
                        >
                          Open External Link <ExternalLink size={16} />
                        </a>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Button variant="secondary" onClick={() => setPlayingMod(null)}>Close Video</Button>
                {playingMod.status !== 'completed' && (
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      handleMarkComplete(playingMod.id);
                      setPlayingMod(null);
                    }}
                  >
                    Mark Completed
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive stylesheet injected in layout */}
      <style>{`
        @media (max-width: 991px) {
          .training-main-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .hero-graphic-mascot {
            display: none !important;
          }
          .training-hero-banner {
            padding: 32px 24px !important;
            justify-content: center !important;
          }
          .training-hero-text {
            max-width: 100% !important;
            text-align: center !important;
          }
        }
      `}</style>

    </div>
  );
};

export default UserTraining;
