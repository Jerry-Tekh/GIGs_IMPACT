import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaArrowRight,
  FaBullhorn,
  FaComments,
  FaCompass,
  FaGlobeAfrica,
  FaLaptopCode,
  FaSeedling,
  FaUsersCog
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from './WhatWeDo.module.css';
import { siteData } from '../SiteData.js';

const stageIcons = [FaCompass, FaComments, FaLaptopCode, FaBullhorn, FaUsersCog, FaGlobeAfrica, FaSeedling];

const ServiceCard = ({ stage, index }) => {
  const Icon = stageIcons[index] || FaSeedling;
  const outcome = stage.focus[stage.focus.length - 1];

  return (
    <Link className={styles.stageLink} to="/programs#stage-framework" aria-label={`View ${stage.title} details on the program page`}>
      <motion.article
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        viewport={{ once: true }}
        whileHover={{ y: -6, transition: { duration: 0.2 } }}
      >
        <div className={styles.cardTop}>
          <span className={styles.stageNumber}>Stage {stage.stage}</span>
          <div className={styles.iconBadge}>
            <Icon className={styles.icon} />
          </div>
        </div>

        <div className={styles.cardBody}>
          <h3 className={styles.cardTitle}>{stage.title}</h3>
          <p className={styles.cardText}>
            Click to explore how this stage connects to the full development journey on the program page.
          </p>

          <div className={styles.focusList}>
            {stage.focus.map((item, idx) => (
              <span key={idx} className={styles.focusItem}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.outcomeBlock}>
            <span className={styles.outcomeLabel}>Key outcome</span>
            <strong>{outcome}</strong>
          </div>

          <div className={styles.arrowButton} aria-hidden="true">
            <FaArrowRight className={styles.arrowIconCard} />
          </div>
        </div>
      </motion.article>
    </Link>
  );
};

const WhatWeDo = () => {
  const stages = siteData.programs.stages.slice(0, 7);
  const [activeIndex, setActiveIndex] = useState(0);

  const showPreviousStage = () => {
    setActiveIndex((currentIndex) => (currentIndex === 0 ? stages.length - 1 : currentIndex - 1));
  };

  const showNextStage = () => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % stages.length);
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      showNextStage();
    }, 3200);

    return () => window.clearInterval(intervalId);
  }, [stages.length]);

  return (
    <motion.section className={styles.section} id="what-we-do">
      <div className={styles.container}>
        <div className={styles.shell}>
          <motion.div
            className={styles.introPanel}
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, amount: 0.25 }}
          >
            <span className={styles.subtitle}>What We Do</span>
            <h2 className={styles.mainTitle}>
              We move people through a clear phase flow from awareness to competence, leadership, and impact.
            </h2>
            <p className={styles.introText}>
              See our program page to understand the whole system in one place. Click the link below to explore the full framework
               and how the stages connect to each other.

            </p>

           {/* <div className={styles.metricStrip}>
              <div className={styles.metricCard}>
                <strong>7</strong>
                <span>Linked Phases</span>
              </div>
              <div className={styles.metricCard}>
                <strong>1</strong>
                <span>Connected Transformation Path</span>
              </div>
            </div>*/}

            <div className={styles.pathwayCard}>
              <span className={styles.pathwayLabel}>Framework direction</span>
              <p>Self-discovery</p>
              <p>Skill formation</p>
              <p>Leadership growth</p>
              <p>Global relevance</p>
            </div>

            <Link className={styles.learnMore} to="/programs#stage-framework">
              Explore Full Stage Framework
              <FaArrowRight className={styles.arrowIcon} />
            </Link>
          </motion.div>

          <motion.div
            className={styles.stageStream}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className={styles.sliderMeta}>
              <span className={styles.sliderLabel}>preview stages</span>
              <div className={styles.sliderControls}>
                <button type="button" className={styles.sliderControlBtn} onClick={showPreviousStage} aria-label="Previous stage">
                  <FaArrowLeft />
                </button>
                <button type="button" className={styles.sliderControlBtn} onClick={showNextStage} aria-label="Next stage">
                  <FaArrowRight />
                </button>
              </div>
            </div>

            <div className={styles.sliderViewport}>
              <motion.div
                className={styles.sliderTrack}
                animate={{ x: `-${activeIndex * 100}%` }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                {stages.map((stage, index) => (
                  <div key={stage.stage} className={styles.slide}>
                    <ServiceCard stage={stage} index={index} />
                  </div>
                ))}
              </motion.div>
            </div>

            <div className={styles.sliderDots} aria-label="Stage navigation">
              {stages.map((stage, index) => (
                <button
                  key={stage.stage}
                  type="button"
                  className={index === activeIndex ? styles.activeDot : styles.dot}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show stage ${stage.stage}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default WhatWeDo;
