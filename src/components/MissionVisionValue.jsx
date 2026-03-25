import React from 'react';

import styles from './MissionVisionValue.module.css';


const MissionVisionValues = () => {
  return (
    <section className={styles.sectionContainer}>
      <div className={styles.wrapper}>
        
        {/* LEFT COLUMN: 3D Ribbons */}
        <div className={styles.ribbonColumn}>
          <div className={styles.headerArea}>
            <h1 className={styles.mainTitle}>
              MISSION VISION <span className={styles.blueText}>VALUES</span>
            </h1>
          </div>

          <div className={styles.ribbons}>
            {/* Vision Ribbon */}
            <div className={`${styles.ribbon} ${styles.vision}`}>
              <div className={styles.ribbonContent}>
                <div className={styles.iconBox}>🔭</div>
                <div>
                  <h3>VISION</h3>
                  <p>Better health and wellness through transformative innovation</p>
                </div>
              </div>
            </div>

            {/* Mission Ribbon */}
            <div className={`${styles.ribbon} ${styles.mission}`}>
              <div className={styles.ribbonContent}>
                <div className={styles.iconBox}>🎯</div>
                <div>
                  <h3>MISSION</h3>
                  <p>To enhance health for everyone through outstanding education, research, clinical care and social responsibility</p>
                </div>
              </div>
            </div>

            {/* Values Ribbon */}
            <div className={`${styles.ribbon} ${styles.values}`}>
              <div className={styles.ribbonContent}>
                <div className={styles.iconBox}>🙌</div>
                <div>
                  <h3>VALUES</h3>
                  <p>Excellence, Integrity, Collaboration, Accountability</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Info Card */}
        <div className={styles.infoColumn}>
          <div className={styles.statCard}>
            <div className={styles.trophyIcon}>🏆</div>
            <div className={styles.statNumber}>345K</div>
            <p>The vision, mission, and values statements should be written for people to understand easily.</p>
          </div>
          
          <div className={styles.textBlock}>
            <h4>Mission, Vision, Values</h4>
            <p>
              Mission and vision are statements from the organization that answer questions about who we are, what do we value, and where we're going.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default MissionVisionValues;