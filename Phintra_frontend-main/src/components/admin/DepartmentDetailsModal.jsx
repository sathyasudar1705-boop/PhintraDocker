import React from 'react';
import Button from '../../components/common/Button';
import { Users, ShieldAlert, Award } from 'lucide-react';

const DepartmentDetailsModal = ({ department, onClose }) => {
  if (!department) return null;

  const riskColor = department.riskScore >= 60 ? 'var(--color-danger)' : department.riskScore >= 40 ? 'var(--color-warning)' : 'var(--color-success)';

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2>{department.name} Details</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-light)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14} /> Employees</span>
              <strong style={{ color: 'var(--text-main)' }}>{department.employeeCount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-light)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldAlert size={14} /> Threat Risk</span>
              <strong style={{ color: riskColor }}>{department.riskScore}/100</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-light)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Award size={14} /> Training Completion</span>
              <strong style={{ color: 'var(--color-teal)' }}>{department.completionPercentage}%</strong>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetailsModal;
