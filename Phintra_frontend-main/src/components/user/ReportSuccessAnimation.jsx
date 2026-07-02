import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ReportSuccessAnimation = ({ trigger }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (trigger) {
      const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
      const newParticles = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: 0,
        y: 0,
        targetX: (Math.random() - 0.5) * 350,
        targetY: -150 - Math.random() * 200,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 6,
        rotate: Math.random() * 360,
        targetRotate: Math.random() * 720
      }));
      setParticles(newParticles);
      
      const timer = setTimeout(() => {
        setParticles([]);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 1, rotate: p.rotate, opacity: 1 }}
          animate={{
            x: p.targetX,
            y: [p.targetY, p.targetY + 400],
            rotate: p.targetRotate,
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: 2.2,
            ease: 'easeOut'
          }}
          style={{
            position: 'absolute',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '3px'
          }}
        />
      ))}
    </div>
  );
};

export default ReportSuccessAnimation;
