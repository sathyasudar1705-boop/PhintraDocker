import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Award, Download, Eye, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';

const Certificates = () => {
  const { certificates } = useAppContext();
  const [selectedCert, setSelectedCert] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const handleDownload = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>My Certificates</h1>
          <p>Inspect and download your verified training credentials representing cybersecurity milestones.</p>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--text-main)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
          <span style={{ fontSize: '13px', fontWeight: '500' }}>Certificate PDF downloaded successfully!</span>
        </div>
      )}

      {/* Grid listing certificates */}
      {certificates.length === 0 ? (
        <div className="saas-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-light)' }}>
          <Award size={48} style={{ color: 'var(--border-hover)', marginBottom: '16px' }} />
          <h3>No credentials earned yet</h3>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Complete assigned training modules and score 80%+ on quizzes to unlock certificates.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {certificates.map((cert) => (
            <div key={cert.id} className="saas-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Award size={22} />
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
                {cert.name}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '20px' }}>
                Course: <strong style={{ color: 'var(--text-muted)' }}>{cert.courseName}</strong> <br />
                Earned: <span style={{ color: 'var(--text-muted)' }}>{cert.dateEarned}</span>
              </p>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                <Button 
                  variant="secondary"
                  size="sm"
                  icon={Eye}
                  onClick={() => setSelectedCert(cert)}
                  style={{ flex: 1 }}
                >
                  Inspect
                </Button>
                <Button 
                  variant="teal"
                  size="sm"
                  icon={Download}
                  onClick={handleDownload}
                  style={{ flex: 1 }}
                >
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {selectedCert && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h2>Certificate Verification Viewer</h2>
              <button onClick={() => setSelectedCert(null)} className="close-btn">&times;</button>
            </div>
            
            <div className="modal-body" style={{ padding: '32px' }}>
              
              {/* Premium Certificate visual layout */}
              <div className="certificate-visual" style={{
                border: '6px double var(--border-hover)',
                padding: '36px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-card)',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.01)'
              }}>
                {/* Brand */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                  <ShieldCheck size={26} style={{ color: 'var(--color-teal)' }} />
                  <strong style={{ fontSize: '15px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Phintra Academy</strong>
                </div>

                <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-subtle)', letterSpacing: '0.1em', fontWeight: '600' }}>
                  Certificate of Completion
                </span>
                
                <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: '20px 0 10px 0' }}>This is proudly presented to</p>
                <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-main)', fontStyle: 'italic', letterSpacing: '-0.02em', borderBottom: '1px solid var(--border-hover)', width: 'fit-content', margin: '0 auto 20px auto', paddingBottom: '8px' }}>
                  Alex Chen
                </h2>

                <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 28px auto', lineHeight: '1.6' }}>
                  for successfully finishing and passing all core evaluation checkpoints for the awareness course
                  <strong style={{ display: 'block', color: 'var(--color-teal)', fontSize: '15px', marginTop: '6px' }}>"{selectedCert.courseName}"</strong>
                </p>

                {/* Footer signatures */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  borderTop: '1px dashed var(--border-hover)',
                  paddingTop: '20px',
                  fontSize: '11px',
                  color: 'var(--text-light)'
                }}>
                  <div>
                    <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>IT Security Team</div>
                    <span>Verify Node Signee</span>
                  </div>
                  <div>
                    <span>Verification ID: <strong style={{ color: 'var(--text-muted)' }}>PG-9824A</strong></span> <br />
                    <span>Earned: {selectedCert.dateEarned}</span>
                  </div>
                </div>

              </div>

            </div>

            <div className="modal-footer">
              <Button variant="secondary" onClick={() => setSelectedCert(null)}>Close View</Button>
              <Button variant="teal" icon={Download} onClick={handleDownload}>Download PDF</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Certificates;
