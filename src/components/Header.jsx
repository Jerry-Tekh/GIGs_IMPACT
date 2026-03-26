import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';
import logo from './../assets/logo.png';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.utility}>
        <div className={styles.utilityLinks}>
          <span>🔍 Search</span>
          <span>📍 Need Help</span>
          <span>En Español</span>
        </div>
        <button className={styles.donateTop}>DONATE</button>
      </div>

      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <NavLink to="/" onClick={closeMenu} className={styles.brandLink}>
            <img src={logo} alt="Organization Logo" />
            <span>GigImpact</span>
          </NavLink>
        </div>

        <button className={styles.hamburger} onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">☰</button>

        <ul className={`${styles.navLinks} ${isOpen ? styles.open : ''}`}>
          <li>
            <NavLink to="/" className={({isActive}) => isActive ? styles.activeLink : ''} onClick={closeMenu}>Home</NavLink>
          </li>
          <li>
            <NavLink to="/about" className={({isActive}) => isActive ? styles.activeLink : ''} onClick={closeMenu}>About</NavLink>
          </li>
          <li>
            <NavLink to="/programs" className={({isActive}) => isActive ? styles.activeLink : ''} onClick={closeMenu}>Programs</NavLink>
          </li>
          <li>
            <NavLink to="/blog" className={({isActive}) => isActive ? styles.activeLink : ''} onClick={closeMenu}>Blog</NavLink>
          </li>
          <li>
            <NavLink to="/#contact" onClick={closeMenu}>Contact</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;