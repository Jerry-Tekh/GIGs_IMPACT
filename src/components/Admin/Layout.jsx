import { useEffect, useState } from 'react';
import Sidebar from './SideBar.jsx';
import Topbar from './TopBar.jsx';
import styles from './Layout.module.css';

const Layout = ({ children, user, title, navItems = [] }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
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
    <div className={`${styles.adminLayout} ${sidebarCollapsed ? styles.layoutCollapsed : ''}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        navItems={navItems}
        user={user}
      />
      {isMobile && !sidebarCollapsed && <div className={styles.backdrop} onClick={toggleSidebar} />}
      <div className={styles.mainContent}>
        <div className={styles.topbarShell}>
          <Topbar onMenuClick={toggleSidebar} user={user} title={title} />
        </div>
        <div className={styles.pageContent}>{children}</div>
      </div>
    </div>
  );
};

export default Layout;
