import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Header.module.css';
import logo from './../assets/logo.png';
import { RxHamburgerMenu } from 'react-icons/rx';
import { smoothScrollToY } from '../utils/smoothScroll.js';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const closeMenu = () => setIsOpen(false);

  const scrollToTop = () => {
    smoothScrollToY(0);
  };

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`} initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <motion.nav className={styles.navbar} transition={{ duration: 0.3 }}>
        <div className={styles.logo}>
          <NavLink to="/" onClick={() => { closeMenu(); scrollToTop(); }} className={styles.brandLink}>
            <img src={logo} alt="Organization Logo" />
          </NavLink>
        </div>

        <motion.button
          className={styles.hamburger}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
        >
          <RxHamburgerMenu />
        </motion.button>

        <motion.ul className={`${styles.navLinks} ${isOpen ? styles.open : ''}`} initial={false} animate={{ opacity: 1 }}>
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? styles.activeLink : '')} onClick={() => { closeMenu(); scrollToTop(); }}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={({ isActive }) => (isActive ? styles.activeLink : '')} onClick={closeMenu}>
              About
            </NavLink>
          </li>
          <li>
            <NavLink to="/programs" className={({ isActive }) => (isActive ? styles.activeLink : '')} onClick={closeMenu}>
              Programs
            </NavLink>
          </li>
          <li>
            <NavLink to="/blog" className={({ isActive }) => (isActive ? styles.activeLink : '')} onClick={closeMenu}>
              Blog
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" className={({ isActive }) => (isActive ? styles.activeLink : '')} onClick={() => { closeMenu(); scrollToTop(); }}>
              Contact
            </NavLink>
          </li>
        </motion.ul>
      </motion.nav>
    </motion.header>
  );
};

export default Header;
