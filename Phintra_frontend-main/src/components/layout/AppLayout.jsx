import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from './BottomNav';
import CyberBackground from '../ui/CyberBackground';
import { useLocation } from 'react-router-dom';

const pageVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
};

const AppLayout = () => {
  const location = useLocation();

  return (
    <div className="relative min-h-dvh" style={{ background: '#080810' }}>
      <CyberBackground />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-dvh">
        {/* Page content with page transition */}
        <main className="flex-1 overflow-y-auto pb-28" style={{ overscrollBehavior: 'contain' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default AppLayout;
