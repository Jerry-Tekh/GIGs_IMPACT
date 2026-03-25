import React from 'react';
import styles from './AboutPage.module.css';
import MVVCircles from './MVVCircles'; // We will create this next


import {siteData} from './../SiteData.js';


const AboutPage = () => {
  return (
    <section className={styles.pageWrapper}>
      <div className={styles.parentGrid}>
        
        {/* LEFT SIDE: Interactive MVV Circles (Based on Image) */}
        <div className={styles.leftColumn}>
          <MVVCircles />
        </div>

        {/* RIGHT SIDE: Our Story (Text only, as requested) */}
        <div className={styles.rightColumn}>
          <h2 className={styles.storyTitle}>{siteData.about.storyTitle}</h2>
          <div className={styles.storyContent}>
            {siteData.about.storyText.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutPage;