import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import { ShieldCheck, Trophy } from 'lucide-react';

const ReportSuccessModal = ({ isOpen, onClose, xpReward = 100 }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '480px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}
          >
            {/* Generated Success Illustration */}
            <div style={{
              width: '100%',
              height: '160px',
              background: '#f8fafc',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              overflow: 'hidden',
              border: '1px solid #f1f5f9'
            }}>
              <img 
                src="/images/report_success.png" 
                alt="Report Success Illustration" 
                style={{ height: '90%', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            </div>

            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
            }}>
              <ShieldCheck size={28} />
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              Great job! You helped protect your organization.
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: '1.6', marginBottom: '24px' }}>
              The email has been successfully isolated and reported to our Corporate IT Security Operations team for immediate review.
            </p>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#fff7ed',
                border: '1px solid #ffedd5',
                padding: '8px 20px',
                borderRadius: '12px',
                color: '#d97706',
                fontWeight: '800',
                fontSize: '14px',
                marginBottom: '28px'
              }}
            >
              <Trophy size={16} />
              <span>+{xpReward} XP Reward Claimed!</span>
            </motion.div>

            <Button
              variant="primary"
              onClick={onClose}
              style={{ width: '100%', borderRadius: '12px', fontWeight: '750', height: '42px' }}
            >
              Back to Portal
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReportSuccessModal;
