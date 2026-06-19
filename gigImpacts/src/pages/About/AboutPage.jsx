import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import founderImage from '../../assets/Founder.jpg';
import { siteData } from '../../SiteData.js';
import styles from './AboutPage.module.css';
import { smoothScrollToElement, smoothScrollToY } from '../../utils/smoothScroll.js';
import { sectionFade, slideLeft, slideRight, staggerGroup, viewport } from '../../utils/motion.js';

const approachItems = [
  {
    title: 'We identify talent',
    text: 'We help people discover what they are genuinely good at — moving them from confusion to clarity about their direction.'
  },
  {
    title: 'We build real capability',
    text: 'Through a structured framework, raw ability becomes practical, in-demand skill that holds up in the real world.'
  },
  {
    title: 'We connect skill to income',
    text: 'Skills are turned into value — opportunities to work, earn, build ventures, and grow into leaders and creators.'
  },
  {
    title: 'We sustain long-term systems',
    text: 'Not one-off interventions, but talent-driven ventures and platforms across industries that keep creating opportunity.'
  }
];

const founderStoryLines = [
  "I didn't start from abundance. I started from questions.",
  "I saw talents wasting. I saw people waiting. I saw a system that wasn't creating enough opportunities. And I realized something: change will not come from waiting — it will come from building.",
  'GIGs Impact Community is not just an organization. It is a movement to help people discover who they are, use what they have, and create something meaningful from it.',
  'You just need to start with what you have. Stay with us — you will discover something about your life.'
];

const About = () => {
  const location = useLocation();
  const [isFounderStoryOpen, setIsFounderStoryOpen] = useState(false);

  const frameworkPreview = useMemo(() => siteData.programs.stages.slice(0, 3), []);
  const mvv = useMemo(() => {
    const t = siteData.about?.mvvText || {};
    return [
      { label: 'Mission', text: t.mission?.text },
      { label: 'Vision', text: t.vision?.text },
      { label: 'Values', text: t.values?.text }
    ].filter((m) => m.text);
  }, []);

  const visibleStory = isFounderStoryOpen ? founderStoryLines : founderStoryLines.slice(0, 2);

  useEffect(() => {
    if (!location.hash) {
      smoothScrollToY(0);
      return;
    }
    const id = location.hash.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      setTimeout(() => smoothScrollToElement(element, 100), 50);
    }
  }, [location]);

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <motion.section className={styles.hero}>
        <div className={styles.heroInner}>
          <motion.div className={styles.heroCopy} variants={slideLeft} initial="hidden" animate="show">
            <h1>We are building a movement that turns overlooked talent into structure, value, and impact.</h1>
            <p>
              GIGs Impact Community exists to help people move from potential to clarity, skill, income,
              leadership, and long-term contribution through a connected development system.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryBtn} href="#our-story">Explore Our Story</a>
              <Link className={styles.secondaryBtn} to="/programs">View Programs</Link>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <main className={styles.main}>
        {/* ── Origin story ── */}
        <motion.section
          className={styles.storySection}
          id="our-story"
          variants={sectionFade}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
        >
          <div className={styles.storyShell}>
            <div className={styles.storyIntro}>
              <span className={styles.sectionTag}>Our Story</span>
              <h2>What began with hard questions became a movement to unlock unused potential.</h2>
            </div>
            <div className={styles.storyText}>
              <p>
                GIGs Impact Community was born from a deep personal journey. Our founder grew up in Agric
                Quarters, Coal Camp, Enugu State — where opportunity was scarce and survival often shaped
                what felt possible.
              </p>
              <p>
                Instead of accepting that limitation as the final story, a clear vision took shape: build
                systems that identify talent, provide structure, and connect people to practical
                opportunities that create value, income, and influence.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ── Founder feature ── */}
        <section className={styles.founderSection} id="founder-story">
          <div className={styles.founderGrid}>
            <motion.div
              className={styles.founderMedia}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <img src={founderImage} alt="Founder of GIGs Impact Community" loading="lazy" decoding="async" />
              <div className={styles.founderTag}>
                <strong>The Founder</strong>
                <span>GIGs Impact Community</span>
              </div>
            </motion.div>

            <motion.div
              className={styles.founderCopy}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className={styles.sectionTag}>Founder&apos;s Story</span>
              <blockquote className={styles.founderQuote}>
                &ldquo;You don&apos;t need everything to start. You just need to start with what you have.&rdquo;
              </blockquote>
              <div className={styles.founderStory} id="founder-story-panel">
                {visibleStory.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <button
                type="button"
                className={styles.storyToggle}
                onClick={() => setIsFounderStoryOpen((c) => !c)}
                aria-expanded={isFounderStoryOpen}
                aria-controls="founder-story-panel"
              >
                {isFounderStoryOpen ? 'Show less' : 'Read full story'}
                <FaArrowRight aria-hidden="true" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* ── Mission / Vision / Values ── */}
        <motion.section
          className={styles.mvvSection}
          variants={sectionFade}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
        >
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>What We Stand For</span>
            <h2>Mission, vision, and the values that guide every decision.</h2>
          </div>
          <div className={styles.mvvGrid}>
            {mvv.map((m, i) => (
              <article key={m.label} className={styles.mvvCard}>
                <span className={styles.mvvNum}>{String(i + 1).padStart(2, '0')}</span>
                <h3>{m.label}</h3>
                <p>{m.text}</p>
              </article>
            ))}
          </div>
        </motion.section>

        {/* ── How we create impact (ink band) ── */}
        <section className={styles.approachSection}>
          <div className={styles.approachInner}>
            <div className={styles.approachHead}>
              <span className={styles.sectionTagLight}>How It Works</span>
              <h2>A full ecosystem that develops people, equips them, and connects them to outcomes.</h2>
            </div>
            <motion.div
              className={styles.approachGrid}
              variants={staggerGroup}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
            >
              {approachItems.map((item, i) => (
                <motion.div key={item.title} className={styles.approachStep} variants={slideRight}>
                  <span className={styles.approachNum}>{String(i + 1).padStart(2, '0')}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Framework snapshot ── */}
        <motion.section
          className={styles.frameworkSection}
          variants={sectionFade}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
        >
          <div className={styles.frameworkShell}>
            <div className={styles.frameworkIntro}>
              <span className={styles.sectionTag}>Framework Snapshot</span>
              <h2>Our programs sit inside a bigger journey of transformation.</h2>
              <p>
                Every program is one part of a connected seven-stage path — from self-discovery to lifelong
                impact.
              </p>
              <Link to="/programs#stage-framework" className={styles.frameworkLink}>
                View the Seven-Stage Framework <FaArrowRight aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.frameworkList}>
              {frameworkPreview.map((stage) => (
                <div key={stage.stage} className={styles.frameworkRow}>
                  <span className={styles.frameworkStage}>{String(stage.stage).padStart(2, '0')}</span>
                  <div>
                    <h3>{stage.title}</h3>
                    <p>{stage.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Founder's message / CTA ── */}
        <section className={styles.quoteSection}>
          <div className={styles.quoteShell}>
            <span className={styles.sectionTagLight}>Founder&apos;s Message</span>
            <h2>Change will come from building.</h2>
            <p>
              The work of this community starts with a simple belief: people do not need perfect conditions
              to begin. They need clarity, structure, and the courage to start with what they already have.
            </p>
            <div className={styles.quoteActions}>
              <Link to="/get-involved" className={styles.primaryBtnLight}>Get Involved</Link>
              <Link to="/contact" className={styles.secondaryBtnLight}>Connect With Us</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
