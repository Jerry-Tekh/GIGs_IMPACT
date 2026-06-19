import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  FaHandHoldingHeart,
  FaSyncAlt,
  FaBuilding,
  FaChalkboardTeacher,
  FaTools,
  FaUsers,
  FaSeedling
} from 'react-icons/fa';
import styles from './Donate.module.css';
import { riseItem, sectionFade, slideLeft, staggerGroup, viewport } from '../../utils/motion.js';

const givingWays = [
  {
    icon: FaHandHoldingHeart,
    title: 'One-Time Gift',
    text: 'A single contribution that goes directly into active programs, learning sessions, and the tools our members need.',
    role: 'Best for first-time supporters',
    cta: 'Give Once'
  },
  {
    icon: FaSyncAlt,
    title: 'Monthly Giving',
    text: 'A recurring gift that gives us steady ground to plan ahead, run cohorts, and sustain mentorship over time.',
    role: 'Best for committed allies',
    cta: 'Give Monthly'
  },
  {
    icon: FaBuilding,
    title: 'Corporate / Partnership',
    text: 'Co-create programs, sponsor a cohort, or open opportunities for talent your organisation can hire and grow.',
    role: 'Best for organisations & teams',
    cta: 'Start A Conversation'
  }
];

const amountTiles = [
  { amount: '₦5,000', enables: 'Equips one learner for a single training stage.' },
  { amount: '₦15,000', enables: 'Supports a small group through a full session.' },
  { amount: '₦50,000', enables: 'Helps sustain mentorship and tools for a cohort.' },
  { amount: 'Custom', enables: 'Give an amount that feels right for you.' }
];

const supportAreas = [
  {
    icon: FaChalkboardTeacher,
    title: 'Training & Facilitation',
    text: 'Practical, hands-on sessions that turn raw interest into real, employable skill.'
  },
  {
    icon: FaTools,
    title: 'Tools & Platforms',
    text: 'Access to the software, devices, and learning platforms our members build on.'
  },
  {
    icon: FaUsers,
    title: 'Mentorship',
    text: 'Guidance from people who have walked the path, supporting members one step at a time.'
  },
  {
    icon: FaSeedling,
    title: 'Enterprise Development',
    text: 'Seed support that helps members move from learning into income and ownership.'
  }
];

const DonatePage = () => {
  return (
    <div className={styles.page}>
      <Motion.section className={styles.hero}>
        <Motion.div
          className={styles.heroInner}
          variants={slideLeft}
          initial="hidden"
          animate="show"
        >
          <span className={styles.eyebrow}>Support Us</span>
          <h1>Your support turns overlooked talent into lasting opportunity.</h1>
          <p>
            Every gift helps us reach young people with practical skills, real mentorship,
            and the tools to build a future they can own. Your generosity does the lifting.
          </p>

          <div className={styles.heroActions}>
            <a href="#ways-to-give" className={styles.btnGold}>
              Donate Now
            </a>
            <Link to="/get-involved" className={styles.btnGhost}>
              Partner With Us
            </Link>
          </div>

          <p className={styles.trustLine}>
            GIGs Impact Community — a youth empowerment &amp; human-capacity development
            community, Enugu State, Nigeria.
          </p>
        </Motion.div>
      </Motion.section>

      <Motion.section
        className={styles.waysSection}
        id="ways-to-give"
        variants={sectionFade}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        <div className={styles.inner}>
          <Motion.div className={styles.sectionHeader} variants={riseItem}>
            <span className={styles.eyebrow}>Ways To Give</span>
            <h2>Choose the way that fits how you want to help.</h2>
          </Motion.div>

          <Motion.div className={styles.waysGrid} variants={staggerGroup}>
            {givingWays.map((way) => {
              const Icon = way.icon;

              return (
                <Motion.article
                  key={way.title}
                  className={styles.wayCard}
                  variants={riseItem}
                  whileHover={{ y: -6 }}
                >
                  <span className={styles.wayIcon} aria-hidden="true">
                    <Icon />
                  </span>
                  <h3>{way.title}</h3>
                  <p>{way.text}</p>
                  <span className={styles.wayRole}>{way.role}</span>
                  <button type="button" className={styles.btnBlue}>
                    {way.cta}
                  </button>
                </Motion.article>
              );
            })}
          </Motion.div>
        </div>
      </Motion.section>

      <Motion.section
        className={styles.amountsSection}
        variants={sectionFade}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        <div className={styles.inner}>
          <Motion.div className={styles.sectionHeader} variants={riseItem}>
            <span className={`${styles.eyebrow} ${styles.eyebrowDark}`}>Suggested Amounts</span>
            <h2 className={styles.headingOnDark}>An example of what your gift can support.</h2>
            <p className={styles.subOnDark}>
              These figures are illustrative — they show the kind of impact a gift can make,
              not fixed prices. Any amount moves the work forward.
            </p>
          </Motion.div>

          <Motion.div className={styles.amountsGrid} variants={staggerGroup}>
            {amountTiles.map((tile) => (
              <Motion.div
                key={tile.amount}
                className={styles.amountTile}
                variants={riseItem}
                whileHover={{ y: -6 }}
              >
                <span className={styles.amountValue}>{tile.amount}</span>
                <p>{tile.enables}</p>
              </Motion.div>
            ))}
          </Motion.div>
        </div>
      </Motion.section>

      <Motion.section
        className={styles.allocSection}
        variants={sectionFade}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        <div className={styles.inner}>
          <Motion.div className={styles.sectionHeader} variants={riseItem}>
            <span className={styles.eyebrow}>Where Your Support Goes</span>
            <h2>Every gift is put to work where it matters most.</h2>
          </Motion.div>

          <Motion.ol className={styles.allocList} variants={staggerGroup}>
            {supportAreas.map((area, index) => {
              const Icon = area.icon;

              return (
                <Motion.li key={area.title} className={styles.allocRow} variants={riseItem}>
                  <span className={styles.allocNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className={styles.allocBody}>
                    <h3>
                      <span className={styles.allocIcon} aria-hidden="true">
                        <Icon />
                      </span>
                      {area.title}
                    </h3>
                    <p>{area.text}</p>
                  </div>
                </Motion.li>
              );
            })}
          </Motion.ol>
        </div>
      </Motion.section>

      <Motion.section
        className={styles.ctaSection}
        variants={sectionFade}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        <Motion.div className={styles.ctaInner} variants={riseItem}>
          <span className={`${styles.eyebrow} ${styles.eyebrowDark}`}>Join The Movement</span>
          <h2 className={styles.headingOnDark}>Be part of the movement.</h2>
          <p className={styles.subOnDark}>
            Behind every figure is a young person with potential waiting for a chance.
            Your support helps us meet them where they are.
          </p>

          <div className={styles.heroActions}>
            <a href="#ways-to-give" className={styles.btnGold}>
              Donate Now
            </a>
            <Link to="/contact" className={styles.btnGhostDark}>
              Contact Us
            </Link>
          </div>
        </Motion.div>
      </Motion.section>
    </div>
  );
};

export default DonatePage;
