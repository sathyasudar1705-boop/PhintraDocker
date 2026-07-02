import React, { useState } from 'react';
import { Search, BookOpen, Clock, Award, Shield, CheckCircle2, ChevronRight, X } from 'lucide-react';
import Button from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';

const INITIAL_COURSES = [
  {
    id: 1,
    title: 'Phishing Fundamentals: Email Safety',
    category: 'Phishing',
    duration: '5 min',
    difficulty: 'Beginner',
    status: 'Completed',
    desc: 'Understand the basic structure of email fraud, generic greetings, and deceptive redirection links.',
    content: `Phishing is a cyber attack where attackers masquerade as trusted entities to steal sensitive information.

Key Email indicators:
1. Deceptive display domains (e.g., security-alert-office365.net instead of office.com).
2. Threatening or urgent calls-to-action ("Account deactivated in 30 minutes!").
3. Impersonal salutations and unexpected financial document requests.`
  },
  {
    id: 2,
    title: 'MFA & Advanced Credentials Policies',
    category: 'Authentication',
    duration: '8 min',
    difficulty: 'Intermediate',
    status: 'Not Started',
    desc: 'Discover why Multi-Factor Authentication is critical and how to spot MFA fatigue attacks.',
    content: `Multi-Factor Authentication (MFA) adds an extra layer of protection beyond passwords.

Understanding MFA Push Fatigue:
* Attackers flood your phone with auth notifications hoping you click "Approve" to stop the notifications.
* If you receive an unexpected authorization prompt, click "Deny" or "Report" immediately.
* Never share OTP authentication codes with anyone, even support agents.`
  },
  {
    id: 3,
    title: 'Secure Remote Work Practices',
    category: 'Remote Work',
    duration: '6 min',
    difficulty: 'Beginner',
    status: 'Not Started',
    desc: 'How to safely connect to office resources using VPNs, public hotspots, and home networks.',
    content: `Working remotely introduces different threat vectors compared to structured corporate environments.

Secure Behaviors:
1. Use Corporate VPN: Always route your internet connections through verified company access tunnels when using outside links.
2. Router Security: Ensure your home Wi-Fi utilizes WPA3 encryption with custom admin passwords.
3. Lock Screens: Lock device screens (Win+L) when leaving workspaces, even inside your residence.`
  },
  {
    id: 4,
    title: 'Social Engineering: Vishing & Smishing',
    category: 'Social Engineering',
    duration: '7 min',
    difficulty: 'Intermediate',
    status: 'Not Started',
    desc: 'Identify malicious SMS messages and fraud voice calls mimicking executive requests.',
    content: `Attackers bypass emails using mobile messages (Smishing) and voice calls (Vishing).

Tactics to check:
* Smishing SMS links: Often claim your bank account is locked or express package shipments are delayed.
* Vishing authority plays: Mock executives calling urgently requesting immediate gift card purchases or wire transfers.
* Action: Hang up and verify through verified channels (Slack/teams or corporate directories).`
  }
];

const LearningCenter = () => {
  const toast = useToast();
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openedCourse, setOpenedCourse] = useState(null);

  const handleComplete = (id) => {
    setCourses(courses.map(c => c.id === id ? { ...c, status: 'Completed' } : c));
    setOpenedCourse(null);
    toast.success('Course marked completed. Added +40 XP to your journey.');
  };

  const categories = ['All', 'Phishing', 'Authentication', 'Remote Work', 'Social Engineering'];

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'All' || c.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div>
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Security Learning Center</h1>
          <p>Browse educational lessons, micro-courses, and policies to sharpen your threat intelligence.</p>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="table-toolbar" style={{ gap: '20px', marginBottom: '24px' }}>
        <div className="table-filters" style={{ flexWrap: 'wrap', gap: '8px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <Search size={18} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search micro-courses..."
            style={{ paddingLeft: '38px', height: '38px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Courses Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {filteredCourses.map(course => (
          <div key={course.id} className="saas-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="badge badge-reported" style={{ fontSize: '11px', padding: '2px 8px' }}>
                {course.category}
              </span>
              <span className={`badge ${course.status === 'Completed' ? 'badge-passed' : 'badge-failed'}`} style={{ fontSize: '11px' }}>
                {course.status}
              </span>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px', lineHeight: '1.3' }}>
              {course.title}
            </h3>
            
            <p style={{ fontSize: '13px', color: 'var(--text-light)', flex: 1, lineHeight: '1.5', marginBottom: '20px' }}>
              {course.desc}
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--bg-sidebar)',
              paddingTop: '14px',
              fontSize: '12px',
              color: 'var(--text-subtle)'
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> {course.duration}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Award size={14} /> {course.difficulty}
                </span>
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ padding: '0 8px', color: 'var(--color-teal)' }}
                onClick={() => setOpenedCourse(course)}
              >
                Start Course
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}

        {filteredCourses.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state-icon">
              <BookOpen size={24} />
            </div>
            <h3>No courses found</h3>
            <p>No micro-lessons matched your query. Try resetting the filters or check your spelling.</p>
          </div>
        )}
      </div>

      {/* Reader Modal Drawer */}
      {openedCourse && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <span className="badge badge-reported" style={{ fontSize: '11px', marginBottom: '4px' }}>
                  {openedCourse.category}
                </span>
                <h2>{openedCourse.title}</h2>
              </div>
              <button onClick={() => setOpenedCourse(null)} className="close-btn" style={{ background: 'none', border: 'none' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ whiteSpace: 'pre-line', fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {openedCourse.content}
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setOpenedCourse(null)}
              >
                Close
              </button>
              
              {openedCourse.status !== 'Completed' && (
                <button
                  type="button"
                  className="btn btn-success"
                  style={{ backgroundColor: 'var(--color-success)' }}
                  onClick={() => handleComplete(openedCourse.id)}
                >
                  <CheckCircle2 size={16} />
                  Acknowledge Course Completion
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningCenter;
