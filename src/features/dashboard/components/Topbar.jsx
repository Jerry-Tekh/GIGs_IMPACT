import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBars, FaSignOutAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import styles from './Topbar.module.css';
import logo from '../../../assets/logo.png';
import { logoutUser } from '../../../utils/auth.js';

const Topbar = ({ onMenuClick, user, title }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  return (
    <motion.div 
      className={styles.topbar}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.topbarLeft}>
        <motion.button 
          className={styles.mobileMenuBtn}
          onClick={onMenuClick}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </motion.button>

        <motion.button
          className={styles.logoBtn}
          onClick={handleLogoClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Go to homepage"
          aria-label="Home"
        >
          <img src={logo} alt="GigImpact Logo" className={styles.logoImg} />
          <span className={styles.logoText}>GigImpact</span>
        </motion.button>
      </div>

      <div className={styles.titleBlock}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.welcomeText}>
          Welcome {user?.name || 'your dashboard'}
        </p>
      </div>

      <div className={styles.topbarRight}>
        <motion.button
          className={styles.blogBtn}
          onClick={() => navigate('/blog')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          title="Back to blog"
          aria-label="Back to blog"
        >
          <FaArrowLeft />
          <span>Back to Blog</span>
        </motion.button>

        <motion.button
          className={styles.logoutBtn}
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          title="Logout"
          aria-label="Logout"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Topbar;
