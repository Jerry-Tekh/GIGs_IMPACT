import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import founderImage from '../../assets/Founder.jpg';
import { siteData } from '../../SiteData.js';
import styles from './AboutPage.module.css';

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

const About = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('mission');

  const frameworkPreview = useMemo(() => siteData.programs.stages.slice(0, 3), []);

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const id = location.hash.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
                <strong>3</strong>
                <span>core anchors</span>
              </div>
              <div>
                <strong>7</strong>
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
              <span className={styles.sectionTag}>Our Community</span>
              <h2>We build people, pathways, and real opportunities for impact.</h2>
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
                  <h3>Built from lived experience and a commitment to lasting change.</h3>
                  <ul className={styles.featureList}>
                    <li>Built from lived experience</li>
                    <li>Focused on unused potential</li>
                    <li>Committed to lasting impact</li>
                  </ul>
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
          </div>
        </section>

        <section className={styles.quoteSection}>
          <div className={styles.quoteShell}>
            <span className={styles.sectionTagLight}>Founder&apos;s Message</span>
            <h2>Change will come from building.</h2>
            <p>
              &quot;I didn&apos;t start from abundance. I started from questions. I saw talents wasting. I saw people
              waiting. And I realized something, change will come from building.&quot;
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
