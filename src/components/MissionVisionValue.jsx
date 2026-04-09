import React from 'react';
import { motion } from 'framer-motion';
import { FaBinoculars, FaBullseye, FaHandsHelping, FaTrophy } from 'react-icons/fa';

import styles from './MissionVisionValue.module.css';


const MissionVisionValues = () => {
  return (
    <motion.section 
      className={styles.sectionContainer}
      initial={{ backgroundColor: 'transparent' }}
      whileInView={{ backgroundColor: '#fff' }}
      transition={{ duration: 1 }}
    >
      <div className={styles.wrapper}>
        
        {/* LEFT COLUMN: 3D Ribbons */}
        <motion.div 
          className={styles.ribbonColumn}
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.headerArea}>
            <motion.h1 
              className={styles.mainTitle}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              MISSION VISION <span className={styles.blueText}>VALUES</span>
            </motion.h1>
          </div>

          <div className={styles.ribbons}>
            {/* Vision Ribbon */}
            <motion.div 
              className={`${styles.ribbon} ${styles.vision}`}
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className={styles.ribbonContent}>
                <div className={styles.iconBox}><FaBinoculars /></div>
                <div>
                  <h3>VISION</h3>
                  <p>Better health and wellness through transformative innovation</p>
                </div>
              </div>
            </motion.div>

            {/* Mission Ribbon */}
            <motion.div 
              className={`${styles.ribbon} ${styles.mission}`}
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className={styles.ribbonContent}>
                <div className={styles.iconBox}><FaBullseye /></div>
                <div>
                  <h3>MISSION</h3>
                  <p>To enhance health for everyone through outstanding education, research, clinical care and social responsibility</p>
                </div>
              </div>
            </motion.div>

            {/* Values Ribbon */}
            <motion.div 
              className={`${styles.ribbon} ${styles.values}`}
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className={styles.ribbonContent}>
                <div className={styles.iconBox}><FaHandsHelping /></div>
                <div>
                  <h3>VALUES</h3>
                  <p>Excellence, Integrity, Collaboration, Accountability</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Info Card */}
        <motion.div 
          className={styles.infoColumn}
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.div 
            className={styles.statCard}
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5, type: 'spring' }}
          >
            <div className={styles.trophyIcon}><FaTrophy /></div>
            <div className={styles.statNumber}>345K</div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              The vision, mission, and values statements should be written for people to understand easily.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className={styles.textBlock}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <h4>Mission, Vision, Values</h4>
            <p>
              Mission and vision are statements from the organization that answer questions about who we are, what do we value, and where we're going.
            </p>
          </motion.div>
        </motion.div>

      </div>
    </motion.section>
  );
};

export default MissionVisionValues;