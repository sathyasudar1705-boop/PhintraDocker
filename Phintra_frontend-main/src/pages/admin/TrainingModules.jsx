import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { useConfirm } from '../../hooks/useConfirm';
import {
  BookOpen, Plus, Edit3, Trash2, Clock, Send, X,
  CheckCircle, AlertCircle, Loader, RefreshCw
} from 'lucide-react';

/* ─── Shared UI atoms ──────────────────────────────────── */
const inp = {
  width: '100%', padding: '10px 14px', borderRadius: '8px',
  border: '1px solid var(--border-color)', background: 'var(--bg-main)',
  color: 'var(--text-main)', fontSize: '13px', outline: 'none',
  boxSizing: 'border-box',
};

const FormField = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-light)', letterSpacing: '0.03em' }}>
      {label}
    </label>
    {children}
  </div>
);

const AlertBox = ({ msg, type }) => !msg ? null : (
  <div style={{
    padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
    background: type === 'error' ? '#fef2f2' : '#f0fdf4',
    border: `1px solid ${type === 'error' ? '#fecaca' : '#bbf7d0'}`,
    color: type === 'error' ? '#dc2626' : '#16a34a',
    display: 'flex', alignItems: 'center', gap: '8px',
  }}>
    {type === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
    {msg}
  </div>
);

const ModalOverlay = ({ children, onClose }) => (
  <div
    style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}
    onClick={e => e.target === e.currentTarget && onClose()}
  >
    <div style={{
      background: 'var(--bg-card)', borderRadius: '20px',
      border: '1px solid var(--border-color)',
      boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
      width: '100%', maxWidth: '520px',
      maxHeight: '90vh', overflowY: 'auto',
    }}>
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, onClose }) => (
  <div style={{ padding: '22px 26px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>{title}</h2>
    <button onClick={onClose} style={{
      width: 30, height: 30, borderRadius: '8px', border: '1px solid var(--border-color)',
      background: 'var(--bg-main)', cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)',
    }}><X size={15} /></button>
  </div>
);

const FooterBtn = ({ onClick, type = 'button', primary = false, disabled = false, children }) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    style={{
      padding: '10px 22px', borderRadius: '10px', fontSize: '13px',
      fontWeight: '600', cursor: disabled ? 'not-allowed' : 'pointer',
      border: primary ? 'none' : '1px solid var(--border-color)',
      background: primary ? 'var(--color-primary)' : 'var(--bg-main)',
      color: primary ? '#fff' : 'var(--text-light)',
      opacity: disabled ? 0.65 : 1,
    }}
  >{children}</button>
);

/* ─── Difficulty badge colours ──────────────────────────── */
const diffStyle = (diff) => ({
  Easy:   { bg: '#f0fdf4', color: '#16a34a' },
  Medium: { bg: '#fffbeb', color: '#d97706' },
  High:   { bg: '#fef2f2', color: '#dc2626' },
}[diff] || { bg: '#f1f5f9', color: '#64748b' });

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════ */
const AdminModules = () => {
  const { employees, departments, companies } = useAppContext();
  const confirm = useConfirm();

  const [modules,  setModules]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  /* ── Modal toggles ── */
  const [showAdd,     setShowAdd]     = useState(false);
  const [editingMod,  setEditingMod]  = useState(null);
  const [assigningMod,setAssigningMod]= useState(null);

  /* ── Add form ── */
  const [addTitle,       setAddTitle]       = useState('');
  const [addDesc,        setAddDesc]        = useState('');
  const [addCategory,    setAddCategory]    = useState('');
  const [addDur,         setAddDur]         = useState(15);
  const [addDiff,        setAddDiff]        = useState('Easy');
  const [addVideoUrl,    setAddVideoUrl]    = useState('');
  const [addVideoFile,   setAddVideoFile]   = useState(null);

  /* ── Edit form ── */
  const [editTitle,      setEditTitle]      = useState('');
  const [editDesc,       setEditDesc]       = useState('');
  const [editCategory,   setEditCategory]   = useState('');
  const [editDur,        setEditDur]        = useState(15);
  const [editDiff,       setEditDiff]       = useState('Easy');
  const [editVideoUrl,   setEditVideoUrl]   = useState('');

  /* ── Assign form ── */
  const [assignType,         setAssignType]         = useState('all');
  const [selectedEmployee,   setSelectedEmployee]   = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCompany,    setSelectedCompany]    = useState('');

  /* ─────────────────── API helpers ────────────────── */
  const flash = (msg, isErr = false) => {
    isErr ? setError(msg) : setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const fetchModules = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/training-modules');
      setModules(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Failed to load training modules. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchModules(); }, [fetchModules]);

  /* ─────────────────── CREATE ─────────────────────── */
  const resetAdd = () => {
    setAddTitle(''); setAddDesc(''); setAddCategory('');
    setAddDur(15); setAddDiff('Easy'); setAddVideoUrl(''); setAddVideoFile(null);
    setError(''); setSuccess('');
    setShowAdd(false);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addTitle.trim()) { flash('Module title is required.', true); return; }

    const formData = new FormData();
    formData.append('title',       addTitle.trim());
    formData.append('description', addDesc);
    formData.append('category',    addCategory || 'General');
    formData.append('duration',    parseInt(addDur) || 15);
    formData.append('difficulty',  addDiff);
    formData.append('video_url',   addVideoUrl);
    if (addVideoFile) formData.append('uploaded_video', addVideoFile);

    setSaving(true);
    try {
      await api.post('/training-modules', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      flash('Training module created successfully!');
      await fetchModules();
      setTimeout(resetAdd, 1000);
    } catch (err) {
      flash(err.response?.data?.detail || 'Failed to create training module.', true);
    } finally {
      setSaving(false);
    }
  };

  /* ─────────────────── UPDATE ─────────────────────── */
  const handleOpenEdit = (mod) => {
    setEditingMod(mod);
    setEditTitle(mod.title || '');
    setEditDesc(mod.description || '');
    setEditCategory(mod.category || '');
    setEditDur(mod.duration || 15);
    setEditDiff(mod.difficulty || 'Easy');
    setEditVideoUrl(mod.video_url || '');
    setError(''); setSuccess('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) { flash('Module title is required.', true); return; }

    setSaving(true);
    try {
      await api.put(`/training-modules/${editingMod.id}`, {
        title:       editTitle.trim(),
        description: editDesc,
        category:    editCategory || 'General',
        duration:    parseInt(editDur) || 15,
        difficulty:  editDiff,
        video_url:   editVideoUrl,
      });
      flash('Module updated successfully!');
      await fetchModules();
      setTimeout(() => { setEditingMod(null); setSuccess(''); }, 1000);
    } catch (err) {
      flash(err.response?.data?.detail || 'Failed to update module.', true);
    } finally {
      setSaving(false);
    }
  };

  /* ─────────────────── DELETE ─────────────────────── */
  const handleDelete = async (id, title) => {
    const confirmed = await confirm({
      title: 'Delete Training Module?',
      description: `"${title}" and all its assignments will be permanently removed.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      await api.delete(`/training-modules/${id}`);
      flash('Module deleted.');
      setModules(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      flash(err.response?.data?.detail || 'Failed to delete module.', true);
    }
  };

  /* ─────────────────── ASSIGN ─────────────────────── */
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (assignType === 'employee'   && !selectedEmployee)   { flash('Please select an employee.', true);   return; }
    if (assignType === 'department' && !selectedDepartment) { flash('Please select a department.', true);  return; }
    if (assignType === 'company'    && !selectedCompany)    { flash('Please select a company.', true);     return; }

    const payload = { assign_all: assignType === 'all' };
    if (assignType === 'employee')   payload.employee_id   = selectedEmployee;
    if (assignType === 'department') payload.department_id = selectedDepartment;
    if (assignType === 'company')    payload.company_id    = selectedCompany;

    setSaving(true);
    try {
      await api.post(`/training-modules/${assigningMod.id}/assign`, payload);
      flash('Training assigned successfully!');
      setTimeout(() => {
        setAssigningMod(null);
        setAssignType('all');
        setSelectedEmployee(''); setSelectedDepartment(''); setSelectedCompany('');
        setSuccess('');
      }, 1200);
    } catch (err) {
      flash(err.response?.data?.detail || 'Failed to assign training module.', true);
    } finally {
      setSaving(false);
    }
  };

  /* ─────────────────── RENDER ──────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
            Training Modules
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>
            Create, manage, and assign cybersecurity awareness courses.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchModules} title="Refresh" style={{
            padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)',
            background: 'var(--bg-main)', color: 'var(--text-light)', cursor: 'pointer', display: 'flex', alignItems: 'center',
          }}>
            <RefreshCw size={15} />
          </button>
          <button
            onClick={() => { setError(''); setSuccess(''); setShowAdd(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '10px', border: 'none',
              background: 'var(--color-primary)', color: '#fff',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
            }}
          >
            <Plus size={16} /> Create Module
          </button>
        </div>
      </div>

      {/* Global alerts */}
      <AlertBox msg={error}   type="error" />
      <AlertBox msg={success} type="success" />

      {/* Module Grid */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '60px', color: 'var(--text-light)' }}>
          <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
          Loading training modules…
        </div>
      ) : modules.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: '16px', padding: '60px 24px', textAlign: 'center',
        }}>
          <BookOpen size={48} style={{ color: 'var(--text-subtle)', marginBottom: '16px' }} />
          <h3 style={{ color: 'var(--text-main)', fontWeight: '700', margin: '0 0 6px' }}>No training modules yet</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>
            Create your first module to start training your team.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {modules.map((mod) => {
            const ds = diffStyle(mod.difficulty);
            return (
              <div key={mod.id} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: '16px', padding: '20px',
                display: 'flex', flexDirection: 'column', gap: '12px',
                transition: 'box-shadow 0.2s',
              }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                    background: ds.bg, color: ds.color,
                  }}>{mod.difficulty || 'Easy'}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { icon: Send,  label: 'Assign', onClick: () => setAssigningMod(mod), c: '#6366f1' },
                      { icon: Edit3, label: 'Edit',   onClick: () => handleOpenEdit(mod),  c: '#0ea5e9' },
                      { icon: Trash2,label: 'Delete', onClick: () => handleDelete(mod.id, mod.title), c: '#ef4444' },
                    ].map(({ icon: Icon, label, onClick, c }) => (
                      <button key={label} onClick={onClick} title={label} style={{
                        width: 30, height: 30, borderRadius: '8px',
                        border: `1px solid ${c}33`, background: `${c}11`,
                        color: c, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={13} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title + desc */}
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 6px', lineHeight: 1.4 }}>
                    {mod.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: 0, lineHeight: 1.5 }}>
                    {mod.description || 'No description provided.'}
                  </p>
                </div>

                {/* Footer */}
                <div style={{
                  borderTop: '1px solid var(--border-color)', paddingTop: '12px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: '12px', color: 'var(--text-subtle)',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={13} /> {mod.duration || 15} mins
                  </span>
                  <span style={{
                    padding: '2px 10px', borderRadius: '8px',
                    background: 'var(--bg-main)', border: '1px solid var(--border-color)',
                    fontSize: '11px', fontWeight: '500', color: 'var(--text-main)',
                    textTransform: 'capitalize',
                  }}>
                    {mod.category || 'General'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ════ ADD MODULE MODAL ════ */}
      {showAdd && (
        <ModalOverlay onClose={resetAdd}>
          <ModalHeader title="Create Training Module" onClose={resetAdd} />
          <form onSubmit={handleAddSubmit}>
            <div style={{ padding: '20px 26px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <AlertBox msg={error}   type="error" />
              <AlertBox msg={success} type="success" />
              <FormField label="Module Title *">
                <input style={inp} type="text" placeholder="e.g. Recognizing Credential Theft"
                  value={addTitle} onChange={e => setAddTitle(e.target.value)} required />
              </FormField>
              <FormField label="Description">
                <textarea style={{ ...inp, resize: 'vertical', minHeight: '80px' }}
                  placeholder="Brief overview of what the course covers…"
                  value={addDesc} onChange={e => setAddDesc(e.target.value)} rows={3} />
              </FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <FormField label="Category">
                  <input style={inp} type="text" placeholder="e.g. Phishing, Passwords"
                    value={addCategory} onChange={e => setAddCategory(e.target.value)} />
                </FormField>
                <FormField label="Duration (mins) *">
                  <input style={inp} type="number" min="1" value={addDur}
                    onChange={e => setAddDur(e.target.value)} required />
                </FormField>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <FormField label="Difficulty">
                  <select style={inp} value={addDiff} onChange={e => setAddDiff(e.target.value)}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </FormField>
                <FormField label="Video Link (YouTube/Vimeo)">
                  <input style={inp} type="text" placeholder="https://..."
                    value={addVideoUrl} onChange={e => setAddVideoUrl(e.target.value)} />
                </FormField>
              </div>
              <FormField label="Or Upload Video File (Optional)">
                <input style={inp} type="file" accept="video/*"
                  onChange={e => setAddVideoFile(e.target.files[0])} />
                <small style={{ color: 'var(--text-subtle)', fontSize: '11px' }}>Supported: MP4, WebM</small>
              </FormField>
            </div>
            <div style={{ padding: '0 26px 22px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <FooterBtn onClick={resetAdd}>Cancel</FooterBtn>
              <FooterBtn type="submit" primary disabled={saving}>
                {saving ? 'Creating…' : 'Create Module'}
              </FooterBtn>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* ════ EDIT MODULE MODAL ════ */}
      {editingMod && (
        <ModalOverlay onClose={() => setEditingMod(null)}>
          <ModalHeader title="Edit Training Module" onClose={() => setEditingMod(null)} />
          <form onSubmit={handleEditSubmit}>
            <div style={{ padding: '20px 26px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <AlertBox msg={error}   type="error" />
              <AlertBox msg={success} type="success" />
              <FormField label="Module Title *">
                <input style={inp} type="text" value={editTitle}
                  onChange={e => setEditTitle(e.target.value)} required />
              </FormField>
              <FormField label="Description">
                <textarea style={{ ...inp, resize: 'vertical', minHeight: '80px' }}
                  value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} />
              </FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <FormField label="Category">
                  <input style={inp} type="text" value={editCategory}
                    onChange={e => setEditCategory(e.target.value)} />
                </FormField>
                <FormField label="Duration (mins) *">
                  <input style={inp} type="number" min="1" value={editDur}
                    onChange={e => setEditDur(e.target.value)} required />
                </FormField>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <FormField label="Difficulty">
                  <select style={inp} value={editDiff} onChange={e => setEditDiff(e.target.value)}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </FormField>
                <FormField label="Video Link">
                  <input style={inp} type="text" placeholder="https://..."
                    value={editVideoUrl} onChange={e => setEditVideoUrl(e.target.value)} />
                </FormField>
              </div>
            </div>
            <div style={{ padding: '0 26px 22px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <FooterBtn onClick={() => setEditingMod(null)}>Cancel</FooterBtn>
              <FooterBtn type="submit" primary disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </FooterBtn>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* ════ ASSIGN MODAL ════ */}
      {assigningMod && (
        <ModalOverlay onClose={() => setAssigningMod(null)}>
          <ModalHeader title={`Assign: ${assigningMod.title}`} onClose={() => setAssigningMod(null)} />
          <form onSubmit={handleAssignSubmit}>
            <div style={{ padding: '20px 26px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <AlertBox msg={error}   type="error" />
              <AlertBox msg={success} type="success" />
              <FormField label="Assignment Type">
                <select style={inp} value={assignType} onChange={e => setAssignType(e.target.value)}>
                  <option value="all">All Employees</option>
                  <option value="employee">Specific Employee</option>
                  <option value="department">By Department</option>
                  <option value="company">By Company</option>
                </select>
              </FormField>

              {assignType === 'employee' && (
                <FormField label="Select Employee">
                  <select style={inp} value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} required>
                    <option value="">-- Select Employee --</option>
                    {(employees || []).map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name || `${emp.first_name} ${emp.last_name}`} ({emp.email})
                      </option>
                    ))}
                  </select>
                </FormField>
              )}

              {assignType === 'department' && (
                <FormField label="Select Department">
                  <select style={inp} value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} required>
                    <option value="">-- Select Department --</option>
                    {(departments || []).map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </FormField>
              )}

              {assignType === 'company' && (
                <FormField label="Select Company">
                  <select style={inp} value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)} required>
                    <option value="">-- Select Company --</option>
                    {(companies || []).map(c => (
                      <option key={c.id} value={c.id}>{c.company_name}</option>
                    ))}
                  </select>
                </FormField>
              )}
            </div>
            <div style={{ padding: '0 26px 22px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <FooterBtn onClick={() => setAssigningMod(null)}>Cancel</FooterBtn>
              <FooterBtn type="submit" primary disabled={saving}>
                {saving ? 'Assigning…' : 'Assign Training'}
              </FooterBtn>
            </div>
          </form>
        </ModalOverlay>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminModules;
