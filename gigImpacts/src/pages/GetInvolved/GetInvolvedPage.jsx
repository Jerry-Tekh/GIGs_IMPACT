import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaHandsHelping,
  FaHandshake,
  FaChalkboardTeacher,
  FaArrowRight
} from 'react-icons/fa';
import styles from './GetInvolved.module.css';
import { sectionFade, riseItem, staggerGroup, viewport } from '../../utils/motion.js';

const MotionDiv = motion.div;
const MotionSection = motion.section;
const MotionArticle = motion.article;
const MotionOl = motion.ol;
const MotionLi = motion.li;
const MotionUl = motion.ul;

const roles = [
  {
    icon: FaHandsHelping,
    title: 'Volunteer',
    description:
      'Give your time and skill where it counts. Volunteers are the engine of the movement — running activities, supporting members, and making programs happen on the ground.',
    duties: [
      'Support program sessions, events, and community drives',
      'Share a practical skill, craft, or area of expertise',
      'Help members stay on track toward their goals'
    ],
    ctaLabel: 'Become a Volunteer',
    to: '/#volunteer'
  },
  {
    icon: FaHandshake,
    title: 'Partner',
    description:
      'Organizations, sponsors, and institutions that collaborate with us multiply our reach. Together we open doors to resources, opportunities, and lasting systems.',
    duties: [
      'Sponsor programs, cohorts, or community initiatives',
      'Offer placements, tools, or access to opportunities',
      'Co-create projects that scale real-world impact'
    ],
    ctaLabel: 'Partner With Us',
    to: '/contact'
  },
  {
    icon: FaChalkboardTeacher,
    title: 'Mentor',
    description:
      'Guide and coach members through their growth journey. Mentors turn experience into momentum — helping people move from potential to clarity and confidence.',
    duties: [
      'Coach members one-on-one or in small groups',
      'Share insight on careers, ventures, and craft',
      'Hold people accountable as they build and grow'
    ],
    ctaLabel: 'Mentor a Member',
    to: '/contact'
  }
];

const steps = [
  {
    n: '01',
    title: 'Apply',
    text: 'Tell us how you want to get involved and a little about yourself. It takes only a few minutes.'
  },
  {
    n: '02',
    title: 'Onboard',
    text: 'We get to know you, align on expectations, and match you to where you can make the most impact.'
  },
  {
    n: '03',
    title: 'Contribute',
    text: 'Start giving your time, skill, or resources alongside a community that is building something real.'
  },
  {
    n: '04',
    title: 'Grow',
    text: 'As the movement grows, so do you — new skills, new relationships, and a track record of impact.'
  }
];

const qualities = [
  'Willingness to serve',
  'Growth mindset',
  'Alignment with our values',
  'Passion for impact',
  'Relevant skills',
  'Reliability & follow-through',
  'Openness to learn',
  'Belief in people'
];

const GetInvolved = () => {
  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <motion.div variants={sectionFade} initial="hidden" animate="show">
            <span className={styles.eyebrow}>Get Involved</span>
            <h1>There is a place for you in this movement.</h1>
            <p>
              Whether you give your time, your network, or your wisdom, there is a way to
              join the work. Choose how you want to contribute — and help turn overlooked
              talent into structure, value, and lasting impact.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.goldBtn} href="/#volunteer">
                Volunteer <FaArrowRight />
              </a>
              <Link className={styles.ghostBtn} to="/contact">
                Partner With Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Three roles ── */}
      <motion.section
        className={styles.roles}
        variants={sectionFade}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        <div className={styles.inner}>
          <header className={styles.sectionHead}>
            <span className={styles.eyebrow}>Three ways to join</span>
            <h2>Find the role that fits you</h2>
            <p>
              Every contribution moves someone forward. Pick the path that matches what
              you have to offer right now.
            </p>
          </header>

          <motion.div
            className={styles.roleGrid}
            variants={staggerGroup}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
          >
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <motion.article key={role.title} className={styles.roleCard} variants={riseItem}>
                  <span className={styles.roleIcon} aria-hidden="true">
                    <Icon />
                  </span>
                  <h3>{role.title}</h3>
                  <p className={styles.roleDesc}>{role.description}</p>
                  <p className={styles.roleListLabel}>What you&apos;ll do</p>
                  <ul className={styles.roleList}>
                    {role.duties.map((duty) => (
                      <li key={duty}>{duty}</li>
                    ))}
                  </ul>
                  <Link className={styles.roleCta} to={role.to}>
                    {role.ctaLabel} <FaArrowRight />
                  </Link>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* ── How it works (ink band) ── */}
      <section className={styles.process}>
        <div className={styles.inner}>
          <header className={styles.sectionHead}>
            <span className={styles.eyebrowOnDark}>How it works</span>
            <h2>From sign-up to real impact</h2>
            <p className={styles.onDarkLede}>
              Getting involved is simple and clear. Here is the journey from your first
              step to making a difference.
            </p>
          </header>

          <motion.ol
            className={styles.steps}
            variants={staggerGroup}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
          >
            {steps.map((step) => (
              <motion.li key={step.n} className={styles.step} variants={riseItem}>
                <span className={styles.stepNum}>{step.n}</span>
                <div className={styles.stepBody}>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* ── Who we're looking for ── */}
      <section className={styles.who}>
        <div className={styles.inner}>
          <div className={styles.whoGrid}>
            <div className={styles.whoCopy}>
              <span className={styles.eyebrow}>Who we&apos;re looking for</span>
              <h2>You don&apos;t need a title. You need to care.</h2>
              <p>
                We are not after perfect résumés. We are after people who show up, stay
                curious, and believe in what others can become. If these sound like you,
                you already belong here.
              </p>
            </div>
            <motion.ul
              className={styles.chips}
              variants={staggerGroup}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
            >
              {qualities.map((quality) => (
                <motion.li key={quality} className={styles.chip} variants={riseItem}>
                  {quality}
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
      </section>

      {/* ── Closing CTA (ink band) ── */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <span className={styles.eyebrowOnDark}>Ready to start?</span>
          <h2>Your contribution begins with a single step.</h2>
          <p>
            Join a community that is building real opportunity for real people. Pick a
            path and let&apos;s get to work.
          </p>
          <div className={styles.ctaActions}>
            <a className={styles.goldBtn} href="/#volunteer">
              Volunteer Now <FaArrowRight />
            </a>
            <Link className={styles.ghostBtnDark} to="/contact">
              Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GetInvolved;
