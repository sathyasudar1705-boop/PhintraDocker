import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useConfirm } from '../../hooks/useConfirm';
import { Search, UserPlus, Edit3, Trash2, ShieldAlert, Users, Building2, TrendingUp, X, Eye, EyeOff, CheckCircle } from 'lucide-react';

/* ─── Helpers ─────────────────────────────────────────── */
const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

const avatarGradients = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#0ea5e9,#06b6d4)',
  'linear-gradient(135deg,#f43f5e,#ec4899)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#3b82f6,#6366f1)',
  'linear-gradient(135deg,#8b5cf6,#ec4899)',
];
const pickGradient = (str = '') => avatarGradients[str.charCodeAt(0) % avatarGradients.length];

const riskConfig = {
  High:   { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444', label: 'High Risk' },
  Medium: { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b', label: 'Medium' },
  Low:    { bg: '#f0fdf4', color: '#16a34a', dot: '#22c55e', label: 'Low Risk' },
};

/* ─── Sub-components ──────────────────────────────────── */
const RiskBadge = ({ level = 'Low' }) => {
  const cfg = riskConfig[level] || riskConfig.Low;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '20px',
      backgroundColor: cfg.bg, color: cfg.color,
      fontSize: '11px', fontWeight: '700', letterSpacing: '0.02em'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div style={{
    flex: 1, minWidth: '120px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex', alignItems: 'center', gap: '14px',
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: '10px',
      background: color + '18',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div>
      <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '3px' }}>{label}</div>
    </div>
  </div>
);

const FormField = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-light)', letterSpacing: '0.03em' }}>{label}</label>
    {children}
  </div>
);

/* ─── Main Component ──────────────────────────────────── */
const AdminEmployees = () => {
  const {
    employees,
    addEmployee,
    editEmployee,
    deleteEmployee,
    departments: dbDepartments,
    companies = [],
    currentEnterprise
  } = useAppContext();
  const confirm = useConfirm();

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter]   = useState('All');
  const [riskFilter, setRiskFilter]   = useState('All');
  const [showAddModal, setShowAddModal]   = useState(false);
  const [editingEmp, setEditingEmp]       = useState(null);
  const [showPassword, setShowPassword]   = useState(false);

  const [addName, setAddName]         = useState('');
  const [addEmail, setAddEmail]       = useState('');
  const [addDeptId, setAddDeptId]     = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [credentialsSummary, setCredentialsSummary] = useState(null);


  const [editName, setEditName]           = useState('');
  const [editEmail, setEditEmail]         = useState('');
  // Company ID is derived from currentEnterprise; no separate state needed
  const [editDeptId, setEditDeptId]       = useState('');
  const [editRisk, setEditRisk]           = useState('Low');
  const [editStatus, setEditStatus]       = useState('Not Started');

  const [formError,   setFormError]   = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // No need to set default company; it will be derived from currentEnterprise

  useEffect(() => {
    const filtered = (dbDepartments || []).filter(d => !currentEnterprise?.id || d.company_id === currentEnterprise.id);
    if (filtered.length > 0) {
      if (!filtered.some(d => d.id === addDeptId)) setAddDeptId(filtered[0].id);
    } else setAddDeptId('');
  }, [currentEnterprise, dbDepartments, addDeptId]);

  useEffect(() => {
    const filtered = (dbDepartments || []).filter(d => !currentEnterprise?.id || d.company_id === currentEnterprise.id);
    if (filtered.length > 0) {
      if (!filtered.some(d => d.id === editDeptId)) setEditDeptId(filtered[0].id);
    } else setEditDeptId('');
  }, [currentEnterprise, dbDepartments, editDeptId]);

  const filteredEmployees = (employees || []).filter(emp => {
    const name  = emp.name || `${emp.first_name} ${emp.last_name}` || '';
    const email = emp.email || '';
    const matchSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = deptFilter === 'All' || emp.department === deptFilter || emp.department_name === deptFilter;
    const matchRisk = riskFilter === 'All' || (emp.risk_level || 'Low') === riskFilter;
    return matchSearch && matchDept && matchRisk;
  });

  const totalHigh   = (employees || []).filter(e => (e.risk_level || 'Low') === 'High').length;
  const totalMedium = (employees || []).filter(e => (e.risk_level || 'Low') === 'Medium').length;
  const totalLow    = (employees || []).filter(e => (e.risk_level || 'Low') === 'Low').length;

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Remove Employee?',
      description: 'This action cannot be undone. The employee record will be permanently removed.',
      confirmText: 'Yes, Remove',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      try { await deleteEmployee(id); }
      catch (err) { alert('Failed to delete employee: ' + (err.response?.data?.detail || err.message)); }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); setFormSuccess('');
    if (!addName || !addEmail || !addDeptId || !addPassword) { setFormError('Please fill out all required fields.'); return; }
    if (!/\S+@\S+\.\S+/.test(addEmail)) { setFormError('Please provide a valid email address.'); return; }
    setIsSubmitting(true);
    try {
      await addEmployee({ name: addName.trim(), email: addEmail.trim(), company_id: currentEnterprise?.id, department_id: addDeptId, password: addPassword, job_title: 'Specialist', status: 'Low Risk', risk_score: 15.0 });
      setFormSuccess('Employee created successfully!');
      setCredentialsSummary({ email: addEmail.trim(), password: addPassword });
    } catch (err) { setFormError(err.response?.data?.detail || err.message || 'Failed to add employee.'); }
    finally { setIsSubmitting(false); }
  };

  const handleOpenEdit = (emp) => {
    setFormError(''); setFormSuccess('');
    setEditingEmp(emp);
    setEditName(emp.name || `${emp.first_name} ${emp.last_name}`);
    setEditEmail(emp.email);
    setEditDeptId(emp.department_id);
    setEditRisk(emp.risk_level || 'Low');
    setEditStatus(emp.status || 'Low Risk');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); setFormSuccess('');
    if (!editName || !editEmail || !editDeptId) { setFormError('Please complete all required fields.'); return; }
    let mappedRiskScore = 15.0;
    if (editRisk === 'Medium') mappedRiskScore = 45.0;
    if (editRisk === 'High')   mappedRiskScore = 75.0;
    setIsSubmitting(true);
    try {
      await editEmployee(editingEmp.id, { first_name: editName.split(' ')[0], last_name: editName.split(' ').slice(1).join(' ') || 'Employee', email: editEmail.trim(), company_id: currentEnterprise?.id, department_id: editDeptId, risk_score: mappedRiskScore, status: editStatus, job_title: editingEmp.job_title || 'Specialist' });
      setFormSuccess('Employee updated successfully!');
      setTimeout(() => { setEditingEmp(null); setFormSuccess(''); }, 1000);
    } catch (err) { setFormError(err.response?.data?.detail || err.message || 'Failed to update employee.'); }
    finally { setIsSubmitting(false); }
  };

  const closeAdd = () => { setShowAddModal(false); setCredentialsSummary(null); setAddName(''); setAddEmail(''); setAddPassword(''); setFormError(''); setFormSuccess(''); };

  /* ── Input style shorthand ── */
  const inp = {
    width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
    border: '1px solid var(--border-color)', background: 'var(--bg-main)',
    color: 'var(--text-main)', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
            Employees &amp; Users
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>
            Manage your workforce, monitor risk levels, and track training compliance.
          </p>
        </div>
        <button
          onClick={() => { setFormError(''); setFormSuccess(''); setShowAddModal(true); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px', border: 'none',
            background: 'var(--color-primary)', color: '#fff',
            fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <UserPlus size={16} />
          Add Employee
        </button>
      </div>

      {/* ── Stats Bar ── */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <StatCard icon={Users}      label="Total Employees" value={(employees || []).length} color="#6366f1" />
        <StatCard icon={ShieldAlert} label="High Risk"       value={totalHigh}               color="#ef4444" />
        <StatCard icon={TrendingUp} label="Medium Risk"      value={totalMedium}             color="#f59e0b" />
        <StatCard icon={Building2}  label="Low Risk"         value={totalLow}                color="#22c55e" />
      </div>

      {/* ── Filters ── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: '12px', padding: '14px 18px',
        display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ ...inp, paddingLeft: '36px' }}
          />
        </div>

        {/* Department */}
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ ...inp, width: 'auto', minWidth: '160px', cursor: 'pointer' }}>
          <option value="All">All Departments</option>
          {(dbDepartments || []).map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>

        {/* Risk */}
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} style={{ ...inp, width: 'auto', minWidth: '140px', cursor: 'pointer' }}>
          <option value="All">All Risk Levels</option>
          <option value="High">High Risk</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low Risk</option>
        </select>

        <span style={{ fontSize: '12px', color: 'var(--text-subtle)', marginLeft: 'auto' }}>
          Showing <strong style={{ color: 'var(--text-main)' }}>{filteredEmployees.length}</strong> of {(employees || []).length}
        </span>
      </div>

      {/* ── Employee Table ── */}
      {filteredEmployees.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: '16px', padding: '60px 24px', textAlign: 'center'
        }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Users size={28} style={{ color: 'var(--text-subtle)' }} />
          </div>
          <h3 style={{ color: 'var(--text-main)', fontWeight: '700', margin: '0 0 6px' }}>No employees found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Try adjusting your filters or add a new team member.</p>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: '16px', overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                {['Employee', 'Department', 'Email', 'Risk Level', 'Status', 'Actions'].map((h, i) => (
                  <th key={h} style={{
                    padding: '12px 18px', textAlign: i === 5 ? 'right' : 'left',
                    fontSize: '11px', fontWeight: '700', color: 'var(--text-subtle)',
                    letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp, idx) => {
                const name     = emp.name || `${emp.first_name} ${emp.last_name}` || 'Unknown';
                const dept     = emp.department || emp.department_name || 'General';
                const riskLvl  = emp.risk_level || 'Low';
                const status   = emp.status || 'Low Risk';
                const initials = getInitials(name);
                const grad     = pickGradient(name);

                return (
                  <tr key={emp.id} style={{
                    borderBottom: idx === filteredEmployees.length - 1 ? 'none' : '1px solid var(--border-color)',
                    transition: 'background 0.15s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Employee name + avatar */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%',
                          background: grad,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-main)' }}>{name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{emp.job_title || 'Team Member'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Dept */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '4px 10px', borderRadius: '8px',
                        background: 'var(--bg-main)', border: '1px solid var(--border-color)',
                        fontSize: '12px', fontWeight: '500', color: 'var(--text-main)'
                      }}>
                        <Building2 size={11} style={{ color: 'var(--text-subtle)' }} />
                        {dept}
                      </span>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '14px 18px', fontSize: '13px', color: 'var(--text-light)' }}>{emp.email}</td>

                    {/* Risk */}
                    <td style={{ padding: '14px 18px' }}><RiskBadge level={riskLvl} /></td>

                    {/* Status */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                        background: status === 'Active' || status === 'Low Risk' ? '#f0fdf4' : status === 'Critical' ? '#fef2f2' : '#fffbeb',
                        color: status === 'Active' || status === 'Low Risk' ? '#16a34a' : status === 'Critical' ? '#dc2626' : '#d97706',
                      }}>{status}</span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          title="Edit Employee"
                          style={{
                            width: 32, height: 32, borderRadius: '8px', border: '1px solid var(--border-color)',
                            background: 'var(--bg-main)', color: 'var(--text-light)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-main)'; e.currentTarget.style.color = 'var(--text-light)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          title="Delete Employee"
                          style={{
                            width: 32, height: 32, borderRadius: '8px', border: '1px solid #fecaca',
                            background: '#fef2f2', color: '#ef4444',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ADD EMPLOYEE MODAL
      ══════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: '20px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
            width: '100%', maxWidth: '480px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="3"/>
                    <circle cx="9" cy="11" r="2.5"/>
                    <path d="M5 18c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5"/>
                    <line x1="15" y1="9" x2="19" y2="9"/>
                    <line x1="15" y1="13" x2="17" y2="13"/>
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Add New Employee</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: 0 }}>Fill in the details to onboard a team member</p>
                </div>
              </div>
              <button onClick={closeAdd} style={{ width: 32, height: 32, borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Alerts */}
                {formError && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px' }}>
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={14} />{formSuccess}
                  </div>
                )}

                {credentialsSummary ? (
                  /* Credentials card */
                  <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-main)', margin: 0 }}>🔑 Employee Credentials</p>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', fontSize: '13px' }}>
                      <div style={{ marginBottom: '8px', color: 'var(--text-light)' }}>Email <span style={{ fontFamily: 'monospace', color: 'var(--text-main)', fontWeight: '600' }}>{credentialsSummary.email}</span></div>
                      <div style={{ color: 'var(--text-light)' }}>Password <span style={{ fontFamily: 'monospace', color: 'var(--text-main)', fontWeight: '600' }}>{credentialsSummary.password}</span></div>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-subtle)', margin: 0, textAlign: 'center' }}>Share these credentials securely with the employee.</p>
                  </div>
                ) : (
                  <>
                    <FormField label="Full Name *">
                      <input style={inp} type="text" placeholder="e.g. Tony Stark" value={addName} onChange={e => setAddName(e.target.value)} required />
                    </FormField>
                    <FormField label="Corporate Email *">
                      <input style={inp} type="email" placeholder="e.g. t.stark@company.com" value={addEmail} onChange={e => setAddEmail(e.target.value)} required />
                    </FormField>
                    <FormField label="Department *">
                      <select style={inp} value={addDeptId} onChange={e => setAddDeptId(e.target.value)} required>
                        <option value="">Select Department</option>
                        {(dbDepartments || []).filter(d => !currentEnterprise?.id || d.company_id === currentEnterprise.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </FormField>
                    <FormField label="Temporary Password *">
                      <div style={{ position: 'relative' }}>
                        <input style={{ ...inp, paddingRight: '42px' }} type={showPassword ? 'text' : 'password'} placeholder="Set a temporary password" value={addPassword} onChange={e => setAddPassword(e.target.value)} required />
                        <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', display: 'flex' }}>
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </FormField>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                {credentialsSummary ? (
                  <button type="button" onClick={closeAdd} style={{ padding: '10px 24px', borderRadius: '10px', background: 'var(--color-primary)', color: '#fff', border: 'none', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                    Done
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={closeAdd} style={{ padding: '10px 20px', borderRadius: '10px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-light)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} style={{ padding: '10px 24px', borderRadius: '10px', background: 'var(--color-primary)', color: '#fff', border: 'none', fontWeight: '600', fontSize: '13px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                      {isSubmitting ? 'Saving…' : 'Save Employee'}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          EDIT EMPLOYEE MODAL
      ══════════════════════════════════════════════════════ */}
      {editingEmp && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: '20px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
            width: '100%', maxWidth: '480px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Header */}
            <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: pickGradient(editName), display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Edit Employee</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: 0 }}>{editingEmp.email}</p>
                </div>
              </div>
              <button onClick={() => setEditingEmp(null)} style={{ width: 32, height: 32, borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {formError && <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px' }}>{formError}</div>}
                {formSuccess && <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} />{formSuccess}</div>}

                <FormField label="Full Name *">
                  <input style={inp} type="text" value={editName} onChange={e => setEditName(e.target.value)} required />
                </FormField>
                <FormField label="Corporate Email *">
                  <input style={inp} type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} required />
                </FormField>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <FormField label="Department">
                    <select style={inp} value={editDeptId} onChange={e => setEditDeptId(e.target.value)} required>
                      <option value="">Select Dept.</option>
                      {(dbDepartments || []).filter(d => !currentEnterprise?.id || d.company_id === currentEnterprise.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </FormField>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <FormField label="Risk Category">
                    <select style={inp} value={editRisk} onChange={e => setEditRisk(e.target.value)}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </FormField>
                  <FormField label="Status">
                    <select style={inp} value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                      <option value="Low Risk">Low Risk</option>
                      <option value="Medium Risk">Medium Risk</option>
                      <option value="High Risk">High Risk</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </FormField>
                </div>
              </div>

              <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEditingEmp(null)} style={{ padding: '10px 20px', borderRadius: '10px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-light)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} style={{ padding: '10px 24px', borderRadius: '10px', background: 'var(--color-primary)', color: '#fff', border: 'none', fontWeight: '600', fontSize: '13px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployees;
