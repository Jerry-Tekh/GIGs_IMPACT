import React from 'react';



import styles from './FindUs.module.css';

const FindFood = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.info}>
          <h2>Find Food and Resources</h2>
          <p className={styles.sub}>We are here to help you find food and support today.</p>
          
          <div className={styles.item}>
            <span className={styles.icon}>🛒</span>
            <div>
              <h3>Find Food Near You</h3>
              <p>Find the food bank that serves your community.</p>
            </div>
          </div>
          
          <div className={styles.item}>
            <span className={styles.icon}>🍞</span>
            <div>
              <h3>Get SNAP Assistance</h3>
              <p>Each state has a different application process. Your local food bank can help.</p>
            </div>
          </div>
        </div>
        
        <div className={styles.storyCard}>
          <img src="/kaycee.jpg" alt="Kaycee" />
          <div className={styles.quote}>
            <p>“You don't need everything to start. You just need to start with what you have.”</p>
            <span>Founder, GIGs Impact Community</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FindFood;