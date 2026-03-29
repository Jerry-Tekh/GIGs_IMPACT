import React from 'react';
import styles from './WhatWeDo.module.css';
import { siteData } from '../SiteData.js';


import awareeness from './../assets//WhatWeDo/awareness.png';
import softSkills from './../assets/WhatWeDo/softskills.png';
import hardSkill from './../assets/WhatWeDo/hardSkill.png';
import marketing from './../assets/WhatWeDo/marketing.png';
import competence from './../assets/WhatWeDo/competence.png';
import globalLeadership from './../assets/WhatWeDo/globalLeadership.png';
import growthImpact from './../assets/WhatWeDo/growthImpact.png';



const whatWeDoImages = [
  awareeness, softSkills,hardSkill,marketing,competence,globalLeadership,growthImpact
];


const WhatWeDo = () => {
  return (
    <section className={styles.section}>
      <p className={styles.topLabel}>WHAT WE DO</p>
      <h2 className={styles.mainTitle}>We empower youth by helping them discover their purpose, developing their mindset and skills, and providing platforms to turn talents into income and impact.</h2>
      
      <div className={styles.grid}>
        {siteData.programs.stages.slice(0, 7).map((stage, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.label} style={{ backgroundColor: siteData.whatWeDo[index % 4].color }}>
              STAGE {stage.stage}
            </div>
            <div className={styles.cardBody}>
              <h3>{stage.title}</h3>
              <p>{stage.focus.join(', ')}</p>
              <div className={styles.imgContainer}>
                <img src={whatWeDoImages[index % whatWeDoImages.length]} alt={`Stage ${stage.stage}`} />
                <span className={styles.imgName}>Stage {stage.stage}</span>
              </div>
            </div>
          </div>
          
        ))}
        <div>
          <p></p>
        </div>
      </div>
      <button className={styles.learnMore}>Learn About Our Work</button>
    </section>
  );
};

export default WhatWeDo;