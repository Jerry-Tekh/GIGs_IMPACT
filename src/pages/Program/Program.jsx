import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './Program.module.css';
import { siteData } from '../../SiteData.js';

const stageDetails = [
  {
    summary: 'Participants develop identity clarity, discipline, and personal direction before skill acceleration begins.',
    detail:
      'This phase builds the mindset foundation that helps every later skill produce stronger, more sustainable results.',
    deliverables: ['Self-leadership habits', 'Personal vision mapping', 'Emotional regulation', 'Daily structure']
  },
  {
    summary: 'Communication, collaboration, and critical thinking become visible strengths in real-world interactions.',
    detail:
      'The goal is not only confidence, but dependable professional behavior that raises trust and team value.',
    deliverables: ['Clear communication', 'Team collaboration', 'Critical reasoning', 'Professional presence']
  },
  {
    summary: 'Learners build core technical ability that can be translated into practical work, service, or enterprise.',
    detail:
      'This stage turns raw interest into useful competence with structured training and repeatable execution.',
    deliverables: ['Digital literacy', 'Execution skills', 'Project structure', 'Applied competence']
  },
  {
    summary: 'Participants learn how to position value, attract opportunities, and communicate offers persuasively.',
    detail:
      'The framework helps members understand how relevance and visibility affect income and opportunity.',
    deliverables: ['Offer positioning', 'Market understanding', 'Sales confidence', 'Audience communication']
  },
  {
    summary: 'Leadership and management capacity begin to shape stronger decisions, ownership, and group outcomes.',
    detail:
      'This phase moves a participant from self-development into broader influence and responsible stewardship.',
    deliverables: ['Decision quality', 'Team guidance', 'Strategic thinking', 'Responsible leadership']
  },
  {
    summary: 'Participants mature into system-aware leaders who can contribute credibly in global conversations and structures.',
    detail:
      'The emphasis here is ethical leadership, adaptability, and navigating complexity with maturity.',
    deliverables: ['Systems thinking', 'Global relevance', 'Ethical judgment', 'Executive maturity']
  },
  {
    summary: 'The final phase anchors a lifelong cycle of development, contribution, mentorship, and legacy.',
    detail:
      'Growth does not end with competence; it continues through service, innovation, and multiplying impact in others.',
    deliverables: ['Mentorship mindset', 'Continuous learning', 'Legacy orientation', 'Scalable impact']
  }
];

const programs = [
  {
    id: 1,
    name: 'Digital Skills Bootcamp',
    category: 'skills',
    duration: '8 weeks',
    level: 'Beginner to Intermediate',
    description:
      'Master essential digital skills including e-commerce, digital marketing, and content creation to boost your online earning potential.',
    topics: ['E-Commerce Platform Management', 'Digital Marketing', 'Social Media Strategy', 'Content Creation']
  },
  {
    id: 2,
    name: 'Financial Literacy Program',
    category: 'finance',
    duration: '6 weeks',
    level: 'All Levels',
    description:
      'Learn to manage income volatility, save effectively, and plan for your financial future in the gig economy.',
    topics: ['Income Management', 'Savings Planning', 'Tax Basics', 'Investment Fundamentals', 'Risk Management']
  },
  {
    id: 3,
    name: 'Entrepreneurship Accelerator',
    category: 'leadership',
    duration: '12 weeks',
    level: 'Intermediate to Advanced',
    description:
      'Transform your gig work into a sustainable business with mentorship, business planning, and growth strategies.',
    topics: ['Business Planning', 'Marketing Strategy', 'Customer Acquisition', 'Scaling Operations', 'Funding Basics']
  },
  {
    id: 4,
    name: 'Professional Development Series',
    category: 'skills',
    duration: '4 weeks',
    level: 'All Levels',
    description:
      'Build professional skills including communication, negotiation, time management, and personal branding.',
    topics: ['Communication Skills', 'Negotiation Tactics', 'Time Management', 'Personal Branding']
  },
  {
    id: 5,
    name: 'Wellness & Mental Health',
    category: 'wellness',
    duration: '8 weeks',
    level: 'All Levels',
    description:
      'Support your well-being with programs focused on work-life balance, stress management, and mental health.',
    topics: ['Stress Management', 'Work-Life Balance', 'Health Insurance Guidance', 'Community Support']
  },
  {
    id: 6,
    name: 'Industry-Specific Training',
    category: 'skills',
    duration: 'Varies',
    level: 'Specialized',
    description:
      'Targeted training for delivery drivers, freelancers, translators, and other gig economy sectors.',
    topics: ['Delivery Optimization', 'Freelance Best Practices', 'Client Management', 'Quality Excellence']
  }
];

const Program = () => {
  const [activeTab, setActiveTab] = useState('all');

  const framework = useMemo(
    () =>
      siteData.programs.stages.map((stage, index) => ({
        ...stage,
        ...stageDetails[index]
      })),
    []
  );

  const filteredPrograms = activeTab === 'all' ? programs : programs.filter((program) => program.category === activeTab);

  return (
    <div className={styles.page}>
      <motion.section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Programs</span>
            <h1>Our programs are built around the same 7-stage transformation system you see on the home page.</h1>
            <p>
              We do not offer disconnected trainings. We build a guided pathway that moves people from
              self-discovery into competence, value creation, income, leadership, and long-term impact.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryBtn} href="#stage-framework">
                View Seven-Stage Framework
              </a>
              <a className={styles.secondaryBtn} href="#program-catalog">
                Explore Program Tracks
              </a>
            </div>
          </div>

          <div className={styles.heroPanel}>
            <span className={styles.panelLabel}>Transformation Path</span>
            <h2>Potential to Skill to Value to Income to Influence</h2>
            <p>
              Every training experience is designed to sit inside a bigger development architecture, not outside
              it.
            </p>
            <div className={styles.heroStats}>
              <div>
                <strong>Seven</strong>
                <span>framework stages</span>
              </div>
              <div>
                <strong>Six Plus</strong>
                <span>program tracks</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className={styles.frameworkSection} id="stage-framework">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Seven-Stage Framework</span>
          <h2>The full journey from self-awareness to lifelong impact.</h2>
          <p>
            Every stage below expands our framework.
            Each phase has its own mindset, skill, and opportunity focus that builds on the previous one.
          </p>
        </div>

        <div className={styles.frameworkFlow}>
          {framework.map((stage, index) => (
            <article key={stage.stage} className={styles.stageCard}>
              <div className={styles.stageHead}>
                <span className={styles.stageIndex}>Stage {stage.stage}</span>
                <span className={styles.stageStatus}>Framework Phase</span>
              </div>

              <h3>{stage.title}</h3>
              <p className={styles.stageSummary}>{stage.summary}</p>
              <p className={styles.stageDetail}>{stage.detail}</p>

              <div className={styles.stageColumns}>
                <div>
                  <span className={styles.columnLabel}>Core focus</span>
                  <div className={styles.tokenList}>
                    {stage.focus.map((item) => (
                      <span key={item} className={styles.token}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className={styles.columnLabel}>Development outcomes</span>
                  <div className={styles.tokenList}>
                    {stage.deliverables.map((item) => (
                      <span key={item} className={styles.token}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {index < framework.length - 1 && <div className={styles.stageConnector} aria-hidden="true" />}
            </article>
          ))}
        </div>
      </section>

      <section className={styles.catalogSection} id="program-catalog">
        <div className={styles.catalogIntro}>
          <div>
            <span className={styles.sectionTag}>Program Tracks</span>
            <h2>Practical learning experiences built inside the framework.</h2>
          </div>

          <div className={styles.filterContainer}>
            <button className={`${styles.filterBtn} ${activeTab === 'all' ? styles.active : ''}`} onClick={() => setActiveTab('all')}>
              All Programs
            </button>
            <button className={`${styles.filterBtn} ${activeTab === 'skills' ? styles.active : ''}`} onClick={() => setActiveTab('skills')}>
              Skills Development
            </button>
            <button className={`${styles.filterBtn} ${activeTab === 'finance' ? styles.active : ''}`} onClick={() => setActiveTab('finance')}>
              Financial Programs
            </button>
            <button className={`${styles.filterBtn} ${activeTab === 'leadership' ? styles.active : ''}`} onClick={() => setActiveTab('leadership')}>
              Leadership
            </button>
            <button className={`${styles.filterBtn} ${activeTab === 'wellness' ? styles.active : ''}`} onClick={() => setActiveTab('wellness')}>
              Wellness
            </button>
          </div>
        </div>

        <div className={styles.programsGrid}>
          {filteredPrograms.map((program) => (
            <article key={program.id} className={styles.programCard}>
              <div className={styles.cardTop}>
                <span className={styles.categoryBadge}>{program.category.toUpperCase()}</span>
                <span className={styles.comingSoonBadge}>COMING SOON</span>
              </div>

              <h3>{program.name}</h3>
              <p className={styles.description}>{program.description}</p>

              <div className={styles.programMeta}>
                <span className={styles.metaItem}>
                  <strong>Duration:</strong> {program.duration}
                </span>
                <span className={styles.metaItem}>
                  <strong>Level:</strong> {program.level}
                </span>
              </div>

              <div className={styles.topics}>
                <p className={styles.topicsTitle}>Key Topics</p>
                <div className={styles.topicsList}>
                  {program.topics.map((topic) => (
                    <span key={topic} className={styles.topic}>
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <button className={styles.enrollBtn}>Explore Program</button>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaShell}>
          <div>
            <span className={styles.sectionTagLight}>Next Step</span>
            <h2>Ready to grow through a structure that turns ability into measurable value?</h2>
          </div>

          <div className={styles.ctaActions}>
            <Link to="/contact" className={styles.primaryBtn}>
              Talk To Us
            </Link>
            <a href="#stage-framework" className={styles.secondaryBtnLight}>
              Revisit The Framework
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Program;
