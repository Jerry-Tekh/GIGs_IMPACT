import React from 'react';
import styles from './Partners.module.css';

const Partners = () => {
  const values = ['Integrity – Doing what is right, even when no one is watching', 'Growth – Continuous personal and professional development', 'Independence – Building self-reliance through value creation', 'Impact – Creating solutions that improve lives', 'Community – Growing together and supporting one another'];
  return (
    <section className={styles.partners}>
          {/* Static background */}
      <div className={styles.bgImage} />
      <p className={styles.label}>OUR CORE VALUES</p>
      <h2>We Build a Talent-Driven Ecosystem</h2>
      <div className={styles.logoGrid}>
        {values.map(value => (
          <div key={value} className={styles.logoPlaceholder}>{value}</div>
        ))}
      </div>
      <button className={styles.btn}>Learn More About Our Mission</button>
    </section>
  );
};
export default Partners;