import React from 'react';
import { motion } from 'framer-motion';
import styles from './Partners.module.css';

const Partners = () => {
  const values = ['"Integrity – Doing what is right, even when no one is watching"', '"Growth – Continuous personal and professional development', '"Independence – Building self-reliance through value creation"', '"Impact – Creating solutions that improve lives"', '"Community – Growing together and supporting one another"'];
  return (
    <motion.section 
      className={styles.partners}
      initial={{ backgroundColor: 'transparent' }}
      whileInView={{ backgroundColor: '#e0e0e0' }} // adjust
      transition={{ duration: 1 }}
    >
      {/* Static background */}
      <motion.div 
        className={styles.bgImage}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      />
      <motion.div 
        className={styles.content}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.p 
          className={styles.label}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          OUR CORE VALUES
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          We Build a Talent-Driven Ecosystem
        </motion.h2>
        <motion.div 
          className={styles.logoGrid}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {values.map((value, index) => (
            <motion.div 
              key={value} 
              className={styles.logoPlaceholder}
              initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {value}
            </motion.div>
          ))}
        </motion.div>
        <motion.button 
          className={styles.btn}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          Learn More About Our Mission
        </motion.button>
      </motion.div>
    </motion.section>
  );
};
export default Partners;