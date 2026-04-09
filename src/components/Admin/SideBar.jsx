import { NavLink } from 'react-router-dom';
import { FaHome, FaPlus, FaList, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import styles from './Sidebar.module.css';


const Sidebar = ({ collapsed, onToggle }) => {
  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.logo}>GigImpact</h2>
        <button 
          className={styles.toggleBtn}
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      <nav>
        <NavLink to="/admin/dashboard" title="Dashboard">
          <FaHome /> <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/createPost" title="Create Post">
          <FaPlus /> <span>Create Post</span>
        </NavLink>

        <NavLink to="/admin/posts" title="Manage Posts">
          <FaList /> <span>Manage Posts</span>
        </NavLink>
      </nav>

      <button className={styles.logoutBtn} title="Logout">
        <FaSignOutAlt /> <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;