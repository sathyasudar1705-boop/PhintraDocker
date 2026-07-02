import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Search, Mail, Plus, Eye, AlertCircle, Edit3, Trash2, Info, Copy, CheckSquare } from 'lucide-react';
import Button from '../../components/common/Button';

const EmailTemplates = () => {
  const navigate = useNavigate();
  const { emailTemplates, addTemplate, editTemplate, cloneTemplate, deleteTemplate } = useAppContext();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Modal States
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // Form Fields for new template
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Credential Theft');
  const [newDifficulty, setNewDifficulty] = useState('Medium');
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newSenderName, setNewSenderName] = useState('System Notification');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Extract unique categories
  const categories = ['All', 'Credential Theft', 'Urgent Action', 'Suspicious Link'];

  // Filtered Templates
  const filteredTemplates = (emailTemplates || []).filter((temp) => {
    const matchesSearch = temp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          temp.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || temp.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const [cloningId, setCloningId] = useState(null);

  const handleCloneAndEdit = async (templateId) => {
    try {
      setCloningId(templateId);
      const clonedTemplate = await cloneTemplate(templateId);
      const mappedCloned = {
        id: clonedTemplate.id,
        name: clonedTemplate.template_name || clonedTemplate.title || "",
        subject: clonedTemplate.subject || "",
        body: clonedTemplate.body_html || "",
        body_html: clonedTemplate.body_html || "",
        body_text: clonedTemplate.body_text || "",
        category: clonedTemplate.category || "Credential Theft",
        difficulty: clonedTemplate.difficulty || "Medium",
        sender_name: clonedTemplate.sender_display_name || clonedTemplate.sender_name || "System Notification",
        sender_email: clonedTemplate.sender_email || "",
        is_system_template: clonedTemplate.is_system_template
      };
      navigate('/admin/template-builder', { state: { template: mappedCloned, mode: 'edit' } });
    } catch (err) {
      console.error("Failed to clone template:", err);
      alert("Failed to clone template. Spoofing domain checks may have blocked cloning system templates with invalid configurations.");
    } finally {
      setCloningId(null);
    }
  };

  const handleOpenEdit = (template) => {
    setEditingTemplate(template);
    setNewName(template.name);
    setNewCategory(template.category);
    setNewDifficulty(template.difficulty);
    setNewSubject(template.subject);
    setNewBody(template.body);
    setNewSenderName(template.sender_name || 'System Notification');
    setShowCreateModal(true);
  };

  const handleDeleteTemplate = async (id) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await deleteTemplate(id);
      } catch (err) {
        console.error(err);
        alert("Failed to delete template");
      }
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setEditingTemplate(null);
    setNewName('');
    setNewSubject('');
    setNewBody('');
    setNewSenderName('System Notification');
    setCreateError('');
    setCreateSuccess('');
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (!newName || !newSubject || !newBody) {
      setCreateError('Please complete all required fields.');
      return;
    }

    try {
      setSaving(true);
      if (editingTemplate) {
        await editTemplate(editingTemplate.id, {
          name: newName,
          category: newCategory,
          difficulty: newDifficulty,
          subject: newSubject,
          body: newBody,
          sender_name: newSenderName
        });
        setCreateSuccess('Template updated successfully!');
      } else {
        await addTemplate({
          name: newName,
          category: newCategory,
          difficulty: newDifficulty,
          subject: newSubject,
          body: newBody,
          sender_name: newSenderName
        });
        setCreateSuccess('Template created successfully!');
      }

      setTimeout(() => {
        handleCloseCreateModal();
      }, 1000);
    } catch (err) {
      let errorMsg = 'Failed to save template.';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', ');
        } else if (typeof err.response.data.detail === 'string') {
          errorMsg = err.response.data.detail;
        } else {
          errorMsg = JSON.stringify(err.response.data.detail);
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      setCreateError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Phishing Email Templates</h1>
          <p>Browse, preview, and build simulated email layouts to test corporate phishing defenses.</p>
        </div>
        <Button 
          onClick={() => navigate('/admin/template-builder', { state: { mode: 'create' } })}
          variant="primary"
          icon={Plus}
        >
          Create Template
        </Button>
      </div>

      {/* Search Toolbar */}
      <div className="saas-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Search field */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search templates by name or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', display: 'flex' }}>
              <Search size={16} />
            </div>
          </div>

        </div>
      </div>

      {/* Category Tabs */}
      <div className="saas-tabs" style={{ marginBottom: '28px' }}>
        {categories.map((cat) => (
          <div
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`saas-tab ${activeCategory === cat ? 'active' : ''}`}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="saas-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-light)' }}>
          <Mail size={48} style={{ color: 'var(--text-subtle)', marginBottom: '16px' }} />
          <h3>No templates found</h3>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Try searching in a different category or create a custom email template.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {filteredTemplates.map((template) => (
            <div key={template.id} className="saas-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span className="badge badge-reported" style={{ fontSize: '11px' }}>{template.category}</span>
                <span className={`badge badge-${template.difficulty.toLowerCase()}`} style={{ fontSize: '11px' }}>
                  {template.difficulty} Lvl
                </span>
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>{template.name}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '500', marginBottom: '12px' }}>
                Subject: <strong style={{ color: 'var(--text-muted)' }}>{template.subject}</strong>
              </p>
              
              <div style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '12px',
                fontSize: '12px',
                color: 'var(--text-light)',
                lineHeight: '1.5',
                flex: 1,
                fontFamily: 'monospace',
                marginBottom: '16px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}>
                {template.preview || template.body?.slice(0, 100) + '...'}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'auto' }}>
                <Button 
                  onClick={() => setSelectedTemplate(template)}
                  variant="outline"
                  size="sm"
                  icon={Eye}
                  style={{ flex: 1, minWidth: '70px' }}
                >
                  Preview
                </Button>
                <Button 
                  onClick={() => navigate('/admin/template-builder', { state: { template, mode: 'use' } })}
                  variant="secondary"
                  size="sm"
                  icon={CheckSquare}
                  style={{ flex: 1, minWidth: '95px' }}
                >
                  Use Template
                </Button>
                <Button 
                  onClick={() => handleCloneAndEdit(template.id)}
                  variant="secondary"
                  size="sm"
                  icon={Copy}
                  disabled={cloningId === template.id}
                  style={{ flex: 1, minWidth: '100px' }}
                >
                  {cloningId === template.id ? '...' : 'Clone & Edit'}
                </Button>
                
                {!template.is_system_template && (
                  <Button 
                    onClick={() => navigate('/admin/template-builder', { state: { template, mode: 'edit' } })}
                    variant="outline"
                    size="sm"
                    icon={Edit3}
                    style={{ minWidth: '36px' }}
                  />
                )}
                
                {!template.is_system_template && (
                  <Button 
                    onClick={() => handleDeleteTemplate(template.id)}
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    style={{ minWidth: '36px' }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1. Preview Modal */}
      {selectedTemplate && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h2>Template Email Blueprint</h2>
              <button onClick={() => setSelectedTemplate(null)} className="close-btn">&times;</button>
            </div>
            
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{selectedTemplate.name}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Category: {selectedTemplate.category} | Difficulty: {selectedTemplate.difficulty}</span>
                </div>
              </div>

              {/* Fake Email client mock box */}
              <div style={{
                border: '1px solid var(--border-hover)',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
              }}>
                <div style={{
                  backgroundColor: 'var(--bg-sidebar)',
                  borderBottom: '1px solid var(--border-hover)',
                  padding: '12px 16px',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-subtle)' }}>From:</span> {selectedTemplate.sender_name || 'System Notification'} &lt;lure@phintra-sim.com&gt;
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-subtle)' }}>Subject:</span> <strong style={{ color: 'var(--text-main)' }}>{selectedTemplate.subject}</strong>
                  </div>
                </div>

                <div style={{
                  padding: '24px',
                  backgroundColor: 'var(--bg-card)',
                  fontSize: '14px',
                  color: 'var(--text-main)',
                  lineHeight: '1.6',
                  minHeight: '200px',
                  overflowY: 'auto'
                }}>
                  <div dangerouslySetInnerHTML={{ __html: selectedTemplate.body }} style={{ whiteSpace: 'pre-wrap' }} />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <Button onClick={() => setSelectedTemplate(null)} variant="primary">Close Preview</Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Create Template Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '1100px', width: '90%' }}>
            <div className="modal-header">
              <h2>{editingTemplate ? 'Edit Email Template' : 'Build Custom Email Lure'}</h2>
              <button onClick={handleCloseCreateModal} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleCreateTemplate}>
              <div className="modal-body template-modal-body-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'stretch' }}>
                
                {/* Left Column: Form Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {createError && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'var(--color-danger-light)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: 'var(--color-danger)',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}>
                      <AlertCircle size={16} />
                      <span>{createError}</span>
                    </div>
                  )}

                  {createSuccess && (
                    <div style={{
                      backgroundColor: 'var(--color-success-light)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      color: 'var(--color-success-hover)',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      {createSuccess}
                    </div>
                  )}

                  <div className="modal-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '6px', display: 'block' }}>Template Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. IT Token Expiry Alert"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                        style={{ padding: '10px 12px', borderRadius: '6px', fontSize: '13px', width: '100%' }}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '6px', display: 'block' }}>Sender Display Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Google Workspace Support"
                        value={newSenderName}
                        onChange={(e) => setNewSenderName(e.target.value)}
                        required
                        style={{ padding: '10px 12px', borderRadius: '6px', fontSize: '13px', width: '100%' }}
                      />
                    </div>
                  </div>

                  <div className="modal-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '6px', display: 'block' }}>Category</label>
                      <select
                        className="form-control"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        style={{ padding: '10px 12px', borderRadius: '6px', fontSize: '13px', width: '100%' }}
                      >
                        <option value="Credential Theft">Credential Theft</option>
                        <option value="Urgent Action">Urgent Action</option>
                        <option value="Suspicious Link">Suspicious Link</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '6px', display: 'block' }}>Difficulty Rating</label>
                      <select
                        className="form-control"
                        value={newDifficulty}
                        onChange={(e) => setNewDifficulty(e.target.value)}
                        style={{ padding: '10px 12px', borderRadius: '6px', fontSize: '13px', width: '100%' }}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: '600', fontSize: '12px', marginBottom: '6px', display: 'block' }}>Email Subject Line</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. [ALERT] Mandatory security patch installation"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      required
                      style={{ padding: '10px 12px', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-label" style={{ fontWeight: '600', fontSize: '12px', margin: 0 }}>Email Body Content</label>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: '500' }}>Tokens:</span>
                        {['{{EmployeeName}}', '{{Company}}'].map(token => (
                          <button
                            key={token}
                            type="button"
                            onClick={() => setNewBody(prev => prev + token)}
                            style={{
                              fontSize: '10px',
                              fontWeight: '600',
                              backgroundColor: 'var(--color-primary-light)',
                              color: 'var(--color-primary)',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              cursor: 'pointer'
                            }}
                          >
                            {token}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      className="form-control"
                      rows="7"
                      placeholder="Provide the email body in plain text or HTML. Use links to simulate phishing targets."
                      value={newBody}
                      onChange={(e) => setNewBody(e.target.value)}
                      required
                      style={{ padding: '12px', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace', resize: 'vertical' }}
                    />
                  </div>
                </div>

                {/* Right Column: Real-time Live Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Real-time Recipient View</span>
                  
                  <div style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'var(--bg-card)',
                    boxShadow: 'var(--shadow-md)',
                    overflow: 'hidden',
                    height: '100%',
                    minHeight: '340px'
                  }}>
                    {/* Window Titlebar */}
                    <div style={{
                      backgroundColor: 'var(--bg-sidebar)',
                      borderBottom: '1px solid var(--border-color)',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '600' }}>phintra-mail-client.exe</span>
                      <div style={{ width: '30px' }} />
                    </div>

                    {/* Email Headers */}
                    <div style={{
                      padding: '12px 14px',
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-sidebar)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      fontSize: '11px'
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-light)', width: '50px', display: 'inline-block' }}>From:</span>
                        <strong style={{ color: 'var(--text-main)' }}>{newSenderName || 'System Notification'} &lt;lure@phintra-sim.com&gt;</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-light)', width: '50px', display: 'inline-block' }}>To:</span>
                        <span style={{ color: 'var(--text-muted)' }}>target.employee@company.com</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-light)', width: '50px', display: 'inline-block' }}>Subject:</span>
                        <strong style={{ color: 'var(--color-primary)' }}>{newSubject || '[No Subject Line Provided]'}</strong>
                      </div>
                    </div>

                    {/* Email Live Render */}
                    <div style={{
                      padding: '20px',
                      flex: 1,
                      overflowY: 'auto',
                      fontSize: '13px',
                      color: '#000000',
                      lineHeight: '1.5',
                      backgroundColor: '#ffffff'
                    }}>
                      {newBody ? (
                        <div dangerouslySetInnerHTML={{ __html: newBody }} style={{ whiteSpace: 'pre-wrap' }} />
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Live preview will display here as you type in the editor...</span>
                      )}
                    </div>

                    {/* Info Footer */}
                    <div style={{
                      padding: '8px 12px',
                      borderTop: '1px solid var(--border-color)',
                      backgroundColor: 'rgba(59, 130, 246, 0.03)',
                      fontSize: '10px',
                      color: 'var(--color-primary-hover)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Info size={12} />
                      <span>Live simulator parsing enabled.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <Button variant="secondary" onClick={handleCloseCreateModal} disabled={saving}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : (editingTemplate ? 'Save Changes' : 'Create Template')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmailTemplates;
