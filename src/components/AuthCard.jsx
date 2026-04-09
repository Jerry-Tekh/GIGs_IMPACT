import React from 'react';
import { motion } from 'framer-motion';


import styles from './../AuthPage/Auth.module.css';


const AuthCard = ({ children, title, subtitle }) => {
  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.authCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </motion.div>
  );
};

export default AuthCard;