import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const EmployeeEntryAnimation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/user/dashboard', { replace: true });
    }, 2800);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="entry-splash-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="entry-splash-content"
      >
        {/* Futuristic Glowing Outer Ring */}
        <div className="radar-sweep-outer">
          <div className="radar-sweep-line"></div>
          {/* Centered Image */}
          <div className="entry-media-wrapper">
            <img
              src="/entry_loader.gif"
              alt="Security Dashboard Loader"
              className="entry-media-img"
              onError={(e) => {
                // Fallback to standard png if gif has format issues
                e.target.src = '/entry_loader.png';
              }}
            />
          </div>
        </div>

        {/* Text and Progress bar below */}
        <div className="entry-text-container">
          <h2 className="entry-title-text">ACCESSING SECURE NODE</h2>
          <div className="loading-bar-wrapper">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.5, ease: 'easeInOut' }}
              className="loading-bar-fill"
            />
          </div>
          <p className="entry-subtitle-text">Preparing your security dashboard...</p>
        </div>
      </motion.div>

      <style>{`
        .entry-splash-container {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at center, #0B1528 0%, #050811 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          overflow: hidden;
          width: 100vw;
          height: 100vh;
        }

        .entry-splash-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 36px;
        }

        .radar-sweep-outer {
          position: relative;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          border: 1.5px solid rgba(6, 182, 212, 0.25);
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(6, 182, 212, 0.02);
        }

        .radar-sweep-line {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid transparent;
          border-top-color: #06b6d4;
          animation: spinRadar 2s linear infinite;
        }

        .entry-media-wrapper {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.15);
          box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
        }

        .entry-media-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .entry-text-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }

        .entry-title-text {
          font-family: 'Orbitron', 'Inter', sans-serif !important;
          font-size: 14px;
          font-weight: 800;
          color: #06b6d4;
          letter-spacing: 0.25em;
          margin: 0;
          text-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }

        .loading-bar-wrapper {
          width: 240px;
          height: 3px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 99px;
          overflow: hidden;
          border: 0.5px solid rgba(255, 255, 255, 0.03);
        }

        .loading-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #0d9488 0%, #06b6d4 100%);
          box-shadow: 0 0 8px #06b6d4;
          border-radius: 99px;
        }

        .entry-subtitle-text {
          font-family: 'Rajdhani', sans-serif !important;
          font-size: 15px;
          color: #94a3b8;
          font-weight: 600;
          margin: 0;
          letter-spacing: 0.04em;
        }

        @keyframes spinRadar {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EmployeeEntryAnimation;
