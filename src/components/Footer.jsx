import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <h2>GIGs Impact Community</h2>
          <div className={styles.socials}>Instagram Facebook LinkedIn YouTube</div>
        </div>
        <div className={styles.links}>
          <div><h4>ABOUT US</h4><ul><li>Our Story</li><li>Mission</li><li>Vision</li></ul></div>
          <div><h4>PROGRAMS</h4><ul><li>7-Stage Framework</li><li>Cohort Learning</li><li>Blog</li></ul></div>
          <div><h4>GET INVOLVED</h4><ul><li>Volunteer</li><li>Partner</li></ul></div>
          <div><h4>CONTACT</h4><ul><li>Email: gigsimpact@gmail.com</li><li>Phone: 08146163211</li></ul></div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© Copyright 2026 GIGs Impact Community. All Rights Reserved.</p>
        <div className={styles.legal}>Privacy Policy | Contact Us</div>
      </div>
    </footer>
  );
};
export default Footer;