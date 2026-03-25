import React from 'react';
import styles from './Partners.module.css';

const Partners = () => {
  const logos = ['General Mills', 'Google', 'H-E-B', 'Hannaford', 'Hy-Vee', 'Jersey Mikes'];
  return (
    <section className={styles.partners}>
      <p className={styles.label}>OUR PARTNERS</p>
      <h2>We Can End Hunger When We Work Together</h2>
      <div className={styles.logoGrid}>
        {logos.map(logo => (
          <div key={logo} className={styles.logoPlaceholder}>{logo}</div>
        ))}
      </div>
      <button className={styles.btn}>Learn More About Our Partners</button>
    </section>
  );
};
export default Partners;