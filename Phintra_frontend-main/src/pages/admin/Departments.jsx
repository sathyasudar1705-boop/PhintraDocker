import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useConfirm } from '../../hooks/useConfirm';
import { initialDepartments } from '../../data/dummyData';
import { Building2, Plus, Edit3, Trash2, ShieldAlert, Award, Users, Eye } from 'lucide-react';
import Button from '../../components/common/Button';
import DepartmentDetailsModal from '../../components/admin/DepartmentDetailsModal';

const Departments = () => {
  const confirm = useConfirm();
  const { departments, addDepartment, editDepartment, deleteDepartment } = useAppContext();

  // Modal States
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const handleOpenDetails = (dept) => {
    setSelectedDept(dept);
    setShowDetailsModal(true);
  };

  // Existing code continues...

  // Form Fields (Add)
  const [addName, setAddName] = useState('');
  const [addCount, setAddCount] = useState(1);
  const [addRisk, setAddRisk] = useState(30);
  const [addComp, setAddComp] = useState(50);

  // Form Fields (Edit)
  const [editName, setEditName] = useState('');
  const [editCount, setEditCount] = useState(1);
  const [editRisk, setEditRisk] = useState(30);
  const [editComp, setEditComp] = useState(50);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Map API properties to UI property names for full backward compatibility
  const depts = (departments || []).map(d => ({
    id: d.id,
    name: d.name,
    employeeCount: d.employee_count !== undefined ? d.employee_count : 0,
    riskScore: d.avg_risk_score !== undefined ? d.avg_risk_score : 30,
    completionPercentage: d.training_completion_rate !== undefined ? d.training_completion_rate : d.training_completion || 0
  }));

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Department?',
      description: 'This action cannot be undone. The department record will be permanently removed.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      try {
        setError('');
        await deleteDepartment(id);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to delete department.');
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!addName) {
      setError('Department name is required.');
      return;
    }

    try {
      await addDepartment(addName, {
        description: '',
        riskScore: parseInt(addRisk),
        completionPercentage: parseInt(addComp)
      });

      setSuccess('Department registered successfully!');
      setTimeout(() => {
        setShowAddModal(false);
        setAddName('');
        setAddCount(1);
        setAddRisk(30);
        setAddComp(50);
        setSuccess('');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to register department.');
    }
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setEditName(dept.name);
    setEditCount(dept.employeeCount);
    setEditRisk(dept.riskScore);
    setEditComp(dept.completionPercentage);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editName) {
      setError('Department name is required.');
      return;
    }

    try {
      await editDepartment(editingDept.id, {
        name: editName,
        riskScore: parseInt(editRisk),
        completionPercentage: parseInt(editComp)
      });

      setSuccess('Department metrics updated!');
      setTimeout(() => {
        setEditingDept(null);
        setSuccess('');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update department.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Organization Departments</h1>
          <p>Supervise security scoring compliance, training completions, and employee allocation by department node.</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          variant="primary"
          icon={Plus}
        >
          Add Department
        </Button>
      </div>

      {/* Grid List of Departments */}
      {depts.length === 0 ? (
        <div className="saas-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-light)' }}>
          <Building2 size={48} style={{ color: 'var(--text-subtle)', marginBottom: '16px' }} />
          <h3>No departments registered</h3>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Register a new department node to partition employee metrics.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {depts.map((dept) => {
            // Determine risk level color
            const riskColor = dept.riskScore >= 60 ? 'var(--color-danger)' : dept.riskScore >= 40 ? 'var(--color-warning)' : 'var(--color-success)';
            return (
              <div key={dept.id} className="saas-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex'
                  }}>
                    <Building2 size={20} />
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                      <Button 
                        onClick={() => handleOpenDetails(dept)}
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                      />
                    <Button 
                      onClick={() => handleOpenEdit(dept)}
                      variant="ghost"
                      size="sm"
                      icon={Edit3}
                    />
                    <Button 
                      onClick={() => handleDelete(dept.id)}
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                    />
                  </div>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '14px' }}>
                  {dept.name} Team
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {/* Metric 1: Employees count */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-light)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={14} /> Total Employees
                    </span>
                    <strong style={{ color: 'var(--text-main)' }}>{dept.employeeCount} Members</strong>
                  </div>

                  {/* Metric 2: Risk rating */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-light)', marginBottom: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldAlert size={14} /> Threat Risk Index
                      </span>
                      <strong style={{ color: riskColor }}>{dept.riskScore}/100</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${dept.riskScore}%`, height: '100%', backgroundColor: riskColor }} />
                    </div>
                  </div>

                  {/* Metric 3: Training completed */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-light)', marginBottom: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={14} /> Training Completed
                      </span>
                      <strong style={{ color: 'var(--color-teal)' }}>{dept.completionPercentage}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${dept.completionPercentage}%`, height: '100%', backgroundColor: 'var(--color-teal)' }} />
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 1. Add Department Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>Add Department</h2>
              <button onClick={() => setShowAddModal(false)} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                {error && (
                  <div style={{
                    backgroundColor: 'var(--color-danger-light)',
                    color: 'var(--color-danger)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '16px'
                  }}>
                    {error}
                  </div>
                )}
                {success && (
                  <div style={{
                    backgroundColor: 'var(--color-success-light)',
                    color: 'var(--color-success-hover)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '16px',
                    fontWeight: '550'
                  }}>
                    {success}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Department Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Legal, Customer Success"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Employee Count</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={addCount}
                    onChange={(e) => setAddCount(e.target.value)}
                  />
                </div>

                <div className="modal-grid-2col" style={{ gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Initial Risk Rating (0-100)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max="100"
                      value={addRisk}
                      onChange={(e) => setAddRisk(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Completion (0-100%)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max="100"
                      value={addComp}
                      onChange={(e) => setAddComp(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Department</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Department Modal */}
      {editingDept && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>Edit Department Metrics</h2>
              <button onClick={() => setEditingDept(null)} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                {error && (
                  <div style={{
                    backgroundColor: 'var(--color-danger-light)',
                    color: 'var(--color-danger)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '16px'
                  }}>
                    {error}
                  </div>
                )}
                {success && (
                  <div style={{
                    backgroundColor: 'var(--color-success-light)',
                    color: 'var(--color-success-hover)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '16px',
                    fontWeight: '550'
                  }}>
                    {success}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Department Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Employee Count</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={editCount}
                    onChange={(e) => setEditCount(e.target.value)}
                  />
                </div>

                <div className="modal-grid-2col" style={{ gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Threat Risk Rating (0-100)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max="100"
                      value={editRisk}
                      onChange={(e) => setEditRisk(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Completion (0-100%)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max="100"
                      value={editComp}
                      onChange={(e) => setEditComp(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setEditingDept(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Details Modal */}
      {showDetailsModal && selectedDept && (
        <DepartmentDetailsModal department={selectedDept} onClose={() => setShowDetailsModal(false)} />
      )}


    </div>
  );
};

export default Departments;
