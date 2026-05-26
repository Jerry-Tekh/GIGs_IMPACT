import React, { useState } from 'react';
import styles from './MVVCircles.module.css';


import {siteData} from './../SiteData.js';


const MVVCircles = () => {
  const [activeTab, setActiveTab] = useState('mission'); // Default active tab

  return (
    <div className={styles.mvvWrapper}>
      <h1 className={styles.mainHeading}>MISSION, VISION & VALUES</h1>

      {/* The Central Circle Diagram */}
      <div className={styles.diagramContainer}>
        {/* Complex Wireframe Circular Borders (Background) */}
        <div className={styles.wireframeCircles}></div>

        {/* The 3 Clickable/Hoverable Circles */}
        {siteData.about.mvvCircles.map((circle) => (
          <button
            key={circle.id}
            className={`${styles.circle} ${styles[circle.color]} ${activeTab === circle.id ? styles.active : ''}`}
            onClick={() => setActiveTab(circle.id)}
            onMouseEnter={() => setActiveTab(circle.id)}
          >
            {circle.title}
          </button>
        ))}
      </div>

      {/* The Dynamic Text Section (Relative Position) */}
      <div className={styles.textDisplay}>
        <h3>{siteData.about.mvvText[activeTab].title}</h3>
        <p>{siteData.about.mvvText[activeTab].text}</p>
      </div>
    </div>
  );
};

export default MVVCircles;