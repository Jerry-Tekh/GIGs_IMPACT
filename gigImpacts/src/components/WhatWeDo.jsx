import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from './WhatWeDo.module.css';
import { siteData } from '../SiteData.js';

const WhatWeDo = () => {
  const stages = siteData.programs.stages.slice(0, 7);

  return (
    <section className={styles.section} id="what-we-do">
      <div className={styles.container}>
        <div className={styles.shell}>
          <motion.div
            className={styles.introPanel}
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, amount: 0.25 }}
          >
            <span className={styles.subtitle}>What We Do</span>
            <h2 className={styles.mainTitle}>
              One connected journey — from <em>self-discovery</em> to lifelong impact.
            </h2>
            <p className={styles.introText}>
              We move people through a clear seven-stage framework. Each stage builds on the last,
              turning raw potential into skill, income, leadership, and lasting contribution.
            </p>

            <div className={styles.pathwayCard}>
              <span className={styles.pathwayLabel}>Framework direction</span>
              <p>Self-discovery</p>
              <p>Skill formation</p>
              <p>Leadership growth</p>
              <p>Global relevance &amp; impact</p>
            </div>

            <Link className={styles.learnMore} to="/programs#stage-framework">
              Explore Full Stage Framework
              <FaArrowRight className={styles.arrowIcon} />
            </Link>
          </motion.div>

          <div className={styles.timeline}>
            {stages.map((stage, index) => (
              <motion.div
                key={stage.stage}
                className={styles.stageRow}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3), ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, amount: 0.4 }}
              >
                <div className={styles.stageMarker}>
                  <span className={styles.stageNum}>{String(stage.stage).padStart(2, '0')}</span>
                </div>

                <div className={styles.stageBody}>
                  <div className={styles.stageHead}>
                    <h3 className={styles.stageTitle}>{stage.title}</h3>
                    <span className={styles.stageOutcome}>{stage.outcome}</span>
                  </div>
                  <p className={styles.stageSummary}>{stage.summary}</p>
                  <div className={styles.focusList}>
                    {stage.focus.map((item) => (
                      <span key={item} className={styles.focusItem}>{item}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}

            <Link to="/programs#stage-framework" className={styles.timelineCta}>
              See how the full framework connects
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;
