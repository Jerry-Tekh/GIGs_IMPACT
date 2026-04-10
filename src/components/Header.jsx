import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    <motion.header 
      className={styles.header}
      initial={{ backgroundColor: 'transparent' }}
      whileInView={{ backgroundColor: '#fff' }} // adjust
      transition={{ duration: 1 }}
    >
      <motion.div 
        className={styles.utility}
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/*<div className={styles.utilityLinks}>
          <span>🔍 Search</span>
          <span>📍 Need Help</span>
          
        </div>*/}
        <motion.button 
          className={styles.donateTop}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          DONATE
        </motion.button>
      </motion.div>

      <motion.nav 
        className={styles.navbar}
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className={styles.logo}>
          <NavLink to="/" onClick={() => { closeMenu(); scrollToTop(); }} className={styles.brandLink}>
            <motion.img 
              src={logo} 
              style={{ width: '50px', height: 'auto' }} 
              alt="Organization Logo"
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            />
         
          </NavLink>
        </div>

        <motion.button 
          className={styles.hamburger} 
          onClick={() => setIsOpen(!isOpen)} 
          aria-label="Toggle menu"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <RxHamburgerMenu />
        </motion.button>

        <motion.ul 
          className={`${styles.navLinks} ${isOpen ? styles.open : ''}`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
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
          
        </motion.ul>
      </motion.nav>
    </motion.header>
  );
};

export default Header;