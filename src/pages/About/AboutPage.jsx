import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import founderImage from '../../assets/Founder.jpg';
import { siteData } from '../../SiteData.js';
import styles from './AboutPage.module.css';
import { smoothScrollToElement, smoothScrollToY } from '../../utils/smoothScroll.js';

const aboutTabs = {
  mission:
    'To build a talent-driven ecosystem that develops individuals into skilled, value-driven, and independent contributors while creating pathways for sustainable income, enterprise, and large-scale employment by developing strong values such as honesty, integrity, and discipline and equipping youth with the mindset and skills required for success.',
  vision:
    'To build a global community of independent, visionary individuals who believe in their ability to create change and empower others through the effective use of their talents.',
  values:
    'We focus on developing values, building skills, and connecting individuals to opportunities. We create a system where talents are not wasted and individuals become self-reliant.'
};

const impactCards = [
  {
    tag: 'How We Create Impact',
    title: 'Learning leads to application, and skills lead to income.',
    text:
      'Unlike traditional learning environments, our model ensures that learning leads to practical application, skills lead to income opportunities, and individuals grow into leaders and creators. Talents are transformed into real economic value.'
  },
  {
    tag: 'Execution Model',
    title: 'We are building long-term systems, not one-off interventions.',
    points: [
      'Launch talent-driven ventures across multiple industries.',
      'Create platforms where members can work and earn.',
      'Develop businesses in technology, creative industries, sports, education, and more.',
      'Generate employment opportunities through enterprise development.'
    ]
  }
];

const founderStoryLines = [
  "I didn't start from abundance. I started from questions.",
  "I saw talents wasting. I saw people waiting. I saw a system that wasn't creating enough opportunities. And I realized something: change will not come from waiting, it will come from building.",
  'GIGs Impact Community is not just an organization. It is a movement to help people discover who they are, use what they have, and create something meaningful from it.',
  "You don't need everything to start. You just need to start with what you have.",
  'Stay with us. You will discover something about your life.'
];

const About = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('mission');

  const frameworkPreview = useMemo(() => siteData.programs.stages.slice(0, 2), []);

  useEffect(() => {
    if (!location.hash) {
      smoothScrollToY(0);
      return;
    }

    const id = location.hash.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      setTimeout(() => {
        smoothScrollToElement(element, 100);
      }, 50);
    }
  }, [location]);

  return (
    <div className={styles.page}>
      <motion.section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>About Us</span>
            <h1>We are building a movement that turns overlooked talent into structure, value, and impact.</h1>
            <p>
              GIGs Impact Community exists to help people move from potential to clarity, skill, income,
              leadership, and long-term contribution through a connected development system.
            </p>

            <div className={styles.heroActions}>
              <a className={styles.primaryBtn} href="#our-story">
                Explore Our Story
              </a>
              <Link className={styles.secondaryBtn} to="/programs">
                View Programs
              </Link>
            </div>
          </div>

          <div className={styles.heroPanel}>
            <span className={styles.panelLabel}>What Drives Us</span>
            <h2>People should not stay trapped in unused potential when structure can change the story.</h2>
            <p>
              We combine values formation, practical capability, and opportunity pathways so growth becomes
              visible in everyday life.
            </p>

            <div className={styles.heroStats}>
              <div>
                <strong>Three</strong>
                <span>core anchors</span>
              </div>
              <div>
                <strong>Seven</strong>
                <span>growth stages</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <main className={styles.main}>
        <section className={styles.storySection} id="our-story">
          <div className={styles.storyGrid}>
            <div className={styles.storyCopy}>
              <span className={styles.sectionTag}>Founder&apos;s Story</span>
              <h2>What began with hard questions became a movement built to unlock unused potential.</h2>
              <p>
                GIGs Impact Community was born from a deep personal journey. The founder grew up in Agric
                Quarters, Coal Camp, Enugu State, where opportunities were limited and survival often shaped what
                felt possible.
              </p>
              <p id="what-we-do">
                Instead of accepting that limitation as the final story, the vision became clear: build systems
                that identify talent, provide structure, and connect people to practical opportunities that create
                value, income, and influence.
              </p>

              <div className={styles.tabButtons}>
                {Object.keys(aboutTabs).map((tab) => (
                  <button
                    key={tab}
                    className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                    onClick={() => setActiveTab(tab)}
                    type="button"
                  >
                    {tab === 'values' ? 'Our Values' : tab}
                  </button>
                ))}
              </div>

              <article className={styles.tabPanel}>
                <span className={styles.panelCaption}>Current Focus</span>
                <p>{aboutTabs[activeTab]}</p>
              </article>
            </div>

            <div className={styles.storyVisual} id="founder-story">
              <div className={styles.imageShell}>
                <img src={founderImage} alt="Founder of GIGs Impact Community" className={styles.profileImg} />
                <div className={styles.floatingCard}>
                  <span className={styles.panelCaption}>Founder Story</span>
                  <h3>"You don't need everything to start. You just need to start with what you have."</h3>
                  <div className={styles.storyQuote}>
                    {founderStoryLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.impactSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>How It Works</span>
            <h2>The same transformation logic on the homepage also shapes our mission in practice.</h2>
            <p>
              We are not building disconnected activities. We are creating a full ecosystem that develops people,
              equips them, and connects them to meaningful outcomes.
            </p>
          </div>

          <div className={styles.impactGrid}>
            {impactCards.map((card) => (
              <article key={card.title} className={styles.infoCard}>
                <span className={styles.sectionTag}>{card.tag}</span>
                <h3>{card.title}</h3>
                {card.text ? <p>{card.text}</p> : null}
                {card.points ? (
                  <ul className={styles.pointList}>
                    {card.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className={styles.frameworkSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Framework Snapshot</span>
            <h2>Our programs sit inside a bigger journey of personal and economic transformation.</h2>
          </div>

          <div className={styles.frameworkGrid}>
            {frameworkPreview.map((stage) => (
              <article key={stage.stage} className={styles.frameworkCard}>
                <span className={styles.stageIndex}>Stage {stage.stage}</span>
                <h3>{stage.title}</h3>
                <div className={styles.tokenList}>
                  {stage.focus.map((item) => (
                    <span key={item} className={styles.token}>
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}

            <article className={`${styles.frameworkCard} ${styles.frameworkCtaCard}`}>
              <span className={styles.stageIndex}>Full Journey</span>
             
              <p>
                Explore all seven stages and see how the full development path moves from self-discovery to
                lifelong impact.
              </p>
              <Link to="/programs#stage-framework" className={styles.frameworkCtaBtn}>
                View Seven-Stage Framework
              </Link>
            </article>
          </div>
        </section>

        <section className={styles.quoteSection}>
          <div className={styles.quoteShell}>
            <span className={styles.sectionTagLight}>Founder&apos;s Message</span>
            <h2>Change will come from building.</h2>
            <p>
              The work of this community starts with a simple belief: people do not need perfect conditions to
              begin. They need clarity, structure, and the courage to start with what they already have.
            </p>
            <Link to="/contact" className={styles.primaryBtn}>
              Connect With Us
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
