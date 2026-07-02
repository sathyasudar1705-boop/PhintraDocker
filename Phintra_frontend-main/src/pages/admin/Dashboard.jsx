import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Users, Send, ShieldAlert, Award, ArrowUpRight, 
  ArrowDownRight, Mail, Plus, AlertOctagon, UserPlus, Eye,
  Brain, ShieldCheck, FileWarning, SearchX, ChevronLeft, 
  ChevronRight, Building2, BookOpen, RefreshCw
} from 'lucide-react';
import Button from '../../components/common/Button';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../../services/api';

const AdminDashboard = () => {
  const { 
    employees, 
    campaigns, 
    reportedEmails, 
    addEmployee, 
    departments,
    addDepartment,
    addCampaign,
    fetchData,
    emailTemplates,
    userRole
  } = useAppContext();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Analytics API states
  const [stats, setStats] = useState({
    total_employees: 0,
    active_campaigns: 0,
    average_security_score: 88.2
  });
  const [deptRiskData, setDeptRiskData] = useState([]);

  // Modal State for Quick Add Employee
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // Setup Wizard States
  const [wizardStep, setWizardStep] = useState(1);
  
  // Step 1: Department creation states
  const [wizardDeptName, setWizardDeptName] = useState('');
  const [wizardDeptDesc, setWizardDeptDesc] = useState('');
  
  // Step 2: Employee states
  const [wizardEmpFirstName, setWizardEmpFirstName] = useState('');
  const [wizardEmpLastName, setWizardEmpLastName] = useState('');
  const [wizardEmpEmail, setWizardEmpEmail] = useState('');
  const [wizardEmpDeptId, setWizardEmpDeptId] = useState('');
  const [createdEmployees, setCreatedEmployees] = useState([]);

  // Step 3: Campaign & template states
  const [wizardTemplateId, setWizardTemplateId] = useState('');
  
  // Step 4: Campaign custom metadata
  const [wizardCampaignTitle, setWizardCampaignTitle] = useState('First Cybersecurity Awareness Drill');
  const [wizardCampaignDesc, setWizardCampaignDesc] = useState('Initial baseline cybersecurity training and phish-drill delivered to team members.');
  
  const [wizardLoading, setWizardLoading] = useState(false);
  const [wizardError, setWizardError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchData();
      const [statsRes, deptsRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics/departments')
      ]);
      setStats(statsRes.data);
      setDeptRiskData(deptsRes.data);
    } catch (e) {
      console.error("Failed to refresh dashboard data:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const promises = [
          api.get('/analytics/dashboard'),
          api.get('/analytics/departments')
        ];
        if (isInitialLoading) {
          promises.push(fetchData());
        }
        const results = await Promise.all(promises);
        setStats(results[0].data);
        setDeptRiskData(results[1].data);
      } catch (e) {
        console.error("Failed to load dashboard analytics:", e);
      } finally {
        setIsLoading(false);
        setIsInitialLoading(false);
      }
    };
    fetchDashboardData();
  }, [campaigns.length, employees.length]);

  // Set default wizard department ID when departments load
  useEffect(() => {
    if (departments && departments.length > 0 && !wizardEmpDeptId) {
      setWizardEmpDeptId(departments[0].id);
    }
  }, [departments, wizardEmpDeptId]);

  // Set default Quick Add Employee department ID when departments load
  useEffect(() => {
    if (departments && departments.length > 0 && (!newEmpDept || newEmpDept === 'Engineering')) {
      setNewEmpDept(departments[0].id);
    }
  }, [departments, newEmpDept]);

  // Setup Wizard Handlers
  const handleWizardAddDept = async (e) => {
    e.preventDefault();
    if (!wizardDeptName.trim()) return;
    setWizardError('');
    setWizardLoading(true);
    try {
      await addDepartment(wizardDeptName.trim(), { description: wizardDeptDesc.trim() });
      setWizardDeptName('');
      setWizardDeptDesc('');
    } catch (err) {
      console.error(err);
      setWizardError(err.response?.data?.detail || err.message || 'Failed to create department.');
    } finally {
      setWizardLoading(false);
    }
  };

  const handleWizardAddEmp = async (e) => {
    e.preventDefault();
    if (!wizardEmpFirstName.trim() || !wizardEmpLastName.trim() || !wizardEmpEmail.trim() || !wizardEmpDeptId) {
      setWizardError('Please fill out all required fields.');
      return;
    }
    setWizardError('');
    setWizardLoading(true);
    try {
      const response = await addEmployee({
        first_name: wizardEmpFirstName.trim(),
        last_name: wizardEmpLastName.trim(),
        email: wizardEmpEmail.trim(),
        department_id: wizardEmpDeptId
      });
      setCreatedEmployees(prev => [...prev, response]);
      setWizardEmpFirstName('');
      setWizardEmpLastName('');
      setWizardEmpEmail('');
    } catch (err) {
      console.error(err);
      setWizardError(err.response?.data?.detail || err.message || 'Failed to add employee.');
    } finally {
      setWizardLoading(false);
    }
  };

  const handleWizardLaunchCampaign = async () => {
    if (!wizardCampaignTitle.trim() || !wizardTemplateId || createdEmployees.length === 0) {
      setWizardError('Campaign setup is incomplete.');
      return;
    }
    setWizardError('');
    setWizardLoading(true);
    try {
      // 1. Create Campaign
      const camp = await addCampaign({
        name: wizardCampaignTitle.trim(),
        description: wizardCampaignDesc.trim(),
        campaign_type: 'Awareness Email',
        template_id: wizardTemplateId,
        employee_ids: createdEmployees.map(e => e.id)
      });
      
      // 2. Launch Campaign
      await api.post(`/campaigns/${camp.id}/launch`);
      
      // 3. Sync portal dashboard data
      await fetchData();
    } catch (err) {
      console.error(err);
      setWizardError(err.response?.data?.detail || err.message || 'Failed to launch campaign.');
    } finally {
      setWizardLoading(false);
    }
  };

  // Setup Wizard view gating indicator
  const showWizard = !isLoading && (departments || []).length === 0;

  // Stat Metrics Calculations
  const activeCampaigns = stats.active_campaigns;
  const totalEmployees = stats.total_employees || employees.length;
  
  // Calculate average training completion rate across departments
  const totalHeadcount = deptRiskData.reduce((acc, d) => acc + d.headcount, 0);
  const avgCompletion = totalHeadcount > 0 
    ? (deptRiskData.reduce((acc, d) => acc + (d.training_completion_rate * d.headcount), 0) / totalHeadcount).toFixed(1)
    : 72.5;

  const failureRate = (100.0 - (stats.average_security_score || 88.2)).toFixed(1);

  // Simulated historical trend data for charts
  const performanceData = [
    { month: 'Jan', clicks: 28, reports: 42 },
    { month: 'Feb', clicks: 22, reports: 55 },
    { month: 'Mar', clicks: 18, reports: 61 },
    { month: 'Apr', clicks: 15, reports: 72 },
    { month: 'May', clicks: Math.round(parseFloat(failureRate)), reports: Math.round(stats.average_security_score || 88) }
  ];

  const riskData = deptRiskData.map(d => ({
    name: d.department_name,
    risk: d.avg_risk_score
  }));

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmpName || !newEmpEmail || !newEmpDept) return;

    try {
      await addEmployee({
        first_name: newEmpName.split(' ')[0],
        last_name: newEmpName.split(' ').slice(1).join(' ') || 'Employee',
        email: newEmpEmail,
        department_id: newEmpDept,
        job_title: 'Specialist'
      });

      setModalSuccess('Employee added successfully!');
      setTimeout(() => {
        setShowAddEmpModal(false);
        setNewEmpName('');
        setNewEmpEmail('');
        setModalSuccess('');
      }, 1000);
    } catch (err) {
      alert("Failed to add employee: " + (err.response?.data?.detail || err.message));
    }
  };

  // =========================================================================
  // SETUP WIZARD RENDER VIEWS
  // =========================================================================
  if (showWizard) {
    const selectedTemplate = (emailTemplates || []).find(t => t.id === wizardTemplateId);
    
    return (
      <div className="animate-page-enter" style={{ maxWidth: '960px', margin: '20px auto 40px auto' }}>
        
        {/* Onboarding Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
            Set Up Your Cybersecurity Console
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-light)', marginTop: '6px' }}>
            Follow these 4 simple steps to initialize your workspaces and launch your first training campaign.
          </p>
        </div>

        {/* Step Indicator Line */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          position: 'relative',
          padding: '0 20px'
        }}>
          {/* Progress bar line background */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '60px',
            right: '60px',
            height: '3px',
            backgroundColor: 'var(--border-color)',
            zIndex: 1
          }} />
          
          {/* Progress bar line fill */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '60px',
            width: `${((wizardStep - 1) / 3) * (100 - (120 / 9.6))}%`,
            height: '3px',
            backgroundColor: 'var(--color-primary)',
            zIndex: 2,
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />

          {[
            { step: 1, label: 'Departments', icon: Building2 },
            { step: 2, label: 'Employees', icon: UserPlus },
            { step: 3, label: 'Templates', icon: BookOpen },
            { step: 4, label: 'Launch Drill', icon: Send }
          ].map((item) => {
            const Icon = item.icon;
            const isCompleted = wizardStep > item.step;
            const isActive = wizardStep === item.step;
            
            return (
              <div key={item.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, position: 'relative' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? 'var(--color-success)' : isActive ? 'var(--color-primary)' : '#ffffff',
                  border: `2px solid ${isCompleted ? 'var(--color-success)' : isActive ? 'var(--color-primary)' : 'var(--border-hover)'}`,
                  color: isCompleted || isActive ? '#ffffff' : 'var(--text-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive ? '0 0 0 4px rgba(59, 130, 246, 0.15)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {isCompleted ? <ShieldCheck size={20} /> : <Icon size={18} />}
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? 'var(--text-main)' : 'var(--text-light)',
                  marginTop: '8px',
                  whiteSpace: 'nowrap'
                }}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Wizard Alert Dialog */}
        {wizardError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--color-danger-light)',
            border: '1px solid var(--color-danger-light)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '13px',
            color: 'var(--color-danger)',
            marginBottom: '24px'
          }} className="animate-fade-in">
            <AlertOctagon size={18} style={{ flexShrink: 0 }} />
            <span>{wizardError}</span>
          </div>
        )}

        {/* Wizard Step Boxes */}
        <div className="saas-card" style={{ padding: '32px' }}>
          
          {/* STEP 1: DEPARTMENTS */}
          {wizardStep === 1 && (
            <div className="animate-page-enter">
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-main)' }}>Step 1: Define Organizational Departments</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-light)', marginTop: '4px' }}>
                  Create departments to organize your workforce. Phintra targets threat-simulations and security analytics per department.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }} className="modal-grid-2col">
                {/* Department Form */}
                <div>
                  <form onSubmit={handleWizardAddDept}>
                    <div className="form-group">
                      <label className="form-label">Department Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Finance"
                        value={wizardDeptName}
                        onChange={(e) => setWizardDeptName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        placeholder="Brief summary of department responsibilities..."
                        value={wizardDeptDesc}
                        onChange={(e) => setWizardDeptDesc(e.target.value)}
                        rows={3}
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-light)', width: '100%', fontWeight: '550' }}>
                        Or pick a standard enterprise suggestion:
                      </span>
                      {['Finance', 'Engineering', 'Human Resources', 'Sales & Marketing', 'IT Operations'].map((name) => {
                        const exists = (departments || []).some(d => d.name.toLowerCase() === name.toLowerCase());
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => {
                              setWizardDeptName(name);
                              setWizardDeptDesc(`Responsible for corporate ${name.toLowerCase()} operations.`);
                            }}
                            className="btn btn-secondary btn-sm"
                            disabled={exists}
                            style={{ opacity: exists ? 0.4 : 1 }}
                          >
                            + {name}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={wizardLoading || !wizardDeptName.trim()}
                      loading={wizardLoading}
                    >
                      Save Department
                    </Button>
                  </form>
                </div>

                {/* Live List View */}
                <div style={{ 
                  backgroundColor: 'var(--bg-main)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '10px', 
                  padding: '20px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  minHeight: '260px' 
                }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '14px', color: 'var(--text-muted)' }}>
                    Created Workspace Departments ({(departments || []).length})
                  </h3>
                  
                  {departments && departments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1, maxHeight: '240px' }}>
                      {departments.map((dept) => (
                        <div
                          key={dept.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 14px',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-main)' }}>{dept.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>{dept.description || 'No description'}</div>
                          </div>
                          <span className="badge badge-success" style={{ fontSize: '10px' }}>Created</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-subtle)' }}>
                      <Building2 size={36} style={{ marginBottom: '8px' }} />
                      <span style={{ fontSize: '13px' }}>Create at least one department to continue.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Action bar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <Button
                  onClick={() => setWizardStep(2)}
                  variant="primary"
                  disabled={(departments || []).length === 0}
                  iconRight={ChevronRight}
                >
                  Continue to Step 2
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: EMPLOYEES */}
          {wizardStep === 2 && (
            <div className="animate-page-enter">
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-main)' }}>Step 2: Add Workspace Employees</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-light)', marginTop: '4px' }}>
                  Register staff members. These accounts will be simulated targets for your first baseline security drill.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px' }} className="modal-grid-2col">
                {/* Employee Form */}
                <div>
                  <form onSubmit={handleWizardAddEmp}>
                    <div className="modal-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="form-group">
                        <label className="form-label">First Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Jane"
                          value={wizardEmpFirstName}
                          onChange={(e) => setWizardEmpFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Last Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Doe"
                          value={wizardEmpLastName}
                          onChange={(e) => setWizardEmpLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Work Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="jane.doe@company.com"
                        value={wizardEmpEmail}
                        onChange={(e) => setWizardEmpEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Department *</label>
                      <select
                        className="form-control"
                        value={wizardEmpDeptId}
                        onChange={(e) => setWizardEmpDeptId(e.target.value)}
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={wizardLoading || !wizardEmpFirstName.trim() || !wizardEmpLastName.trim() || !wizardEmpEmail.trim() || !wizardEmpDeptId}
                      loading={wizardLoading}
                    >
                      Add Employee
                    </Button>
                  </form>
                </div>

                {/* Added Employees List */}
                <div style={{ 
                  backgroundColor: 'var(--bg-main)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '10px', 
                  padding: '20px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  minHeight: '260px' 
                }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '14px', color: 'var(--text-muted)' }}>
                    Simulated Employees ({createdEmployees.length})
                  </h3>

                  {createdEmployees.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1, maxHeight: '240px' }}>
                      <table className="saas-table" style={{ fontSize: '12px' }}>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Department</th>
                          </tr>
                        </thead>
                        <tbody>
                          {createdEmployees.map((emp) => {
                            const dept = departments.find(d => d.id === emp.department_id);
                            return (
                              <tr key={emp.id}>
                                <td style={{ fontWeight: '500' }}>{emp.first_name} {emp.last_name}</td>
                                <td>{emp.email}</td>
                                <td>{dept ? dept.name : 'Unknown'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-subtle)' }}>
                      <Users size={36} style={{ marginBottom: '8px' }} />
                      <span style={{ fontSize: '13px' }}>Add at least one employee recipient to continue.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <Button
                  onClick={() => setWizardStep(1)}
                  variant="secondary"
                  icon={ChevronLeft}
                >
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (emailTemplates && emailTemplates.length > 0) {
                      setWizardTemplateId(emailTemplates[0].id);
                    }
                    setWizardStep(3);
                  }}
                  variant="primary"
                  disabled={createdEmployees.length === 0}
                  iconRight={ChevronRight}
                >
                  Continue to Step 3
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: TEMPLATES */}
          {wizardStep === 3 && (
            <div className="animate-page-enter">
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-main)' }}>Step 3: Select Security Campaign Template</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-light)', marginTop: '4px' }}>
                  Choose a realistic educational security awareness template that will be sent to the onboarding employees.
                </p>
              </div>

              {emailTemplates && emailTemplates.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  {emailTemplates.map((tpl) => {
                    const isSelected = wizardTemplateId === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => setWizardTemplateId(tpl.id)}
                        className="saas-card"
                        style={{
                          cursor: 'pointer',
                          border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--bg-card)',
                          boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          padding: '20px',
                          height: '220px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span className={`badge badge-${tpl.difficulty.toLowerCase()}`} style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                              {tpl.difficulty}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '600' }}>{tpl.category}</span>
                          </div>
                          <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-main)' }}>{tpl.name}</h4>
                          <p style={{ fontSize: '11px', color: 'var(--text-light)', lineBreak: 'anywhere', height: '90px', overflow: 'hidden' }}>
                            <strong>Subject:</strong> {tpl.subject}
                            <br />
                            <span style={{ display: 'inline-block', marginTop: '4px', fontStyle: 'italic' }}>
                              {tpl.body.substring(0, 110)}...
                            </span>
                          </p>
                        </div>

                        {isSelected && (
                          <div style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            backgroundColor: 'var(--color-primary)',
                            color: '#ffffff',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'var(--shadow-sm)'
                          }}>
                            <ShieldCheck size={16} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon"><BookOpen size={32} /></div>
                  <h3>No Email Templates Found</h3>
                  <p>Check the backend database to make sure seed script was executed.</p>
                </div>
              )}

              {/* Navigation Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <Button
                  onClick={() => setWizardStep(2)}
                  variant="secondary"
                  icon={ChevronLeft}
                >
                  Back
                </Button>
                <Button
                  onClick={() => setWizardStep(4)}
                  variant="primary"
                  disabled={!wizardTemplateId}
                  iconRight={ChevronRight}
                >
                  Continue to Step 4
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: LAUNCH */}
          {wizardStep === 4 && (
            <div className="animate-page-enter">
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-main)' }}>Step 4: Launch Security Baseline Campaign</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-light)', marginTop: '4px' }}>
                  Review your onboarding training setup. Launching this campaign dispatches the simulated drill and unlocks the security console dashboard.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }} className="modal-grid-2col">
                {/* Input form details */}
                <div>
                  <div className="form-group">
                    <label className="form-label">Simulation Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={wizardCampaignTitle}
                      onChange={(e) => setWizardCampaignTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Simulation Description</label>
                    <textarea
                      className="form-control"
                      value={wizardCampaignDesc}
                      onChange={(e) => setWizardCampaignDesc(e.target.value)}
                      rows={4}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>

                {/* Right Summary Dashboard */}
                <div style={{ 
                  backgroundColor: 'var(--bg-main)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '10px', 
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-muted)' }}>
                      Campaign Configuration Summary
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                        <span style={{ color: 'var(--text-light)' }}>Simulated Targets:</span>
                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{createdEmployees.length} employee(s)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                        <span style={{ color: 'var(--text-light)' }}>Template Selected:</span>
                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{selectedTemplate ? selectedTemplate.name : 'None'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                        <span style={{ color: 'var(--text-light)' }}>Difficulty Rating:</span>
                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{selectedTemplate ? selectedTemplate.difficulty : 'None'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
                        <span style={{ color: 'var(--text-light)' }}>Assigned Departments:</span>
                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{departments.length} department(s)</span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '20px',
                    backgroundColor: 'var(--color-primary-light)',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '12px',
                    color: '#1e3a8a',
                    lineHeight: '1.5'
                  }}>
                    <strong>Ready to Launch:</strong> Submitting will create the campaign, bind your targets, send initial awareness emails, and open your administrative console.
                  </div>
                </div>
              </div>

              {/* Navigation Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <Button
                  onClick={() => setWizardStep(3)}
                  variant="secondary"
                  icon={ChevronLeft}
                  disabled={wizardLoading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleWizardLaunchCampaign}
                  variant="success"
                  disabled={wizardLoading || !wizardCampaignTitle.trim()}
                  loading={wizardLoading}
                  icon={Send}
                >
                  Launch Campaign & Initialize Portal
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // =========================================================================
  // NORMAL ADMIN CONSOLE DASHBOARD RENDER
  // =========================================================================
  return (
    <div>
      {/* 1. Header Group */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Security Administration</h1>
          <p style={{ marginTop: '4px' }}>Analyze organizational training compliance and active phishing simulation threat vectors.</p>
        </div>

        {/* Quick Action Shortcuts */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button 
            onClick={() => navigate('/admin/create-campaign')}
            variant="primary"
            size="sm"
            icon={Plus}
          >
            Launch Campaign
          </Button>
          <Button 
            onClick={() => setShowAddEmpModal(true)}
            variant="secondary"
            size="sm"
            icon={UserPlus}
          >
            Add Employee
          </Button>
          <Button 
            onClick={handleRefresh}
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={isRefreshing}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Top Summary Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        
        {/* Card 1: Users */}
        <div className="saas-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {isLoading ? (
            <div style={{ width: '100%' }}>
              <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
              <div className="skeleton skeleton-title" style={{ width: '30%' }}></div>
            </div>
          ) : (
            <>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '600' }}>Total Users</span>
                <h3 style={{ fontSize: '28px', fontWeight: '700', marginTop: '8px', color: 'var(--text-main)' }}>{totalEmployees}</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontWeight: '500' }}>
                  <ArrowUpRight size={14} /> +3 this month
                </span>
              </div>
              <div style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '12px', borderRadius: '10px' }}>
                <Users size={24} />
              </div>
            </>
          )}
        </div>

        {/* Card 2: Active campaigns */}
        <div className="saas-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {isLoading ? (
            <div style={{ width: '100%' }}>
              <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
              <div className="skeleton skeleton-title" style={{ width: '30%' }}></div>
            </div>
          ) : (
            <>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '600' }}>Active Campaigns</span>
                <h3 style={{ fontSize: '28px', fontWeight: '700', marginTop: '8px', color: 'var(--text-main)' }}>{activeCampaigns}</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontWeight: '500' }}>
                  Running on auto-pilot
                </span>
              </div>
              <div style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '12px', borderRadius: '10px' }}>
                <Send size={24} />
              </div>
            </>
          )}
        </div>

        {/* Card 3: Failure Rate */}
        <div className="saas-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {isLoading ? (
             <div style={{ width: '100%' }}>
               <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
               <div className="skeleton skeleton-title" style={{ width: '30%' }}></div>
             </div>
          ) : (
            <>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '600' }}>Phishing Failure Rate</span>
                <h3 style={{ fontSize: '28px', fontWeight: '700', marginTop: '8px', color: 'var(--color-danger)' }}>{failureRate}%</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontWeight: '500' }}>
                  <ArrowDownRight size={14} /> -4.2% from Q1
                </span>
              </div>
              <div style={{ backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', padding: '12px', borderRadius: '10px' }}>
                <ShieldAlert size={24} />
              </div>
            </>
          )}
        </div>

        {/* Card 4: Training Completion */}
        <div className="saas-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {isLoading ? (
             <div style={{ width: '100%' }}>
               <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
               <div className="skeleton skeleton-title" style={{ width: '30%' }}></div>
             </div>
          ) : (
            <>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '600' }}>Training Completion</span>
                <h3 style={{ fontSize: '28px', fontWeight: '700', marginTop: '8px', color: 'var(--color-teal)' }}>{avgCompletion}%</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontWeight: '500' }}>
                  <ArrowUpRight size={14} /> +8.1% this week
                </span>
              </div>
              <div style={{ backgroundColor: 'var(--color-teal-light)', color: 'var(--color-teal)', padding: '12px', borderRadius: '10px' }}>
                <Award size={24} />
              </div>
            </>
          )}
        </div>

        {/* Card 5: Org Risk Score */}
        <div className="saas-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {isLoading ? (
             <div style={{ width: '100%' }}>
               <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
               <div className="skeleton skeleton-title" style={{ width: '30%' }}></div>
             </div>
          ) : (
            <>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '600' }}>Org Risk Score</span>
                <h3 style={{ fontSize: '28px', fontWeight: '700', marginTop: '8px', color: 'var(--color-warning)' }}>42/100</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontWeight: '500' }}>
                  Moderate Risk Level
                </span>
              </div>
              <div style={{ backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)', padding: '12px', borderRadius: '10px' }}>
                <AlertOctagon size={24} />
              </div>
            </>
          )}
        </div>

        {/* Card 6: Maturity Score */}
        <div className="saas-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {isLoading ? (
             <div style={{ width: '100%' }}>
               <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
               <div className="skeleton skeleton-title" style={{ width: '30%' }}></div>
             </div>
          ) : (
            <>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '600' }}>Security Maturity</span>
                <h3 style={{ fontSize: '28px', fontWeight: '700', marginTop: '8px', color: 'var(--color-success)' }}>Level 3</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontWeight: '500' }}>
                  <ArrowUpRight size={14} /> Advancing
                </span>
              </div>
              <div style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', padding: '12px', borderRadius: '10px' }}>
                <ShieldCheck size={24} />
              </div>
            </>
          )}
        </div>

        {/* Card 7: High Risk Users */}
        <div className="saas-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {isLoading ? (
             <div style={{ width: '100%' }}>
               <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
               <div className="skeleton skeleton-title" style={{ width: '30%' }}></div>
             </div>
          ) : (
            <>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '600' }}>High Risk Users</span>
                <h3 style={{ fontSize: '28px', fontWeight: '700', marginTop: '8px', color: 'var(--color-danger)' }}>14</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontWeight: '500' }}>
                  Needs immediate action
                </span>
              </div>
              <div style={{ backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', padding: '12px', borderRadius: '10px' }}>
                <FileWarning size={24} />
              </div>
            </>
          )}
        </div>

        {/* Card 8: AI Recs */}
        <div className="saas-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {isLoading ? (
             <div style={{ width: '100%' }}>
               <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
               <div className="skeleton skeleton-title" style={{ width: '30%' }}></div>
             </div>
          ) : (
            <>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '600' }}>AI Recommendations</span>
                <h3 style={{ fontSize: '28px', fontWeight: '700', marginTop: '8px', color: '#8b5cf6' }}>3</h3>
                <span style={{ fontSize: '12px', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontWeight: '500' }}>
                  New insights available
                </span>
              </div>
              <div style={{ backgroundColor: '#f3e8ff', color: '#8b5cf6', padding: '12px', borderRadius: '10px' }}>
                <Brain size={24} />
              </div>
            </>
          )}
        </div>

        {/* Card 9: Reported Emails */}
        <div className="saas-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {isLoading ? (
             <div style={{ width: '100%' }}>
               <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
               <div className="skeleton skeleton-title" style={{ width: '30%' }}></div>
             </div>
          ) : (
            <>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '600' }}>Reported Emails</span>
                <h3 style={{ fontSize: '28px', fontWeight: '700', marginTop: '8px', color: 'var(--color-primary)' }}>{reportedEmails.length}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontWeight: '500' }}>
                  Suspicious emails flagged
                </span>
              </div>
              <div style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '12px', borderRadius: '10px' }}>
                <Mail size={24} />
              </div>
            </>
          )}
        </div>

      </div>

      {/* 3. Charts Area */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }} className="responsive-chart-grid">
        
        {/* Chart 1: Performance */}
        <div className="saas-card">
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: 'var(--text-main)' }}>Simulation Click vs Report Ratio</h3>
          <div style={{ width: '100%', height: '300px' }}>
            {isLoading ? (
              <div className="skeleton skeleton-card" style={{ height: '100%' }}></div>
            ) : performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-sidebar)" />
                  <XAxis dataKey="month" tickLine={false} style={{ fontSize: '12px', fill: 'var(--text-light)' }} />
                  <YAxis unit="%" tickLine={false} style={{ fontSize: '12px', fill: 'var(--text-light)' }} />
                  <Tooltip />
                  <Legend iconType="circle" style={{ fontSize: '12px' }} />
                  <Line type="monotone" name="Click Rate" dataKey="clicks" stroke="var(--color-danger)" strokeWidth={3} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="Report Rate" dataKey="reports" stroke="var(--color-primary)" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><AlertOctagon size={32} /></div>
                <h3>No Campaign Data</h3>
                <p>Run simulations to see performance trends.</p>
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Risk distribution */}
        <div className="saas-card">
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: 'var(--text-main)' }}>Department Risk Index (0-100)</h3>
          <div style={{ width: '100%', height: '300px' }}>
            {isLoading ? (
              <div className="skeleton skeleton-card" style={{ height: '100%' }}></div>
            ) : riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--bg-sidebar)" />
                  <XAxis type="number" domain={[0, 100]} tickLine={false} style={{ fontSize: '12px', fill: 'var(--text-light)' }} />
                  <YAxis dataKey="name" type="category" tickLine={false} style={{ fontSize: '12px', fill: 'var(--text-light)' }} />
                  <Tooltip />
                  <Bar name="Risk Rating" dataKey="risk" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><SearchX size={32} /></div>
                <h3>No Risk Data</h3>
                <p>Not enough data to calculate department risk.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. Recent Reports Table */}
      <div className="saas-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>Recent Reported Suspicious Emails</h3>
          <Button 
            onClick={() => navigate('/admin/reports')}
            variant="outline"
            size="sm"
          >
            View All Reports
          </Button>
        </div>

        {isLoading ? (
           <div className="saas-table-container" style={{ margin: 0, padding: '16px' }}>
             <div className="skeleton skeleton-text" style={{ marginBottom: '16px' }}></div>
             <div className="skeleton skeleton-text" style={{ marginBottom: '16px' }}></div>
             <div className="skeleton skeleton-text" style={{ marginBottom: '16px' }}></div>
           </div>
        ) : reportedEmails.length > 0 ? (
          <div className="saas-table-container" style={{ margin: 0 }}>
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Reporter</th>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Risk Grade</th>
                  <th>Status</th>
                  <th>Reported Date</th>
                </tr>
              </thead>
              <tbody>
                {reportedEmails.slice(0, 4).map((report) => (
                  <tr key={report.id}>
                    <td style={{ fontWeight: '500' }}>{report.reporter}</td>
                    <td style={{ color: 'var(--text-light)' }}>{report.senderEmail}</td>
                    <td>{report.subject}</td>
                    <td>
                      <span className={`badge badge-${report.riskLevel.toLowerCase()}`}>
                        {report.riskLevel}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${report.status.toLowerCase()}`}>
                        {report.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-light)' }}>{report.reportedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon"><Mail size={32} /></div>
            <h3>No Reports Yet</h3>
            <p>Employees haven't reported any suspicious emails recently.</p>
          </div>
        )}
      </div>

      {/* Quick Add Employee Modal */}
      {showAddEmpModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>Quick Add Employee</h2>
              <button onClick={() => setShowAddEmpModal(false)} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleAddEmployee}>
              <div className="modal-body">
                {modalSuccess && (
                  <div style={{
                    backgroundColor: 'var(--color-success-light)',
                    color: 'var(--color-success-hover)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '16px',
                    fontWeight: '550'
                  }}>
                    {modalSuccess}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Employee Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Robert Downey"
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Work Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. r.downey@company.com"
                    value={newEmpEmail}
                    onChange={(e) => setNewEmpEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    className="form-control"
                    value={newEmpDept}
                    onChange={(e) => setNewEmpDept(e.target.value)}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowAddEmpModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Employee</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 991px) {
          .responsive-chart-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .saas-card {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .saas-card:hover {
          transform: translateY(-3px);
          border-color: var(--color-primary) !important;
          box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.05) !important;
        }
        .saas-table th {
          background-color: var(--color-soft-bg) !important;
          font-weight: 600 !important;
          color: var(--color-heading-black) !important;
        }
        .saas-table tr:hover td {
          background-color: rgba(37, 99, 235, 0.02) !important;
        }
      `}</style>

    </div>
  );
};

export default AdminDashboard;
