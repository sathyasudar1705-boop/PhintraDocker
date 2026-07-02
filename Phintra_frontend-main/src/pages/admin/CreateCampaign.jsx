import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  Mail, 
  Users, 
  BookOpen, 
  Eye, 
  Send, 
  AlertCircle, 
  Settings, 
  Search, 
  Check, 
  Info, 
  AlertTriangle, 
  Sparkles, 
  Layers,
  FileText,
  Play
} from 'lucide-react';
import Button from '../../components/common/Button';
import api from '../../services/api';

const CreateCampaign = () => {
  const { employees, emailTemplates, departments, currentUser, fetchData } = useAppContext();
  const navigate = useNavigate();

  // Multi-Step Wizard State (4 steps)
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [savingCampaign, setSavingCampaign] = useState(false);

  // Draft Campaign ID saved in backend
  const [createdCampaignId, setCreatedCampaignId] = useState(null);

  // Form Fields
  // Step 1: Details
  const [campName, setCampName] = useState('');
  const [campDesc, setCampDesc] = useState('');
  
  // Step 2: Select Employees
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');

  // Step 3: Choose Template
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Step 4: Send Test Email & Safety checkbox
  const [testEmail, setTestEmail] = useState(currentUser?.email || 'admin@phintra.com');
  const [testSending, setTestSending] = useState(false);
  const [testSuccessMsg, setTestSuccessMsg] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Sync test email field when currentUser is loaded
  useEffect(() => {
    if (currentUser?.email) {
      setTestEmail(currentUser.email);
    }
  }, [currentUser]);

  // Employee Selection List Handlers
  const filteredEmployees = (employees || []).filter(emp => {
    const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const dept = (emp.department || '').toLowerCase();
    const search = employeeSearch.toLowerCase();
    
    // Filter by text search
    const matchesSearch = fullName.includes(search) || email.includes(search) || dept.includes(search);
    
    // Filter by department filter
    const matchesDept = !selectedDeptFilter || 
      emp.department_id === selectedDeptFilter || 
      emp.department === selectedDeptFilter ||
      ((departments || []).find(d => d.id === selectedDeptFilter)?.name === emp.department);
      
    return matchesSearch && matchesDept;
  });

  const handleToggleEmployee = (id) => {
    if (selectedEmployeeIds.includes(id)) {
      setSelectedEmployeeIds(prev => prev.filter(empId => empId !== id));
    } else {
      setSelectedEmployeeIds(prev => [...prev, id]);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedEmployeeIds.length === filteredEmployees.length && filteredEmployees.length > 0) {
      // Deselect all filtered employees
      const filteredIds = filteredEmployees.map(emp => emp.id);
      setSelectedEmployeeIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      // Select all filtered employees
      setSelectedEmployeeIds(prev => {
        const newSelection = [...prev];
        filteredEmployees.forEach(emp => {
          if (!newSelection.includes(emp.id)) {
            newSelection.push(emp.id);
          }
        });
        return newSelection;
      });
    }
  };

  const handleSelectDepartmentEmployees = (deptIdOrName) => {
    const activeFilter = deptIdOrName || selectedDeptFilter;
    if (!activeFilter) return;
    const targetDept = (departments || []).find(d => d.id === activeFilter || d.name === activeFilter);
    const deptName = targetDept ? targetDept.name : activeFilter;
    const deptId = targetDept ? targetDept.id : activeFilter;

    const deptEmpIds = (employees || [])
      .filter(emp => emp.department_id === deptId || emp.department === deptName || emp.department === deptId)
      .map(emp => emp.id);
    
    setSelectedEmployeeIds(prev => {
      const newSelection = [...prev];
      deptEmpIds.forEach(id => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });
  };

  // Step Transitions & Validations
  const validateStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!campName.trim()) {
        setError('Campaign name is required.');
        return false;
      }
      if (!campDesc.trim()) {
        setError('Campaign description/objective notes is required.');
        return false;
      }
    } else if (currentStep === 2) {
      if (selectedEmployeeIds.length === 0) {
        setError('Please select at least one employee recipient.');
        return false;
      }
    } else if (currentStep === 3) {
      if (!selectedTemplateId) {
        setError('Please choose an email template blueprint.');
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    // Transition from Step 3 (Choose Template & Preview) to Step 4 (Review & Deploy): Save draft to DB
    if (currentStep === 3) {
      setSavingCampaign(true);
      setError('');
      try {
        // Delete previous draft campaign to avoid stale lists
        if (createdCampaignId) {
          try {
            await api.delete(`/campaigns/${createdCampaignId}`);
          } catch (e) {
            console.warn("Could not prune previous draft campaign:", e);
          }
        }

        // Create fresh draft campaign with the selected employees and template
        const response = await api.post('/campaigns', {
          title: campName,
          description: campDesc,
          campaign_type: 'Awareness Email',
          status: 'Draft',
          template_id: selectedTemplateId,
          employee_ids: selectedEmployeeIds
        });
        setCreatedCampaignId(response.data.id);
        setCurrentStep(4);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to save campaign draft. Please check your network connection.');
      } finally {
        setSavingCampaign(false);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setTestSuccessMsg('');
    setCurrentStep(prev => prev - 1);
  };

  // Test Email Dispatch via backend
  const handleSendTestEmail = async () => {
    setError('');
    setTestSuccessMsg('');
    if (!testEmail) {
      setError('Please provide a valid test recipient email address.');
      return;
    }
    
    setTestSending(true);
    try {
      await api.post(`/campaigns/${createdCampaignId}/send-test`, {
        test_email: testEmail.trim()
      });
      setTestSuccessMsg(`Test awareness email successfully sent to ${testEmail}!`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to dispatch test SMTP connection email.');
    } finally {
      setTestSending(false);
    }
  };

  // Launch Campaign
  const handleLaunch = async () => {
    if (!termsAccepted) {
      setError('Please check the safety confirmation box.');
      return;
    }
    
    setSavingCampaign(true);
    setError('');
    try {
      await api.post(`/campaigns/${createdCampaignId}/launch`);
      setSuccess(true);
      if (fetchData) fetchData();
      setTimeout(() => {
        navigate('/admin/campaigns');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to launch SMTP campaign nodes.');
    } finally {
      setSavingCampaign(false);
    }
  };

  // Selected details reference helper
  const selectedTemplateObj = (emailTemplates || []).find(t => t.id === selectedTemplateId);

  // Count employees in department
  const getDeptCount = (deptNameOrId) => {
    return (employees || []).filter(emp => emp.department === deptNameOrId || emp.department_id === deptNameOrId).length;
  };

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>New Training Campaign</h1>
          <p>Configure a cybersecurity training campaign to deliver targeted security alerts via Gmail SMTP.</p>
        </div>
      </div>

      {/* Premium Step Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '32px'
      }} className="wizard-indicators">
        {[
          { step: 1, label: 'Configuration', icon: Settings },
          { step: 2, label: 'Target Audience', icon: Users },
          { step: 3, label: 'Template & Preview', icon: BookOpen },
          { step: 4, label: 'Review & Deploy', icon: ShieldCheck }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentStep === item.step;
          const isCompleted = currentStep > item.step;
          
          return (
            <div
              key={item.step}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'var(--bg-card)',
                border: isActive 
                  ? '1px solid var(--color-primary)' 
                  : isCompleted 
                    ? '1px solid var(--color-success)' 
                    : '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '14px 16px',
                boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.05)' : 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  backgroundColor: 'var(--color-primary)'
                }} />
              )}
              {isCompleted && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  backgroundColor: 'var(--color-success)'
                }} />
              )}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive 
                  ? 'var(--color-primary-light)' 
                  : isCompleted 
                    ? 'var(--color-success-light)' 
                    : 'var(--bg-sidebar)',
                color: isActive 
                  ? 'var(--color-primary)' 
                  : isCompleted 
                    ? 'var(--color-success)' 
                    : 'var(--text-light)',
                border: isActive 
                  ? '1px solid rgba(59, 130, 246, 0.2)' 
                  : isCompleted 
                    ? '1px solid rgba(16, 185, 129, 0.2)' 
                    : '1px solid var(--border-color)',
                fontWeight: '700',
                transition: 'all 0.2s ease'
              }}>
                {isCompleted ? <Check size={16} /> : <Icon size={16} />}
              </div>
              <div className="step-text-container" style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  color: isCompleted 
                    ? 'var(--color-success)' 
                    : isActive 
                      ? 'var(--color-primary)' 
                      : 'var(--text-light)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Step {item.step}
                </span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  marginTop: '1px'
                }}>
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Container */}
      <div className="saas-card" style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px' }}>
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-danger-light)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--color-danger)',
            padding: '12px 16px',
            borderRadius: '6px',
            fontSize: '13px',
            marginBottom: '24px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success-light)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <ShieldCheck size={32} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>Campaign Launched!</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-light)', marginTop: '6px' }}>Training emails are dispatched. Redirecting...</p>
          </div>
        ) : (
          <div>
            
            {/* STEP 1: CAMPAIGN DETAILS */}
            {currentStep === 1 && (
              <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>Campaign configuration</h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Establish the visual name and descriptive objectives for this security simulation.</p>
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px', display: 'block' }}>Campaign Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., June Corporate Phishing Awareness Drive"
                      value={campName}
                      onChange={(e) => setCampName(e.target.value)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        fontSize: '14px',
                        width: '100%'
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px', display: 'block' }}>Core Simulation Objectives & Scope</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      placeholder="Define the simulation goals, context, and focus of training..."
                      value={campDesc}
                      onChange={(e) => setCampDesc(e.target.value)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        fontSize: '14px',
                        width: '100%',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>

                {/* Sidebar Guidance card */}
                <div style={{
                  backgroundColor: 'var(--bg-sidebar)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
                    <Sparkles size={18} />
                    <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Simulation Setup Guide</h3>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { title: 'Clear Scope', desc: 'Define objectives that help identify specific cybersecurity knowledge gaps.', icon: FileText },
                      { title: 'Employee Privacy', desc: 'Phintra does not store credentials. Target click metrics evaluate vulnerability index.', icon: ShieldCheck },
                      { title: 'Landing Redirection', desc: 'When employees click simulation links, they are instantly redirected to a secure training page.', icon: Layers }
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px' }}>
                        <div style={{
                          minWidth: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--color-primary-light)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <item.icon size={14} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{item.title}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-light)', lineHeight: '1.4' }}>{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: SELECT EMPLOYEES */}
            {currentStep === 2 && (
              <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '32px', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>Target audience selection</h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Choose which company directory accounts will participate in this cycle.</p>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search employees..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      style={{ padding: '10px 12px 10px 36px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', width: '100%' }}
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Filter by Department</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        onClick={() => setSelectedDeptFilter('')}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '6px',
                          border: selectedDeptFilter === '' ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                          backgroundColor: selectedDeptFilter === '' ? 'var(--color-primary-light)' : 'transparent',
                          color: selectedDeptFilter === '' ? 'var(--color-primary-hover)' : 'var(--text-main)',
                          fontSize: '12px', fontWeight: '600', textAlign: 'left', cursor: 'pointer'
                        }}
                      >
                        <span>All Employees</span>
                        <span style={{ backgroundColor: selectedDeptFilter === '' ? 'var(--color-primary)' : 'var(--border-color)', color: selectedDeptFilter === '' ? '#ffffff' : 'var(--text-light)', padding: '2px 6px', borderRadius: '10px', fontSize: '10px' }}>{employees?.length || 0}</span>
                      </button>
                      {(departments || []).map((dept) => {
                        const isSelected = selectedDeptFilter === dept.id || selectedDeptFilter === dept.name;
                        const count = getDeptCount(dept.id) || getDeptCount(dept.name);
                        return (
                          <div key={dept.id} style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => setSelectedDeptFilter(dept.id)}
                              style={{
                                flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '6px',
                                border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                                backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
                                color: isSelected ? 'var(--color-primary-hover)' : 'var(--text-main)',
                                fontSize: '12px', fontWeight: '600', textAlign: 'left', cursor: 'pointer'
                              }}
                            >
                              <span>{dept.name}</span>
                              <span style={{ backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--border-color)', color: isSelected ? '#ffffff' : 'var(--text-light)', padding: '2px 6px', borderRadius: '10px', fontSize: '10px' }}>{count}</span>
                            </button>
                            <Button variant="outline" size="sm" onClick={() => { setSelectedDeptFilter(dept.id); handleSelectDepartmentEmployees(dept.id); }} style={{ padding: '0 10px', height: '38px', minWidth: 'auto' }}>+ All</Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Showing {filteredEmployees.length} employees</span>
                    <button onClick={handleToggleSelectAll} style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>
                      {selectedEmployeeIds.length === filteredEmployees.length && filteredEmployees.length > 0 ? 'Deselect All' : 'Select All Filtered'}
                    </button>
                  </div>

                  <div style={{ maxHeight: '440px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-main)' }}>
                    {filteredEmployees.map((emp) => {
                      const isChecked = selectedEmployeeIds.includes(emp.id);
                      return (
                        <div key={emp.id} onClick={() => handleToggleEmployee(emp.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', backgroundColor: isChecked ? 'var(--color-primary-light)' : 'transparent' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input type="checkbox" checked={isChecked} onChange={() => {}} style={{ pointerEvents: 'none' }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{emp.first_name} {emp.last_name}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{emp.email}</span>
                            </div>
                          </div>
                          <span style={{ fontSize: '10px', fontWeight: '600', backgroundColor: 'var(--bg-sidebar)', padding: '2px 8px', borderRadius: '4px' }}>{emp.department_name || emp.department}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: CHOOSE TEMPLATE & PREVIEW */}
            {currentStep === 3 && (
              <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '32px', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>Select phishing blueprint</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '440px', overflowY: 'auto' }}>
                    {(emailTemplates || []).map((template) => {
                      const isSelected = selectedTemplateId === template.id;
                      return (
                        <div key={template.id} onClick={() => setSelectedTemplateId(template.id)} style={{ border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--border-color)', borderRadius: '6px', padding: '16px', cursor: 'pointer', backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--bg-card)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: '700', margin: 0 }}>{template.name}</h4>
                            <span style={{ 
                              fontSize: '9px', 
                              fontWeight: '700', 
                              padding: '2px 6px', 
                              borderRadius: '12px', 
                              backgroundColor: template.is_system_template ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                              color: template.is_system_template ? '#2563eb' : '#059669' 
                            }}>
                              {template.is_system_template ? 'System' : 'Custom'}
                            </span>
                          </div>
                          <p style={{ fontSize: '11px', color: 'var(--text-light)', margin: 0 }}>Subject: {template.subject}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Simulated Recipient View</span>
                  {selectedTemplateObj ? (
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '24px', backgroundColor: '#ffffff', color: '#000', fontSize: '13px', lineHeight: '1.6', height: '100%', overflowY: 'auto' }}>
                      <strong>Subject: {selectedTemplateObj.subject}</strong>
                      <hr style={{ margin: '16px 0' }} />
                      <div dangerouslySetInnerHTML={{ __html: selectedTemplateObj.body }} style={{ whiteSpace: 'pre-wrap' }} />
                    </div>
                  ) : <div style={{ border: '1px dashed var(--border-color)', padding: '40px', textAlign: 'center' }}>Select a template to preview.</div>}
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & LAUNCH */}
            {currentStep === 4 && (
              <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '32px', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>Campaign Summary</h3>
                    <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>Title: <strong>{campName}</strong></div>
                      <div>Targets: <strong>{selectedEmployeeIds.length}</strong></div>
                      <div>Template: <strong>{selectedTemplateObj?.name}</strong></div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>SMTP Dispatch Test</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="email" className="form-control" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', flex: 1 }} />
                      <Button variant="outline" onClick={handleSendTestEmail} loading={testSending}>Send Test</Button>
                    </div>
                    {testSuccessMsg && <p style={{ color: 'var(--color-success)', fontSize: '12px', marginTop: '8px' }}>{testSuccessMsg}</p>}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ backgroundColor: 'var(--color-warning-light)', padding: '20px', borderRadius: '8px', fontSize: '12px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Compliance Note</h3>
                    <p>Ensure your mail server allows Phintra nodes to prevent spam blocking.</p>
                  </div>
                  <label style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                    <span style={{ fontSize: '12px' }}>I authorize the launch of this training campaign.</span>
                  </label>
                  <Button variant="teal" onClick={handleLaunch} disabled={!termsAccepted || savingCampaign} loading={savingCampaign} style={{ width: '100%' }}>
                    Deploy & Launch Campaign
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '28px' }}>
              {currentStep > 1 ? <Button variant="secondary" icon={ChevronLeft} onClick={handleBack} disabled={savingCampaign}>Back</Button> : <div />}
              {currentStep < 4 ? <Button variant="primary" iconRight={ChevronRight} onClick={handleNext} disabled={savingCampaign}>Next Step</Button> : <div />}
            </div>

          </div>
        )}
      </div>

      <style>{`
        .wizard-indicators { margin-bottom: 32px; }
        @media (max-width: 900px) { .wizard-indicators { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 768px) { .animate-fade-in { grid-template-columns: 1fr; } .wizard-indicators { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default CreateCampaign;
