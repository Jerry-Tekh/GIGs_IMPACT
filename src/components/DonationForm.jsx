import React from 'react';
import styles from './DonationForm.module.css';

const DonationForm = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.formCard}>
          <h3>Volunteer With Us</h3>
          <p>Be part of a mission that is transforming lives and shaping the future of Nigeria and Africa.</p>
          <form>
            <input type="text" placeholder="Full Name" className={styles.input} />
            <input type="email" placeholder="Email" className={styles.input} />
            <input type="tel" placeholder="Phone" className={styles.input} />
            <input type="text" placeholder="Skills" className={styles.input} />
            <select className={styles.input}>
              <option>How would you like to contribute?</option>
              <option>Trainers and facilitators</option>
              <option>Mentors and coaches</option>
              <option>Event organizers</option>
              <option>Content creators</option>
              <option>Social media managers</option>
            </select>
            <button className={styles.submit}>Submit Application</button>
          </form>
        </div>
        <div className={styles.imageCol}>
          <img src="/family.jpg" alt="Family" />
          <p>Requirements: Willingness to serve, Commitment to growth, Alignment with our values, Passion for impact</p>
        </div>
      </div>
    </section>
  );
};
export default DonationForm;