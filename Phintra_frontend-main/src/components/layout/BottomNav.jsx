import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdHome, MdCampaign, MdPeople, MdBarChart, MdSmartToy } from 'react-icons/md';

const navItems = [
  { path: '/', label: 'Home', icon: MdHome },
  { path: '/campaigns', label: 'Campaigns', icon: MdCampaign },
  { path: '/employees', label: 'Employees', icon: MdPeople },
  { path: '/analytics', label: 'Analytics', icon: MdBarChart },
  { path: '/ai', label: 'AI Guard', icon: MdSmartToy },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Frosted glass nav bar */}
      <div
        className="mx-3 mb-3 rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(13, 13, 26, 0.85)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.path}
                className="relative flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-2xl min-w-0"
                onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.92 }}
              >
                {/* Active background pill */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background: 'rgba(59, 130, 246, 0.12)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                    />
                  )}
                </AnimatePresence>

                {/* Icon */}
                <motion.div
                  animate={{
                    color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.35)',
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon size={22} />
                </motion.div>

                {/* Label */}
                <motion.span
                  className="text-xs font-medium relative z-10 leading-none"
                  animate={{
                    color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.3)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{ fontSize: '10px' }}
                >
                  {item.label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};

export default BottomNav;
