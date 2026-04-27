import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaBook, FaGraduationCap, FaHandshake, FaUsers } from 'react-icons/fa';
import styles from './ActionCards.module.css';
import { siteData } from '../SiteData.js';

const iconMap = {
  FaUsers,
  FaHandshake,
  FaGraduationCap,
  FaBook
};

const actionLinkMap = {
  'Join the Community': {
    href: 'https://chat.whatsapp.com/BkmArlYRcTu8xHNnFQpSD1?mode=gi_t',
    label: 'Join WhatsApp Community',
    external: true
  },
  'Partner With Us': {
    href: '/#volunteer',
    label: 'Volunteer With Us',
    external: false
  },
  'Explore Programs': {
    href: '/programs',
    label: 'Explore Programs',
    external: false
  },
  'Read Our Blog': {
    href: '/blog',
    label: 'Explore Blog',
    external: false
  }
};

const ActionCards = () => {
  const primaryAction = siteData.actions[0];
  const primaryLink = actionLinkMap[primaryAction.title];

  return (
    <motion.section id="bridge" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.shell}>
          <motion.div
            className={styles.introPanel}
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <span className={styles.kicker}>Bridge The Gap</span>
            <h2 className={styles.heading}>
              At GIGs Impact Community, we are not waiting for change, we are building it.
            </h2>
            <p className={styles.lead}>
              Every path below opens a real next step
              into community, partnership, learning, or insight.
            </p>

            <div className={styles.signalRow}>
              <div className={styles.signalCard}>
                <strong>4</strong>
                <span>Clear ways to Engage</span>
              </div>
              <div className={styles.signalCard}>
                <strong >1</strong>
                <span>Shared Mission</span>
              </div>
            </div>

            {primaryLink.external ? (
              <a href={primaryLink.href} target="_blank" rel="noreferrer" className={styles.primaryCta}>
                {primaryLink.label}
                <FaArrowRight className={styles.primaryArrow} />
              </a>
            ) : (
              <Link to={primaryLink.href} className={styles.primaryCta}>
                {primaryLink.label}
                <FaArrowRight className={styles.primaryArrow} />
              </Link>
            )}
          </motion.div>

          <motion.div
            className={styles.actionDeck}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            {siteData.actions.map((action, index) => {
              const IconComponent = iconMap[action.icon];
              const actionLink = actionLinkMap[action.title] || {
                href: '/',
                label: action.title,
                external: false
              };

              const buttonContent = (
                <>
                  {actionLink.label}
                  <FaArrowRight className={styles.cardArrow} />
                </>
              );

              return (
                <motion.article
                  key={action.title}
                  className={styles.card}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.index}>0{index + 1}</span>
                    <div className={styles.iconBackground}>
                      {IconComponent && <IconComponent size={24} />}
                    </div>
                  </div>

                  <div className={styles.textContent}>
                    <h3 className={styles.cardTitle}>{action.title}</h3>
                    <p className={styles.description}>{action.text}</p>
                  </div>

                  <div className={styles.ctaWrapper}>
                    {actionLink.external ? (
                      <a href={actionLink.href} target="_blank" rel="noreferrer" className={styles.ctaButton}>
                        {buttonContent}
                      </a>
                    ) : (
                      <Link to={actionLink.href} className={styles.ctaButton}>
                        {buttonContent}
                      </Link>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default ActionCards;
