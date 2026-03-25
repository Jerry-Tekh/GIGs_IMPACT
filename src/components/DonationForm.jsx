import React from 'react';
import styles from './DonationForm.module.css';

const DonationForm = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.formCard}>
          <h3>$1 = 10 Meals</h3>
          <div className={styles.tabs}>
            <button className={styles.active}>One Time</button>
            <button>Monthly</button>
          </div>
          <div className={styles.amountGrid}>
            {['$1000', '$500', '$250', '$100', '$50', '$25'].map(amt => (
              <button key={amt} className={styles.amtBtn}>{amt}</button>
            ))}
          </div>
          <input type="text" placeholder="$ Add a custom donation amount" className={styles.input} />
          <button className={styles.submit}>Continue with your donation</button>
        </div>
        <div className={styles.imageCol}>
          <img src="/family.jpg" alt="Family" />
          <p>Taylor & Family, Virginia</p>
        </div>
      </div>
    </section>
  );
};
export default DonationForm;