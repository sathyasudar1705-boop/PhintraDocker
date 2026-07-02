import React, { useState, useEffect } from 'react';
import { Search, Bookmark, BookmarkCheck, BookOpen, ExternalLink, X, Heart } from 'lucide-react';
import Button from '../../components/common/Button';

const ARTICLES = [
  {
    id: 1,
    title: 'Anatomy of Ransomware: Block and Prevent',
    category: 'Core Threat Guides',
    time: '4 min read',
    desc: 'How ransomware infects workstation memory drives and steps to prevent network-wide propagation.',
    body: `Ransomware is malicious software designed to block access to computer systems or encrypt data until a sum of money is paid.

How it enters:
* Unverified email attachments masquerading as invoices or package receipts.
* Compromised browser endpoints or mock login scripts.

Actions to prevent propagation:
1. Disconnect network cables: If your screen shows encryption prompts, unplug network cables immediately to block server propagation.
2. Alert Security Center: Reach out through secondary channels immediately. Do not attempt to reboot or run system recovery yourself.`
  },
  {
    id: 2,
    title: 'Internal Phishing Escalation Procedures',
    category: 'Internal Guides',
    time: '3 min read',
    desc: 'Step-by-step instructions on what happens behind the scenes when you report a suspicious email.',
    body: `When you click "Report Email", Phintra's security operations center executes the following sequence:

* Step 1: Sandbox Detonation. The email attachment is detonated in a secure sandbox to check for telemetry anomalies.
* Step 2: Global Domain Blocking. If confirmed malicious, the sender domain is blacklisted across all employee accounts within minutes.
* Step 3: Feedback. You receive a verification badge confirming whether the report was a simulation or a genuine threat.`
  },
  {
    id: 3,
    title: 'Mobile Phishing: SMS, WhatsApp, and Smishing',
    category: 'Core Threat Guides',
    time: '5 min read',
    desc: 'Understanding look-alike numbers, urgent delivery tracking texts, and authentication harvesting messages.',
    body: `Attackers have moved to personal SMS channels to bypass strict corporate mail filters.

Common SMS Scams:
1. Lookalike logistics alerts (FedEx/UPS/DHL claiming custom clearance fees).
2. CEO Authority Impersonation via SMS or messaging channels.
3. Bank balance verification links.

Vigilance Rule: Never click URLs in direct text messages. Always access banking and logistics portals through direct web browser search entries.`
  }
];

const KnowledgeHub = () => {
  const [search, setSearch] = useState('');
  const [bookmarks, setBookmarks] = useState({});
  const [openedArticle, setOpenedArticle] = useState(null);

  useEffect(() => {
    // Load bookmark state
    const saved = {};
    ARTICLES.forEach(art => {
      saved[art.id] = localStorage.getItem(`bookmark_art_${art.id}`) === 'true';
    });
    setBookmarks(saved);
  }, []);

  const toggleBookmark = (id, e) => {
    e.stopPropagation(); // Prevent opening modal
    const newVal = !bookmarks[id];
    setBookmarks(prev => ({ ...prev, [id]: newVal }));
    localStorage.setItem(`bookmark_art_${id}`, String(newVal));
  };

  const filteredArticles = ARTICLES.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(search.toLowerCase()) || 
                          art.desc.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div>
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Security Knowledge Directory</h1>
          <p>Read security reference manuals, threat breakdowns, and internal guidance documents.</p>
        </div>
      </div>

      {/* Toolbar Search */}
      <div className="table-toolbar" style={{ gap: '20px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
          <Search size={18} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search directory guides..."
            style={{ paddingLeft: '38px', height: '38px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Directory Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {filteredArticles.map(art => {
          const isBookmarked = bookmarks[art.id];
          return (
            <div 
              key={art.id} 
              className="saas-card" 
              onClick={() => setOpenedArticle(art)}
              style={{ display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge badge-reported" style={{ fontSize: '11px', padding: '2px 8px' }}>
                  {art.category}
                </span>
                <button
                  type="button"
                  onClick={(e) => toggleBookmark(art.id, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isBookmarked ? 'var(--color-danger)' : 'var(--text-subtle)',
                    transition: 'all 0.15s ease'
                  }}
                  title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                >
                  {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                </button>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px', lineHeight: '1.3' }}>
                {art.title}
              </h3>
              
              <p style={{ fontSize: '13px', color: 'var(--text-light)', flex: 1, lineHeight: '1.5', marginBottom: '20px' }}>
                {art.desc}
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
                <span>{art.time}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', fontWeight: '600' }}>
                  Read Article <ExternalLink size={14} />
                </span>
              </div>
            </div>
          );
        })}

        {filteredArticles.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state-icon">
              <BookOpen size={24} />
            </div>
            <h3>No articles found</h3>
            <p>No directory manuals matched your search parameters. Try a different query.</p>
          </div>
        )}
      </div>

      {/* Reader Modal Drawer */}
      {openedArticle && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <span className="badge badge-reported" style={{ fontSize: '11px', marginBottom: '4px' }}>
                  {openedArticle.category}
                </span>
                <h2>{openedArticle.title}</h2>
              </div>
              <button onClick={() => setOpenedArticle(null)} className="close-btn" style={{ background: 'none', border: 'none' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ whiteSpace: 'pre-line', fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {openedArticle.body}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={(e) => { toggleBookmark(openedArticle.id, e); }}
                style={{ color: bookmarks[openedArticle.id] ? 'var(--color-danger)' : 'var(--text-light)' }}
              >
                {bookmarks[openedArticle.id] ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                {bookmarks[openedArticle.id] ? 'Bookmarked' : 'Bookmark Guide'}
              </button>

              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setOpenedArticle(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeHub;
