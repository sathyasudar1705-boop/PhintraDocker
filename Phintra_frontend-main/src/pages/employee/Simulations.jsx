import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Eye, ShieldAlert, CheckCircle2, AlertOctagon, HelpCircle, Mail } from 'lucide-react';
import Button from '../../components/common/Button';

const UserSimulations = () => {
  const { simulations, reportCampaignEmail } = useAppContext();

  // Modal State
  const [selectedSim, setSelectedSim] = useState(null);
  const [reportingId, setReportingId] = useState(null);

  const handleReportSim = async (campaignId) => {
    setReportingId(campaignId);
    try {
      await reportCampaignEmail(campaignId);
    } catch (err) {
      alert("Error reporting simulation email");
    } finally {
      setReportingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Simulation Records</h1>
          <p>Review phishing simulation drills dispatched to your workstation and investigate specific attack red flags.</p>
        </div>
      </div>

      {/* Simulations Table */}
      {simulations.length === 0 ? (
        <div className="saas-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-light)' }}>
          <Mail size={48} style={{ color: 'var(--border-hover)', marginBottom: '16px' }} />
          <h3>No simulation history</h3>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>You have not participated in any phishing drills yet.</p>
        </div>
      ) : (
        <div className="saas-table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Drill Name</th>
                <th>Testing Date</th>
                <th>Difficulty</th>
                <th>Category</th>
                <th>Result Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {simulations.map((sim) => {
                const isReportable = sim.interaction_status !== 'Reported' && sim.interaction_status !== 'Clicked';
                return (
                  <tr key={sim.id}>
                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{sim.name}</td>
                    <td style={{ color: 'var(--text-light)' }}>{sim.date}</td>
                    <td>
                      <span className={`badge badge-${sim.difficulty.toLowerCase()}`}>
                        {sim.difficulty}
                      </span>
                    </td>
                    <td>{sim.templateCategory || "Suspicious Link"}</td>
                    <td>
                      <span className={`badge badge-${sim.result.toLowerCase()}`}>
                        {sim.result}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {isReportable && (
                          <Button 
                            variant="primary"
                            size="sm"
                            icon={ShieldAlert}
                            onClick={() => handleReportSim(sim.id)}
                            loading={reportingId === sim.id}
                            disabled={reportingId !== null}
                          >
                            Report
                          </Button>
                        )}
                        <Button 
                          variant="secondary"
                          size="sm"
                          icon={Eye}
                          onClick={() => setSelectedSim(sim)}
                        >
                          Inspect Drill
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Drill Details Modal */}
      {selectedSim && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h2>Drill Investigation Details</h2>
              <button onClick={() => setSelectedSim(null)} className="close-btn">&times;</button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Top stats */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{selectedSim.name}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Tested on: {selectedSim.date} | Time to action: {selectedSim.duration}</span>
                </div>
                <span className={`badge badge-${selectedSim.result.toLowerCase()}`}>
                  {selectedSim.result}
                </span>
              </div>

              {/* Forensic Red Flags Review */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>Attack Vector Forensic Breakdown</h4>
                
                {selectedSim.result === 'Failed' ? (
                  /* Failed context warning slide */
                  <div style={{
                    backgroundColor: 'var(--color-danger-light)',
                    border: '1px solid var(--color-danger-light)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px',
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <AlertOctagon size={20} style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#991b1b', display: 'block' }}>Vulnerability Flagged</strong>
                      <p style={{ fontSize: '12px', color: '#b91c1c', marginTop: '4px', lineHeight: '1.4' }}>
                        You clicked a link inside a simulated executive spoof email. Phishers use domain typos (like 'acme-corp-rewards.com' instead of 'acme.com') to harvest credentials.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Passed context check success slide */
                  <div style={{
                    backgroundColor: 'var(--color-success-light)',
                    border: '1px solid var(--color-success-light)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px',
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <CheckCircle2 size={20} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#065f46', display: 'block' }}>Threat Neutralized</strong>
                      <p style={{ fontSize: '12px', color: '#047857', marginTop: '4px', lineHeight: '1.4' }}>
                        Excellent! You successfully spotted the threat vectors (suspicious sender domain name, urgent prompt context) and avoided compromise.
                      </p>
                    </div>
                  </div>
                )}

                {/* Phishing red flags list */}
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>Critical Red Flags to Look Out For</h4>
                <ul style={{ paddingLeft: '20px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: '1.5' }}>
                  <li><strong>Display Name Spoofing:</strong> Attackers name their display account 'Help Desk' but send from an unverified public domain.</li>
                  <li><strong>Emotional Urgency Cues:</strong> Commands like 'MUST ACT NOW to prevent termination' manipulate fast emotional choices.</li>
                  <li><strong>Lookalike Hyperlinks:</strong> Hovering links exposes they redirect to unverified external infrastructures (e.g. net vs com).</li>
                </ul>
              </div>

              {/* Recommendations */}
              <div style={{
                backgroundColor: 'var(--color-primary-light)',
                border: '1px solid #bfdbfe',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--color-primary-hover)'
              }}>
                <strong style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Recommended Action Item</strong>
                <span>Please complete the <strong>"Social Engineering 101"</strong> training module to boost your email audit capabilities by 15%.</span>
              </div>

            </div>
            
            <div className="modal-footer">
              <Button variant="primary" onClick={() => setSelectedSim(null)}>Close Inspection</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserSimulations;
