import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const resolveRef   = useRef(null);
  const triggerRef   = useRef(null);
  const confirmBtnRef = useRef(null);
  const cancelBtnRef  = useRef(null);

  const confirm = useCallback(({ title, description, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger', icon: IconOverride } = {}) => {
    triggerRef.current = document.activeElement;
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ title, description, confirmText, cancelText, variant, icon: IconOverride });
    });
  }, []);

  const handleConfirm = () => {
    if (resolveRef.current) resolveRef.current(true);
    setState(null);
    if (triggerRef.current?.focus) setTimeout(() => triggerRef.current.focus(), 0);
  };

  const handleCancel = () => {
    if (resolveRef.current) resolveRef.current(false);
    setState(null);
    if (triggerRef.current?.focus) setTimeout(() => triggerRef.current.focus(), 0);
  };

  // Focus cancel button when modal opens
  useEffect(() => {
    if (state && cancelBtnRef.current) cancelBtnRef.current.focus();
  }, [state]);

  // Close on Escape
  useEffect(() => {
    if (!state) return;
    const onKey = (e) => { if (e.key === 'Escape') handleCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [state]);

  const ModalIcon = state?.icon || AlertTriangle;
  const isDanger  = state?.variant === 'danger';

  // Detect page context from current URL
  const isEmployeePage = typeof window !== 'undefined' && window.location.pathname.startsWith('/user');

  /* ═══════════════════════════════════════════════════
     EMPLOYEE — Gaming light style palette
  ═══════════════════════════════════════════════════ */
  const accent     = isDanger ? '#ef4444' : '#2563eb';
  const accentDeep = isDanger ? '#dc2626' : '#1d4ed8';
  const accentGlow = isDanger ? 'rgba(239,68,68,0.22)' : 'rgba(37,99,235,0.2)';
  const accentSoft = isDanger ? 'rgba(239,68,68,0.08)' : 'rgba(37,99,235,0.08)';
  const accentMid  = isDanger ? 'rgba(239,68,68,0.18)' : 'rgba(37,99,235,0.14)';

  /* ═══════════════════════════════════════════════════
     ADMIN — Professional style palette
  ═══════════════════════════════════════════════════ */
  const adminAccent = isDanger ? '#dc2626' : '#2563eb';
  const adminLight  = isDanger ? '#fef2f2' : '#eff6ff';
  const adminBorder = isDanger ? '#fca5a5' : '#bfdbfe';

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {state && (
        <>
          {/* ── EMPLOYEE: Gaming Light Modal ── */}
          {isEmployeePage && (
            <div
              className="gcm-backdrop"
              role="dialog" aria-modal="true"
              aria-labelledby="gcm-title" aria-describedby="gcm-desc"
              onClick={handleCancel}
            >
              <div
                className="gcm-card"
                onClick={(e) => e.stopPropagation()}
                style={{
                  border: `1.5px solid ${accent}`,
                  boxShadow: `0 0 0 4px ${accentGlow}, 0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)`,
                }}
              >
                {/* Shimmer sweep */}
                <div className="gcm-shimmer" aria-hidden="true" />

                {/* Corner brackets */}
                {[
                  { top: 10, left: 10,     bT: true,  bL: true,  r: '3px 0 0 0' },
                  { top: 10, right: 10,    bT: true,  bR: true,  r: '0 3px 0 0' },
                  { bottom: 10, left: 10,  bB: true,  bL: true,  r: '0 0 0 3px' },
                  { bottom: 10, right: 10, bB: true,  bR: true,  r: '0 0 3px 0' },
                ].map(({ bT, bB, bL, bR, r, ...pos }, i) => (
                  <div key={i} style={{
                    position: 'absolute', width: 16, height: 16,
                    borderColor: accent, borderStyle: 'solid',
                    borderTopWidth: bT ? 2 : 0, borderBottomWidth: bB ? 2 : 0,
                    borderLeftWidth: bL ? 2 : 0, borderRightWidth: bR ? 2 : 0,
                    borderRadius: r, opacity: 0.7, ...pos,
                  }} />
                ))}

                {/* System label */}
                <div className="gcm-system-label"
                  style={{ color: accent, background: accentSoft, border: `1px solid ${accentMid}` }}
                >
                  ⚠ &nbsp;SYSTEM ALERT
                </div>

                {/* Icon with rotating rings */}
                <div className="gcm-icon-wrap">
                  <div className="gcm-ring gcm-ring--outer" style={{ borderColor: accent }} />
                  <div className="gcm-ring gcm-ring--inner" style={{ borderColor: accent }} />
                  <div className="gcm-icon-circle"
                    style={{ background: accentSoft, border: `2px solid ${accent}`, boxShadow: `0 0 0 6px ${accentGlow}` }}
                  >
                    <ModalIcon size={30} style={{ color: accent, filter: `drop-shadow(0 0 4px ${accentGlow})` }} />
                  </div>
                </div>

                <h3 id="gcm-title" className="gcm-title" style={{ color: '#0f172a' }}>
                  {state.title}
                </h3>
                {state.description && (
                  <p id="gcm-desc" className="gcm-desc">{state.description}</p>
                )}

                <div className="gcm-divider"
                  style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                />

                <div className="gcm-buttons">
                  <button ref={cancelBtnRef} onClick={handleCancel} className="gcm-btn gcm-btn--cancel">
                    {state.cancelText}
                  </button>
                  <button
                    ref={confirmBtnRef} onClick={handleConfirm}
                    className="gcm-btn gcm-btn--confirm"
                    style={{
                      background: `linear-gradient(135deg, ${accent}, ${accentDeep})`,
                      border: `1px solid ${accent}`,
                      boxShadow: `0 0 14px ${accentGlow}, 0 4px 12px rgba(0,0,0,0.12)`,
                    }}
                  >
                    {state.confirmText}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── ADMIN: Professional Clean Modal ── */}
          {!isEmployeePage && (
            <div
              className="adm-backdrop"
              role="dialog" aria-modal="true"
              aria-labelledby="adm-title" aria-describedby="adm-desc"
              onClick={handleCancel}
            >
              <div className="adm-card" onClick={(e) => e.stopPropagation()}>
                {/* Icon */}
                <div className="adm-icon-wrap"
                  style={{ background: adminLight, border: `1px solid ${adminBorder}` }}
                >
                  <ModalIcon size={26} style={{ color: adminAccent }} />
                </div>

                {/* Title */}
                <h3 id="adm-title" className="adm-title">{state.title}</h3>

                {/* Description */}
                {state.description && (
                  <p id="adm-desc" className="adm-desc">{state.description}</p>
                )}

                {/* Buttons */}
                <div className="adm-buttons">
                  <button ref={cancelBtnRef} onClick={handleCancel} className="adm-btn adm-btn--cancel">
                    {state.cancelText}
                  </button>
                  <button
                    ref={confirmBtnRef} onClick={handleConfirm}
                    className="adm-btn adm-btn--confirm"
                    style={{
                      background: adminAccent,
                      border: `1px solid ${adminAccent}`,
                    }}
                  >
                    {state.confirmText}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        /* ══════════════════════════════════════
           EMPLOYEE — Gaming Light Styles
        ══════════════════════════════════════ */
        .gcm-backdrop {
          position: fixed; inset: 0;
          background: rgba(15, 23, 42, 0.35);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 99999;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .gcm-card {
          position: relative;
          width: 100%; max-width: 400px;
          background: #ffffff;
          border-radius: 20px;
          padding: 44px 32px 30px;
          text-align: center;
          overflow: hidden;
          font-family: 'Inter', 'Outfit', sans-serif;
          animation: gcmIn 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes gcmIn {
          from { opacity: 0; transform: scale(0.86) translateY(18px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .gcm-shimmer {
          position: absolute; top: 0; left: -60%;
          width: 40%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: gcmShimmer 3.5s ease-in-out infinite;
          pointer-events: none; z-index: 0;
        }
        @keyframes gcmShimmer { 0% { left: -60%; } 100% { left: 130%; } }

        .gcm-system-label {
          position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
          font-size: 8px; font-weight: 800; letter-spacing: 0.18em;
          text-transform: uppercase; white-space: nowrap;
          padding: 3px 10px; border-radius: 99px; z-index: 2;
        }
        .gcm-icon-wrap {
          position: relative; display: flex; align-items: center; justify-content: center;
          width: 96px; height: 96px; margin: 0 auto 20px; z-index: 2;
        }
        .gcm-ring {
          position: absolute; border-style: dashed;
          border-width: 1.5px; border-radius: 50%; pointer-events: none;
        }
        .gcm-ring--outer { inset: 0; opacity: 0.2; animation: gcmCW 8s linear infinite; }
        .gcm-ring--inner { inset: 12px; opacity: 0.14; animation: gcmCCW 5s linear infinite; }
        @keyframes gcmCW  { to { transform: rotate(360deg);  } }
        @keyframes gcmCCW { to { transform: rotate(-360deg); } }
        .gcm-icon-circle {
          width: 62px; height: 62px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          animation: gcmPulse 2s ease-in-out infinite; z-index: 1;
        }
        @keyframes gcmPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.06); }
        }
        .gcm-title {
          font-size: 19px; font-weight: 900; margin: 0 0 8px;
          letter-spacing: -0.02em; z-index: 2; position: relative;
        }
        .gcm-desc {
          font-size: 13px; color: #64748b; line-height: 1.65;
          margin: 0 0 20px; font-weight: 500; z-index: 2; position: relative;
        }
        .gcm-divider {
          height: 1px; opacity: 0.28; margin-bottom: 20px;
          z-index: 2; position: relative;
        }
        .gcm-buttons {
          display: flex; gap: 10px; z-index: 2; position: relative;
        }
        .gcm-btn {
          flex: 1; padding: 11px 16px; border-radius: 10px;
          font-size: 13px; font-weight: 800; letter-spacing: 0.04em;
          cursor: pointer; transition: all 0.18s ease;
          font-family: inherit; text-transform: uppercase;
        }
        .gcm-btn--cancel {
          background: #f8fafc; border: 1px solid #e2e8f0; color: #475569;
        }
        .gcm-btn--cancel:hover {
          background: #f1f5f9; border-color: #cbd5e1; color: #334155;
          transform: translateY(-1px); box-shadow: 0 4px 10px rgba(0,0,0,0.06);
        }
        .gcm-btn--cancel:active { transform: translateY(0) scale(0.98); }
        .gcm-btn--confirm { color: #ffffff; text-shadow: 0 1px 2px rgba(0,0,0,0.18); }
        .gcm-btn--confirm:hover {
          transform: translateY(-1px); filter: brightness(1.08);
        }
        .gcm-btn--confirm:active { transform: translateY(0) scale(0.98); }

        /* ══════════════════════════════════════
           ADMIN — Professional Clean Styles
        ══════════════════════════════════════ */
        .adm-backdrop {
          position: fixed; inset: 0;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 99999;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .adm-card {
          width: 100%; max-width: 420px;
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05);
          padding: 32px 28px 24px;
          text-align: center;
          font-family: 'Inter', sans-serif;
          animation: admIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes admIn {
          from { opacity: 0; transform: scale(0.94) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .adm-icon-wrap {
          width: 56px; height: 56px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px;
        }
        .adm-title {
          font-size: 17px; font-weight: 700; color: #0f172a;
          margin: 0 0 8px; letter-spacing: -0.02em;
        }
        .adm-desc {
          font-size: 13px; color: #64748b;
          line-height: 1.6; margin: 0 0 24px; font-weight: 400;
        }
        .adm-buttons {
          display: flex; gap: 10px;
        }
        .adm-btn {
          flex: 1; padding: 10px 16px; border-radius: 8px;
          font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.15s ease;
          font-family: inherit;
        }
        .adm-btn--cancel {
          background: #f8fafc; border: 1px solid #e2e8f0; color: #475569;
        }
        .adm-btn--cancel:hover {
          background: #f1f5f9; border-color: #cbd5e1; color: #334155;
        }
        .adm-btn--cancel:active { opacity: 0.85; }
        .adm-btn--confirm { color: #ffffff; }
        .adm-btn--confirm:hover { filter: brightness(1.08); }
        .adm-btn--confirm:active { filter: brightness(0.95); }
      `}</style>
    </ConfirmContext.Provider>
  );
};

export const useConfirmContext = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirmContext must be used within a ConfirmProvider');
  }
  return context;
};
