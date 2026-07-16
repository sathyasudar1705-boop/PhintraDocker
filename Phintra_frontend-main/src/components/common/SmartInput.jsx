import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Check, Loader, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SmartInput = ({ value, onChange, placeholder, style, className, type = 'text', ...props }) => {
  const [isImproving, setIsImproving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hints, setHints] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const debounceRef = useRef(null);

  const isTextInput = type === 'text' || type === 'email';

  // Debounced real-time grammar check
  useEffect(() => {
    if (!isTextInput || !value || value.trim().length === 0) {
      setHints([]);
      return;
    }
    
    setIsTyping(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsTyping(false);
      try {
        const params = new URLSearchParams();
        params.append('text', value);
        params.append('language', 'en-US');

        const response = await fetch('https://api.languagetool.org/v2/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: params
        });

        if (response.ok) {
          const data = await response.json();
          setHints(data.matches || []);
        }
      } catch (error) {
        console.error("Real-time check failed", error);
      }
    }, 1200);

    return () => clearTimeout(debounceRef.current);
  }, [value, isTextInput]);

  const improveGrammar = async () => {
    if (!value || value.trim().length === 0) return;
    setIsImproving(true);

    try {
      const params = new URLSearchParams();
      params.append('text', value);
      params.append('language', 'en-US');

      const response = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: params
      });

      if (!response.ok) throw new Error('API error');
      
      const data = await response.json();
      
      if (data.matches && data.matches.length > 0) {
        applyAllMatches(data.matches);
      } else {
        setIsImproving(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (error) {
      console.error("Grammar improvement failed:", error);
      setIsImproving(false);
    }
  };

  const applyAllMatches = (matchesToApply) => {
    let improvedText = value;
    const sortedMatches = [...matchesToApply].sort((a, b) => b.offset - a.offset);
    
    sortedMatches.forEach(match => {
      if (match.replacements && match.replacements.length > 0) {
        const replacement = match.replacements[0].value;
        improvedText = 
          improvedText.substring(0, match.offset) + 
          replacement + 
          improvedText.substring(match.offset + match.length);
      }
    });
    
    if (onChange) {
      onChange({ target: { value: improvedText, name: props.name } });
    }

    setHints([]);
    setShowHints(false);
    setIsImproving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const applySingleHint = (match) => {
    applyAllMatches([match]);
  };

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        spellCheck={isTextInput}
        onFocus={() => setShowHints(true)}
        style={{ 
          ...style, 
          paddingRight: isTextInput ? '36px' : undefined,
          borderBottom: showHints && hints.length > 0 ? '2px solid #f87171' : undefined
        }}
        {...props}
      />
      
      {isTextInput && (
        <div style={{ position: 'absolute', right: '6px', display: 'flex', gap: '4px', zIndex: 10 }}>
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                style={{
                  background: '#10b981', color: '#fff', padding: '2px 6px', borderRadius: '4px',
                  fontSize: '9px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px'
                }}
              >
                <Check size={10} />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={improveGrammar}
            disabled={isImproving || showSuccess}
            title={hints.length > 0 ? `Fix ${hints.length} issue(s)` : "Auto-fix Spelling & Grammar"}
            style={{
              background: 'transparent',
              color: hints.length > 0 ? '#ef4444' : (isImproving ? '#94a3b8' : '#6366f1'), 
              border: 'none', 
              borderRadius: '50%',
              width: '24px', height: '24px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: isImproving ? 'wait' : 'pointer',
              opacity: value?.length > 0 ? 1 : 0.4,
              transition: 'all 0.2s',
              position: 'relative'
            }}
          >
            {isImproving ? (
              <Loader size={14} className="lucide-spin" />
            ) : hints.length > 0 ? (
              <>
                <AlertCircle size={14} />
                <span style={{ position: 'absolute', top: '0px', right: '0px', background: '#ef4444', color: '#fff', fontSize: '8px', fontWeight: 'bold', width: '12px', height: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {hints.length}
                </span>
              </>
            ) : (
              <Sparkles size={14} />
            )}
          </button>
        </div>
      )}

      {/* Hints Dropdown Panel */}
      <AnimatePresence>
        {isTextInput && showHints && hints.length > 0 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              zIndex: 50,
              maxHeight: '200px',
              overflowY: 'auto'
            }}
          >
            <div style={{ padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Grammar Hints</span>
              <button type="button" onClick={() => setShowHints(false)} style={{ background: 'none', border: 'none', fontSize: '11px', color: '#94a3b8', cursor: 'pointer' }}>Close</button>
            </div>
            
            {hints.map((hint, idx) => (
              <div key={idx} style={{ padding: '12px', borderBottom: idx < hints.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <p style={{ fontSize: '13px', color: '#334155', margin: '0 0 6px 0' }}>{hint.message}</p>
                {hint.replacements && hint.replacements.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {hint.replacements.slice(0, 3).map((rep, rIdx) => (
                      <button
                        type="button"
                        key={rIdx}
                        onClick={() => applySingleHint(hint)}
                        style={{
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          color: '#059669',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {rep.value}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .lucide-spin { animation: lucide-spin 1s linear infinite; }
        @keyframes lucide-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SmartInput;
