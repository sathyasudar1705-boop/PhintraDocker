import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, RefreshCw, Key, Cpu, Database, Activity, Clock } from 'lucide-react';
import Button from '../../components/common/Button';
import { testAIConnection } from '../../services/huggingFaceService';

const AIDebug = () => {
  const [debugState, setDebugState] = useState(() => {
    if (typeof window !== 'undefined' && window.aiDebugState) {
      return { ...window.aiDebugState };
    }
    return {
      tokenLoaded: false,
      apiStatus: "Idle",
      modelStatus: "Unknown",
      lastError: "",
      lastResponseBody: "",
      activeModel: "mistralai/Mistral-7B-Instruct-v0.2",
      lastHttpStatus: null,
      lastParsedFormat: ""
    };
  });

  const [testing, setTesting] = useState(false);

  // Sync state with global window.aiDebugState in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.aiDebugState) {
        setDebugState({ ...window.aiDebugState });
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleRetest = async () => {
    setTesting(true);
    if (typeof window !== 'undefined' && window.aiDebugState) {
      window.aiDebugState.apiStatus = "Testing";
    }
    try {
      await testAIConnection();
    } catch (e) {
      console.error(e);
    } finally {
      setTesting(false);
      if (typeof window !== 'undefined' && window.aiDebugState) {
        setDebugState({ ...window.aiDebugState });
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Connected":
      case "Ready":
        return <span className="badge badge-success">Ready / Connected</span>;
      case "Testing":
      case "Retrying":
      case "Loading":
        return <span className="badge badge-warning">{status}</span>;
      case "Failed":
      case "Unavailable":
        return <span className="badge badge-danger">Failed / Unavailable</span>;
      default:
        return <span className="badge badge-medium">{status}</span>;
    }
  };

  return (
    <div className="animate-page-enter">
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>AI Service Diagnostics & Debugging Panel</h1>
          <p>Real-time monitor for Hugging Face Inference API integrations, token authorization, status codes, and parsing formats.</p>
        </div>
        <Button 
          onClick={handleRetest}
          variant="primary"
          icon={RefreshCw}
          disabled={testing}
          className={testing ? "btn-loading" : ""}
        >
          {testing ? "Testing..." : "Retest AI Connection"}
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Connection Status Card */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ 
              backgroundColor: debugState.apiStatus === "Connected" ? "var(--color-success-light)" : "var(--color-danger-light)",
              color: debugState.apiStatus === "Connected" ? "var(--color-success)" : "var(--color-danger)",
              padding: '10px',
              borderRadius: '8px'
            }}>
              <Activity size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>API Status</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>Dynamic connectivity to endpoints</p>
            </div>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Connection Status:</span>
              {getStatusBadge(debugState.apiStatus)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Last HTTP Status Code:</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: debugState.lastHttpStatus === 200 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {debugState.lastHttpStatus || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Model Status Card */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ 
              backgroundColor: debugState.modelStatus === "Ready" ? "var(--color-success-light)" : "var(--color-warning-light)",
              color: debugState.modelStatus === "Ready" ? "var(--color-success)" : "var(--color-warning)",
              padding: '10px',
              borderRadius: '8px'
            }}>
              <Cpu size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Active AI Model</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>Hugging Face model endpoint</p>
            </div>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }} title={debugState.activeModel}>
                Model ID:
              </span>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: '600', color: 'var(--text-main)' }}>
                {debugState.activeModel.split('/').pop()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Model Status:</span>
              {getStatusBadge(debugState.modelStatus)}
            </div>
          </div>
        </div>

        {/* Token Status Card */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ 
              backgroundColor: debugState.tokenLoaded ? "var(--color-success-light)" : "var(--color-danger-light)",
              color: debugState.tokenLoaded ? "var(--color-success)" : "var(--color-danger)",
              padding: '10px',
              borderRadius: '8px'
            }}>
              <Key size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Environment Token</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>HF_API_TOKEN verification</p>
            </div>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Token Loaded:</span>
              <span className={`badge ${debugState.tokenLoaded ? "badge-success" : "badge-danger"}`}>
                {debugState.tokenLoaded ? "Yes" : "No"}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Parsed Format:</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>
                {debugState.lastParsedFormat || "None"}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Error & Response Details Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Error Console */}
        <div className="saas-card" style={{ borderLeft: debugState.lastError ? '4px solid var(--color-danger)' : '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <ShieldAlert size={18} style={{ color: debugState.lastError ? 'var(--color-danger)' : 'var(--text-light)' }} />
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Last Error Details</h3>
          </div>
          {debugState.lastError ? (
            <div style={{ 
              backgroundColor: 'var(--color-danger-light)', 
              color: 'var(--color-danger)', 
              padding: '12px 16px', 
              borderRadius: '6px', 
              fontSize: '13px', 
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {debugState.lastError}
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--text-light)', fontStyle: 'italic' }}>No errors registered. The system is operating normally.</p>
          )}
        </div>

        {/* Response Body Raw Payload */}
        <div className="saas-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Database size={18} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Last API Raw Response Body</h3>
          </div>
          {debugState.lastResponseBody ? (
            <pre style={{ 
              backgroundColor: 'var(--text-main)', 
              color: '#38bdf8', 
              padding: '16px', 
              borderRadius: '8px', 
              fontSize: '12px', 
              overflowX: 'auto',
              fontFamily: 'monospace',
              maxHeight: '260px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {debugState.lastResponseBody}
            </pre>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--text-light)', fontStyle: 'italic' }}>No response data logged yet. Perform a query or retest connection to fetch data.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default AIDebug;
