import React, { useState } from 'react';
import { Search, Newspaper, BookOpen, Clock, Calendar, ArrowRight, Eye } from 'lucide-react';
import Button from '../../components/common/Button';
import { awarenessArticles } from '../../data/dummyData';

const LearningFeed = () => {
  // Articles list
  const [articles] = useState(awarenessArticles);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Selected Article for Reading View Modal
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Categories list
  const categories = ['All', 'Phishing', 'Passwords', 'Email Safety', 'Social Engineering'];

  // Filtering Logic
  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          art.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || art.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Awareness News Feed</h1>
          <p>Read micro-learning updates, security advisories, and tips to protect your personal and work digital footprint.</p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="saas-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Search Field */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Search articles by title or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '6px', border: '1px solid var(--border-hover)', fontSize: '13px' }}
            />
            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', display: 'flex' }}>
              <Search size={16} />
            </div>
          </div>

        </div>
      </div>

      {/* Category Tabs */}
      <div className="saas-tabs" style={{ display: 'flex', gap: '12px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '4px' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: activeCategory === cat ? '1px solid var(--color-teal)' : '1px solid var(--border-hover)',
              backgroundColor: activeCategory === cat ? 'var(--color-teal-light)' : '#ffffff',
              color: activeCategory === cat ? 'var(--color-teal)' : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid list */}
      {filteredArticles.length === 0 ? (
        <div className="saas-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-light)' }}>
          <Newspaper size={48} style={{ color: 'var(--text-subtle)', marginBottom: '16px' }} />
          <h3>No articles found</h3>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Try searching in a different category or change keywords.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {filteredArticles.map((article) => (
            <div 
              key={article.id} 
              className="saas-card" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                padding: '24px',
                transition: 'transform 0.2s',
                backgroundColor: 'var(--bg-card)'
              }}
              className="article-feed-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ 
                  backgroundColor: 'var(--color-teal-light)', 
                  color: 'var(--color-teal)', 
                  padding: '4px 10px', 
                  borderRadius: '4px', 
                  fontSize: '11px',
                  fontWeight: '700'
                }}>
                  {article.category}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  {article.readTime}
                </span>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px', lineHeight: '1.4' }}>
                {article.title}
              </h3>
              
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '20px', flex: 1 }}>
                {article.summary}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--bg-sidebar)', paddingTop: '14px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} />
                  {article.date}
                </span>
                
                <button
                  onClick={() => setSelectedArticle(article)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--color-teal)',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  className="read-article-hover"
                >
                  Read Article
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reading Article Modal */}
      {selectedArticle && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div className="modal-content animate-fade-in" style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '680px',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ backgroundColor: 'var(--color-teal-light)', color: 'var(--color-teal)', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                  {selectedArticle.category}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  {selectedArticle.readTime} read
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>•</span>
                <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Published: {selectedArticle.date}</span>
              </div>
              <button 
                onClick={() => setSelectedArticle(null)}
                style={{ background: 'none', border: 'none', fontSize: '24px', color: 'var(--text-light)', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            {/* Title */}
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '16px', lineHeight: '1.3', flexShrink: 0 }}>
              {selectedArticle.title}
            </h2>

            {/* Article content scrollbox */}
            <div style={{ 
              overflowY: 'auto', 
              flex: 1, 
              paddingRight: '8px', 
              fontSize: '14px', 
              color: 'var(--text-muted)', 
              lineHeight: '1.7',
              borderTop: '1px solid var(--bg-sidebar)',
              paddingTop: '16px'
            }}>
              {/* Summary quote box */}
              <div style={{ 
                backgroundColor: 'var(--bg-main)', 
                borderLeft: '4px solid var(--color-teal)', 
                padding: '12px 16px', 
                borderRadius: '0 6px 6px 0', 
                fontWeight: '500',
                color: 'var(--text-muted)',
                marginBottom: '20px',
                fontSize: '13.5px'
              }}>
                {selectedArticle.summary}
              </div>

              {/* Body Text paragraphs */}
              {selectedArticle.content.split('\n\n').map((para, idx) => (
                <p key={idx} style={{ marginBottom: '14px', whiteSpace: 'pre-line' }}>{para}</p>
              ))}
            </div>

            {/* Footer buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--bg-sidebar)', paddingTop: '16px', flexShrink: 0 }}>
              <button
                onClick={() => setSelectedArticle(null)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--color-teal)',
                  color: '#ffffff',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Finished Reading
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Hover visual enhancements */}
      <style>{`
        .article-feed-card:hover {
          transform: translateY(-4px);
        }
        .read-article-hover:hover {
          color: var(--color-teal-hover) !important;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default LearningFeed;
