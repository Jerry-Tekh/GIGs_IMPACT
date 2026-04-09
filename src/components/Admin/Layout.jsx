
import { useState, useEffect } from 'react';
import Sidebar from './SideBar.jsx';
import Topbar from './TopBar.jsx';
import styles from './Layout.module.css';



const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Default to collapsed on mobile, expanded on desktop
    return window.innerWidth < 768;
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={styles.adminLayout}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      {isMobile && !sidebarCollapsed && <div className={styles.backdrop} onClick={toggleSidebar}></div>}
      <div className={`${styles.mainContent} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        <Topbar onMenuClick={toggleSidebar} />
        <div className={styles.pageContent}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;