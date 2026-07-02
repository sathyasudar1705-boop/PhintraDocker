import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Users, Send, Building2, FileText, AlertTriangle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommandPaletteModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Dummy global search results
  const allResults = [
    { id: 1, type: 'Employee', title: 'John Doe', subtitle: 'Engineering Dept', icon: Users, path: '/admin/employees' },
    { id: 2, type: 'Campaign', title: 'Q3 Phishing Simulation', subtitle: 'Active - 500 users', icon: Send, path: '/admin/campaigns' },
    { id: 3, type: 'Department', title: 'Finance', subtitle: 'Risk Level: High', icon: Building2, path: '/admin/departments' },
    { id: 4, type: 'Template', title: 'Urgent Password Reset', subtitle: 'Click Rate: 12%', icon: FileText, path: '/admin/templates' },
    { id: 5, type: 'Threat', title: 'Suspicious Login Attempt', subtitle: 'Severity: High', icon: AlertTriangle, path: '/admin/threat-feed' },
    { id: 6, type: 'Employee', title: 'Jane Smith', subtitle: 'HR Dept', icon: Users, path: '/admin/employees' },
    { id: 7, type: 'Campaign', title: 'Holiday Security Awareness', subtitle: 'Draft', icon: Send, path: '/admin/campaigns' },
  ];

  const filteredResults = searchQuery.trim() === '' 
    ? allResults.slice(0, 4) // Show recent/suggested if empty
    : allResults.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.type.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ alignItems: 'flex-start', paddingTop: '10vh' }} onClick={onClose}>
      <div 
        className="modal-content animate-fade-in" 
        style={{ maxWidth: '650px', borderRadius: '12px', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '16px 24px', 
          borderBottom: '1px solid var(--border-color)',
          gap: '12px'
        }}>
          <Search size={22} color="var(--text-light)" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search employees, campaigns, departments..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              color: 'var(--text-main)',
              background: 'transparent'
            }}
          />
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '12px', 
            color: 'var(--text-subtle)',
            backgroundColor: 'var(--bg-sidebar)',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            <span>ESC</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-light)', marginLeft: '8px' }}>
            <X size={20} />
          </button>
        </div>
        
        <div style={{ padding: '16px 0', maxHeight: '400px', overflowY: 'auto' }}>
          <div style={{ padding: '0 24px', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
            {searchQuery.trim() === '' ? 'Suggested Searches' : 'Search Results'}
          </div>
          
          {filteredResults.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredResults.map((result) => (
                <div 
                  key={result.id}
                  onClick={() => handleSelect(result.path)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '12px 24px', 
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    borderLeft: '2px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-main)';
                    e.currentTarget.style.borderLeftColor = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderLeftColor = 'transparent';
                  }}
                >
                  <div style={{ 
                    width: '36px', height: '36px', 
                    borderRadius: '8px', 
                    backgroundColor: 'var(--color-primary-light)', 
                    color: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginRight: '16px'
                  }}>
                    <result.icon size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{result.title}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>• {result.type}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>{result.subtitle}</div>
                  </div>
                  <ChevronRight size={18} color="var(--text-subtle)" />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '32px 24px', border: 'none' }}>
              <div className="empty-state-icon">
                <Search size={32} />
              </div>
              <h3>No results found</h3>
              <p>We couldn't find anything matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPaletteModal;
