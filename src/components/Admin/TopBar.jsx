
import { FaBars } from 'react-icons/fa';
import styles from './Topbar.module.css';


const Topbar = ({ onMenuClick }) => {
  return (
    <div className={styles.topbar}>
      <button 
        className={styles.mobileMenuBtn}
        onClick={onMenuClick}
        aria-label="Toggle sidebar"
      >
        <FaBars />
      </button>
      <h3>Admin Dashboard</h3>
    </div>
  );
};

export default Topbar;