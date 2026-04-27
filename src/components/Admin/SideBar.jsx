import { NavLink } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import styles from './Sidebar.module.css';
import logo from './../../assets/logo.png';

const Sidebar = ({ collapsed, onToggle, navItems = [] }) => {
  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarHeader}>
        {!collapsed && (
          <motion.div
            className={styles.logoWrap}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <img src={logo} alt="GigImpact Logo" className={styles.logoImg} />
            <span className={styles.logoText}>GigImpact</span>
          </motion.div>
        )}

        <motion.button 
          className={styles.toggleBtn}
          onClick={onToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <FaBars /> : <FaTimes />}
        </motion.button>
      </div>



      <nav className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.to} whileHover={{ x: 4 }}>
              <NavLink to={item.to} title={item.label} className={({ isActive }) => isActive ? styles.navActive : ''}>
                <Icon />
                <span>{item.label}</span>
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

    </div>
  );
};

export default Sidebar;
