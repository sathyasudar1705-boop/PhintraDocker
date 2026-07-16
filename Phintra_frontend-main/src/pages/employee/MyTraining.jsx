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
  ShieldCheck,
  ChevronDown
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
      {/* ── 1. Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
          borderRadius: '28px',
          padding: '44px 48px',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '32px',
          boxShadow: '0 12px 32px rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '180px'
        }}
        className="training-hero-banner"
      >
        {/* Background design elements */}
        <div style={{ position: 'absolute', right: '20%', top: '-30%', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)', filter: 'blur(30px)' }} />

        {/* Text Container aligned on the left */}
        <div style={{ maxWidth: '60%', position: 'relative', zIndex: 2, textAlign: 'left' }} className="training-hero-text">
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '950', 
            color: '#ffffff', 
            margin: '0 0 10px 0', 
            letterSpacing: '-0.01em',
            fontFamily: "'Fredoka', sans-serif",
            textShadow: '0 2px 0 rgba(0,0,0,0.15)'
          }}>
            Level Up Your Security Skills
          </h1>
          <p style={{ 
            fontSize: '15px', 
            color: 'rgba(255, 255, 255, 0.9)', 
            lineHeight: 1.6, 
            margin: '0 0 24px 0', 
            fontWeight: '500', 
            fontFamily: "'Inter', sans-serif" 
          }}>
            Complete trainings, earn XP, unlock badges, and protect your organization.
          </p>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const el = document.getElementById('popular-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              background: '#ffffff',
              color: '#6366f1',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              borderBottom: '4px solid #b0bec5',
              padding: '10px 28px',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: '900',
              fontFamily: "'Fredoka', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08), inset 0 2px 0 rgba(255,255,255,0.4)'
            }}
          >
            Explore Courses
          </motion.button>
        </div>

        {/* Right Mascot graphic positioned absolutely */}
        <div style={{
          position: 'absolute',
          right: '40px',
          bottom: '-10px',
          height: '240px',
          width: '240px',
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
              maxHeight: '100%', 
              maxWidth: '100%', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' 
            }} 
          />
        </div>
      </motion.div>

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
          
          {/* ── 2. Search & Toolbar Strip ── */}
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '12px 16px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.03)'
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
                  padding: '10px 16px 10px 54px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: '500',
                  outline: 'none',
                  color: '#0f172a',
                  fontFamily: "'Inter', sans-serif",
                  background: '#f8fafc',
                  transition: 'all 0.2s ease-in-out'
                }}
                className="search-bar-input"
              />
              <Search size={16} color="#6366f1" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {/* Dropdown status filter */}
            <div style={{ position: 'relative', minWidth: '160px' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 16px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#475569',
                  outline: 'none',
                  cursor: 'pointer',
                  background: '#ffffff',
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  transition: 'all 0.2s ease-in-out'
                }}
                className="search-filter-select"
              >
                <option value="All">All Courses</option>
                <option value="Not Started">Not Completed</option>
                <option value="Completed">Completed</option>
              </select>
              <ChevronDown size={14} color="#64748b" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>

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
              <div style={{ 
                background: '#ffffff', 
                padding: '44px 32px', 
                borderRadius: '24px', 
                border: '1px solid #f1f5f9', 
                textAlign: 'center', 
                color: '#64748b',
                boxShadow: '0 8px 30px rgba(99, 102, 241, 0.03)'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.05)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6366f1',
                  marginBottom: '16px'
                }}>
                  <BookOpen size={28} />
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontWeight: '900', color: '#0f172a', fontSize: '16px', fontFamily: "'Fredoka', sans-serif" }}>No courses match search</h4>
                <p style={{ margin: '0 0 24px 0', fontSize: '13px', fontFamily: "'Inter', sans-serif", color: '#64748b', lineHeight: 1.5, maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
                  We couldn't find any training modules matching your query. Try clearing your filters or search terms to see all available modules!
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStatusFilter('All')}
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      padding: '8px 20px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '800',
                      fontFamily: "'Fredoka', sans-serif",
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    Reset Filter
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('All');
                    }}
                    style={{
                      background: 'rgba(99, 102, 241, 0.08)',
                      color: '#6366f1',
                      border: '1px solid rgba(99, 102, 241, 0.15)',
                      padding: '8px 20px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '800',
                      fontFamily: "'Fredoka', sans-serif",
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    Browse All Trainings
                  </motion.button>
                </div>
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
          <motion.div 
            whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(99, 102, 241, 0.06)' }}
            style={{
              background: '#ffffff',
              border: '1px solid #f1f5f9',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.03)',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Fredoka', sans-serif" }}>
                <Trophy size={16} color="#fbbf24" fill="#fbbf24" /> Achievements
              </h3>
              {/* Fake Toggle Switch matching reference image */}
              <div style={{ width: '28px', height: '16px', background: '#6366f1', borderRadius: '99px', position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: '10px', height: '10px', background: '#ffffff', borderRadius: '50%', position: 'absolute', right: '3px', top: '3px' }} />
              </div>
            </div>
            
            <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 20px 0', fontWeight: '500', fontFamily: "'Inter', sans-serif" }}>
              Goal achieved! successes unlocked.
            </p>

            {/* List of achievements mapped from modules */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {modules.map((mod) => {
                const isCompleted = mod.status === 'completed';
                
                return (
                  <div key={`ach-${mod.id}`} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Circle Avatar */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isCompleted ? '#ecfdf5' : '#f8fafc',
                      border: `1.5px dashed ${isCompleted ? '#a7f3d0' : '#cbd5e1'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isCompleted ? (
                        <Award size={16} color="#10b981" />
                      ) : (
                        <Lock size={14} color="#64748b" />
                      )}
                    </div>

                    {/* Achievement Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '12px', fontWeight: '850', color: isCompleted ? '#0f172a' : '#475569', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Fredoka', sans-serif" }}>
                        {mod.title} Certification
                      </h4>
                      <p style={{ fontSize: '10px', color: isCompleted ? '#10b981' : '#94a3b8', margin: '2px 0 0 0', fontWeight: '600', fontFamily: "'Inter', sans-serif" }}>
                        {isCompleted ? 'Earned' : 'Locked'}
                      </p>
                    </div>
                  </div>
                );
              })}

              {modules.length === 0 && (
                <div style={{ textAlign: 'center', padding: '12px 0', fontSize: '12px', color: '#94a3b8', fontFamily: "'Inter', sans-serif" }}>
                  No courses assigned to unlock achievements.
                </div>
              )}
            </div>
          </motion.div>

          {/* Card 2: Recommended Badges (Best Sales) */}
          <motion.div 
            whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(99, 102, 241, 0.06)' }}
            style={{
              background: '#ffffff',
              border: '1px solid #f1f5f9',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.03)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', margin: 0, fontFamily: "'Fredoka', sans-serif" }}>
                Recommended Badges
              </h3>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#6366f1', cursor: 'pointer', fontFamily: "'Fredoka', sans-serif", letterSpacing: '0.05em' }}>
                VIEW ALL
              </span>
            </div>

            {/* List of recommended achievements */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                        flexShrink: 0,
                        border: '1px solid rgba(0,0,0,0.02)'
                      }}>
                        <BadgeIcon size={18} color={badge.color} />
                      </div>

                      {/* Badge Name & Rating */}
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ fontSize: '12px', fontWeight: '850', color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Fredoka', sans-serif" }}>
                          {badge.title}
                        </h4>
                        <p style={{ fontSize: '10px', color: '#fbbf24', margin: '2px 0 0 0', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px', fontFamily: "'Inter', sans-serif" }}>
                          ★ <span style={{ color: '#64748b' }}>{badge.rating}</span>
                        </p>
                      </div>
                    </div>

                    {/* View Button */}
                    <button
                      onClick={() => toast.info(`Badge details: ${badge.description}`)}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '99px',
                        background: 'rgba(99, 102, 241, 0.06)',
                        border: '1px solid rgba(99, 102, 241, 0.15)',
                        color: '#6366f1',
                        fontSize: '11px',
                        fontWeight: '800',
                        fontFamily: "'Fredoka', sans-serif",
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      View
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>

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
        .search-bar-input {
          padding-left: 54px !important;
        }
        .search-bar-input:focus {
          border-color: #6366f1 !important;
          background-color: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12) !important;
        }
        .search-bar-input:hover {
          border-color: #94a3b8 !important;
        }
        .search-filter-select:focus {
          border-color: #6366f1 !important;
          background-color: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12) !important;
        }
        .search-filter-select:hover {
          border-color: #94a3b8 !important;
        }

        @media (max-width: 1024px) {
          .training-main-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
        }
        @media (max-width: 768px) {
          .training-hero-banner {
            flex-direction: column !important;
            padding: 32px 24px !important;
            text-align: center !important;
            min-height: auto !important;
          }
          .training-hero-text {
            max-width: 100% !important;
            text-align: center !important;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-graphic-mascot {
            position: relative !important;
            right: auto !important;
            bottom: auto !important;
            margin-top: 24px !important;
            width: 180px !important;
            height: 180px !important;
          }
        }
      `}</style>

    </div>
  );
};

export default UserTraining;
