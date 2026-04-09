import React from 'react';
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { motion } from 'framer-motion';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <motion.footer 
      className={styles.footer}
      initial={{ backgroundColor: 'transparent' }}
      whileInView={{ backgroundColor: '#000' }} // adjust to actual color
      transition={{ duration: 1 }}
    >
      <motion.div 
        className={styles.top}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.div className={styles.brand}>
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            GIGs Impact Community
          </motion.h2>
          <div className={styles.socials}>
            <FaInstagram />
            <FaFacebook />
            <FaLinkedin />
            <FaYoutube />
          </div>
        </motion.div>
        <div className={styles.links}>
          <div><motion.h4 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>ABOUT US</motion.h4><ul><li>Our Story</li><li>Mission</li><li>Vision</li></ul></div>
          <div><motion.h4 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}>PROGRAMS</motion.h4><ul><li>7-Stage Framework</li><li>Cohort Learning</li><li>Blog</li></ul></div>
          <div><motion.h4 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}>GET INVOLVED</motion.h4><ul><li>Volunteer</li><li>Partner</li></ul></div>
          <div><motion.h4 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }}>CONTACT</motion.h4><ul><li>Email: gigsimpact@gmail.com</li><li>Phone: 08146163211</li></ul></div>
        </div>
      </motion.div>
      <motion.div 
        className={styles.bottom}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <p>© Copyright 2026 GIGs Impact Community. All Rights Reserved.</p>
        <div className={styles.legal}>Privacy Policy | Contact Us</div>
      </motion.div>
    </motion.footer>
  );
};
export default Footer;