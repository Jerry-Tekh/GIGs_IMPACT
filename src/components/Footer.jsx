import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <h2>FEEDING AMERICA</h2>
          <div className={styles.socials}>f t i y</div>
        </div>
        <div className={styles.links}>
          <div><h4>ABOUT US</h4><ul><li>Careers</li><li>Programs</li><li>Leadership</li></ul></div>
          <div><h4>RESEARCH</h4><ul><li>Map the Meal Gap</li><li>Hunger & Health</li></ul></div>
          <div><h4>WAYS TO GIVE</h4><ul><li>Give Monthly</li><li>Fundraise</li></ul></div>
          <div><h4>HUNGER FACTS</h4><ul><li>Seniors</li><li>Children</li></ul></div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© Copyright 2026 Feeding America. All Rights Reserved.</p>
        <div className={styles.legal}>Privacy Policy | Contact Us</div>
      </div>
    </footer>
  );
};
export default Footer;