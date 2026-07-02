import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Trophy, Clock, CheckCircle } from 'lucide-react';
import Button from '../common/Button';

const TrainingCard = ({ module, onStart, onResume }) => {
  const isCompleted = module.progress >= 100 || module.isCompleted || module.status === 'completed';
  const progressPercent = module.progress || (module.status === 'completed' ? 100 : module.status === 'in_progress' ? 50 : 0);

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return { bg: '#ecfdf5', text: '#059669' };
      case 'hard':
        return { bg: '#fdf2f2', text: '#ef4444' };
      default: // medium
        return { bg: '#fffbeb', text: '#d97706' };
    }
  };

  const diffColors = getDifficultyColor(module.difficulty || 'Medium');

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 12px 28px rgba(0, 0, 0, 0.06)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
        position: 'relative'
      }}
    >
      {/* Card Header Illustration / Gradient */}
      <div style={{
        height: '110px',
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <BookOpen size={36} style={{ color: '#2563eb', opacity: 0.7 }} />
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: '#10b981',
              color: '#ffffff',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
            }}
          >
            <CheckCircle size={16} />
          </motion.div>
        )}
      </div>

      {/* Card Body */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span style={{
              background: diffColors.bg,
              color: diffColors.text,
              fontSize: '11px',
              fontWeight: '800',
              padding: '2px 8px',
              borderRadius: '99px',
              textTransform: 'uppercase'
            }}>
              {module.difficulty || 'Medium'}
            </span>
            <span style={{
              background: '#fff7ed',
              color: '#ea580c',
              fontSize: '11px',
              fontWeight: '800',
              padding: '2px 8px',
              borderRadius: '99px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <Trophy size={10} />
              +{module.xp_reward || module.xp || 100} XP
            </span>
          </div>

          <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', lineHeight: '1.4' }}>
            {module.title || module.name}
          </h4>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', display: 'webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px' }}>
            {module.description}
          </p>
        </div>

        <div>
          {/* Progress Section */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '750', color: '#64748b', marginBottom: '4px' }}>
              <span>Course Progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: isCompleted ? '#10b981' : '#2563eb',
                borderRadius: '99px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Button CTA */}
          {isCompleted ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onResume}
              style={{ width: '100%', fontWeight: '700', borderRadius: '10px' }}
            >
              Review Module
            </Button>
          ) : (
            <Button
              variant={progressPercent > 0 ? 'teal' : 'primary'}
              size="sm"
              onClick={progressPercent > 0 ? onResume : onStart}
              style={{ width: '100%', fontWeight: '700', borderRadius: '10px' }}
            >
              {progressPercent > 0 ? 'Resume Course' : 'Start Course'}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TrainingCard;
