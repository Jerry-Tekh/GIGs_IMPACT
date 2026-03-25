import React, { useState } from 'react';
import styles from './Header.module.css';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className={styles.header}>
      <div className={styles.utility}>
        <div className={styles.utilityLinks}>
          <span>🔍 Search</span><span>📍 Need Help</span><span>En Español</span>
        </div>
        <button className={styles.donateTop}>DONATE</button>
      </div>
      <nav className={styles.navbar}>
        <div className={styles.logo}>GIGs IMPACT</div>
        <button className={styles.hamburger} onClick={() => setIsOpen(!isOpen)}>☰</button>
        <ul className={`${styles.navLinks} ${isOpen ? styles.open : ''}`}>
          <li>HOME</li>
          <li>ABOUT</li>
          <li>PROGRAMS</li>
          <li>VOLUNTEER</li>
          <li>BLOG</li>
          <li>CONTACT</li>
        </ul>
      </nav>
    </header>
  );
};
export default Header;