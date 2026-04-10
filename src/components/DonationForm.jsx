import React from 'react';
import { motion } from 'framer-motion';
import styles from './DonationForm.module.css';
import volunteer from './../assets/volunteer2.png';


const DonationForm = () => {
  return (
    <motion.section 
      id="volunteer"
      className={styles.section}
      initial={{ backgroundColor: 'transparent' }}
      whileInView={{ backgroundColor: '#f5f5f5' }}
      transition={{ duration: 1 }}
    >
      <div className={styles.container}>
        <motion.div 
          className={styles.formCard}
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Volunteer With Us
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Be part of a mission that is transforming lives and shaping the future of Nigeria and Africa.
          </motion.p>
          <motion.form
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className={styles.form}
          >
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
          </motion.form>
        </motion.div>
        <motion.div 
          className={styles.imageCol}
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.img 
            src={volunteer} 
            alt="Family"
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          />
          <p>Requirements: Willingness to serve, Commitment to growth, Alignment with our values, Passion for impact</p>
        </motion.div>
      </div>
    </motion.section>
  );
};
export default DonationForm;