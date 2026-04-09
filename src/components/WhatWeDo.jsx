import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.section 
      className={styles.section}
      initial={{ backgroundColor: 'transparent' }}
      whileInView={{ backgroundColor: '#fff' }} // adjust color
      transition={{ duration: 1 }}
    >
      <motion.p 
        className={styles.topLabel}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        WHAT WE DO
      </motion.p>
      <motion.h2 
        className={styles.mainTitle}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        We empower youth by helping them discover their purpose, developing their mindset and skills, and providing platforms to turn talents into income and impact.
      </motion.h2>
      
      <motion.div 
        className={styles.grid}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
      >
        {siteData.programs.stages.slice(0, 7).map((stage, index) => (
          <motion.div 
            key={index} 
            className={styles.card}
            initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
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
          </motion.div>
          
        ))}
        <div>
          <p></p>
        </div>
      </motion.div>
      <motion.button 
        className={styles.learnMore}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        Learn About Our Work
      </motion.button>
    </motion.section>
  );
};

export default WhatWeDo;