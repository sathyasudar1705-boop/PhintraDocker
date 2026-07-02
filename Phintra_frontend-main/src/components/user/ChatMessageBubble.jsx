import React from 'react';
import { motion } from 'framer-motion';

const ChatMessageBubble = ({ message, isAdmin }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignSelf: isAdmin ? 'flex-start' : 'flex-end',
        maxWidth: '70%',
        backgroundColor: isAdmin ? '#ffffff' : '#2563eb',
        color: isAdmin ? '#0f172a' : '#ffffff',
        border: '1px solid ' + (isAdmin ? '#e2e8f0' : '#2563eb'),
        borderRadius: isAdmin ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
        padding: '12px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        marginBottom: '8px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', fontWeight: '800', opacity: 0.9 }}>
          {isAdmin ? 'Security Admin' : 'You'}
        </span>
        <span style={{ fontSize: '9.5px', opacity: 0.7 }}>
          {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </span>
      </div>
      <p style={{ fontSize: '13px', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
        {message.message_text}
      </p>
    </motion.div>
  );
};

export default ChatMessageBubble;
