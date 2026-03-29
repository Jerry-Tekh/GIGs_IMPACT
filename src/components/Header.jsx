import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';
import logo from './../assets/logo.png';
import { RxHamburgerMenu } from "react-icons/rx";


const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

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
          <NavLink to="/" onClick={() => { closeMenu(); scrollToTop(); }} className={styles.brandLink}>
            <img src={logo} style={{ width: '50px', height: 'auto' }} alt="Organization Logo" />
         
          </NavLink>
        </div>

        <button className={styles.hamburger} onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu"><RxHamburgerMenu /></button>

        <ul className={`${styles.navLinks} ${isOpen ? styles.open : ''}`}>
          <li>
            <NavLink to="/" className={({isActive}) => isActive ? styles.activeLink : ''} onClick={() => { closeMenu(); scrollToTop(); }}>Home</NavLink>
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