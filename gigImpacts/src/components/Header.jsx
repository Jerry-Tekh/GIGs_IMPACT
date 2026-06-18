import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Header.module.css';
import logo from './../assets/logo.png';
import { FaBookOpen, FaEnvelope, FaHome, FaInfoCircle, FaLayerGroup } from 'react-icons/fa';
import { RxHamburgerMenu } from 'react-icons/rx';
import { MdClose } from 'react-icons/md';
import { smoothScrollToY } from '../utils/smoothScroll.js';

const navItems = [
  { to: '/', label: 'Home', icon: FaHome, scrollToTop: true },
  { to: '/about', label: 'About', icon: FaInfoCircle },
  { to: '/programs', label: 'Programs', icon: FaLayerGroup },
  { to: '/blog', label: 'Blog', icon: FaBookOpen },
  { to: '/contact', label: 'Contact', icon: FaEnvelope, scrollToTop: true }
];

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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <motion.div
          className={styles.backdrop}
          onClick={closeMenu}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      <motion.header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''} ${location.pathname !== '/' && !isScrolled ? styles.headerOnLight : ''}`} initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
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
            {isOpen ? <MdClose /> : <RxHamburgerMenu />}
          </motion.button>

          <motion.ul className={`${styles.navLinks} ${isOpen ? styles.open : ''}`} initial={false} animate={{ opacity: 1 }}>
            <li className={styles.mobileMenuIntro}>
              <div className={styles.mobileMenuBrand}>
                <img src={logo} alt="GigImpact Logo" />
                <div>
                  {/*<strong>GIGs IMPACT</strong>*/}
                  <p>Talent. Growth. Impact</p>
                </div>
              </div>
            </li>
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => (isActive ? styles.activeLink : '')}
                    onClick={() => {
                      closeMenu();
                      if (item.scrollToTop) {
                        scrollToTop();
                      }
                    }}
                  >
                    <span className={styles.mobileNavIcon} aria-hidden="true">
                      <Icon />
                    </span>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
            <li className={styles.mobileCtaItem}>
              <Link to="/#volunteer" className={styles.ctaMobile} onClick={closeMenu}>
                Get Involved
              </Link>
            </li>
          </motion.ul>

          <Link to="/#volunteer" className={styles.cta} onClick={closeMenu}>
            Get Involved
          </Link>
        </motion.nav>
      </motion.header>
    </>
  );
};

export default Header;
