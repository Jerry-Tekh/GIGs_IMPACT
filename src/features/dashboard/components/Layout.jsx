import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './SideBar.jsx';
import Topbar from './TopBar.jsx';
import DashboardSettingsPanel from './DashboardSettingsPanel.jsx';
import styles from './Layout.module.css';

const MOBILE_BREAKPOINT = 768;

const Layout = ({ children, user, title, navItems = [], refreshUser }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth <= MOBILE_BREAKPOINT);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((current) => !current);
  };

  return (
    <div
      className={[
        styles.adminLayout,
        sidebarCollapsed ? styles.layoutCollapsed : '',
        isMobile && !sidebarCollapsed ? styles.mobileSidebarOpen : ''
      ].filter(Boolean).join(' ')}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        onOpenSettings={() => setSettingsOpen(true)}
        navItems={navItems}
        user={user}
      />
      {isMobile && !sidebarCollapsed && <div className={styles.backdrop} onClick={toggleSidebar} />}
      <div className={styles.mainContent}>
        <div className={styles.topbarShell}>
          <Topbar
            onMenuClick={toggleSidebar}
            user={user}
            title={title}
          />
        </div>
        <motion.div
          className={styles.pageContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </div>
      <DashboardSettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
        onUserUpdated={refreshUser}
      />
    </div>
  );
};

export default Layout;
