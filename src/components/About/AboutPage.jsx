import React from 'react';
import styles from './AboutPage.module.css';

const AboutPage = () => {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2000" 
            alt="GigImpact Community" 
          />
        </div>

        <div className={styles.heroContent}>
          <span className={styles.heroNumber}>About</span>
          <h1>Empowering Gig<br />Workers Globally</h1>
          <p>Building sustainable livelihoods and creating opportunities for the gig economy workforce</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.philosophySection}>
        <div className={styles.philosophyHeading}>
          <span>Our Purpose</span>
          <h2>Who We Are &<br />What We Do</h2>
        </div>

        <div className={styles.philosophyContent}>
          <h2>
            GigImpact is a leading social enterprise dedicated to empowering gig economy workers through skills training, financial literacy, and community support programs.
          </h2>

          <div className={styles.descriptionGrid}>
            <p>
              We recognize the challenges faced by gig workers—lack of job security, limited benefits, and uncertainty about their future. GigImpact creates pathways for these hardworking individuals to build sustainable livelihoods through comprehensive training programs, mentorship, and access to resources.
            </p>
            <p>
              Our impact spans across multiple sectors including delivery, transportation, freelancing, and platform-based work. We've helped thousands of gig workers increase their earnings by 40%, develop entrepreneurial skills, and transition into stable opportunities when they're ready.
            </p>
          </div>

          <ul className={styles.linksList}>
            <p style={{fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem'}}>Our Core Values</p>
            <li><a href="#mvv">Mission, Vision & Values</a></li>
            <li><a href="#team">Meet Our Team</a></li>
            <li><a href="#impact">Our Impact Stories</a></li>
          </ul>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statCard}>
          <h3>50K+</h3>
          <p>Gig Workers Trained</p>
        </div>
        <div className={styles.statCard}>
          <h3>$2.5M</h3>
          <p>Additional Income Generated</p>
        </div>
        <div className={styles.statCard}>
          <h3>25+</h3>
          <p>Countries Served</p>
        </div>
        <div className={styles.statCard}>
          <h3>95%</h3>
          <p>Satisfaction Rate</p>
        </div>
      </section>

      {/* Approach Section */}
      <section className={styles.approachSection}>
        <h2>Our Approach</h2>
        <div className={styles.approachGrid}>
          <div className={styles.approachCard}>
            <h4>🎓 Skills Development</h4>
            <p>Industry-relevant training programs designed to enhance earning potential and career growth</p>
          </div>
          <div className={styles.approachCard}>
            <h4>💰 Financial Empowerment</h4>
            <p>Financial literacy workshops and tools to help manage income volatility and build savings</p>
          </div>
          <div className={styles.approachCard}>
            <h4>🤝 Community Support</h4>
            <p>Peer networks and mentorship programs connecting gig workers for mutual support and growth</p>
          </div>
          <div className={styles.approachCard}>
            <h4>💼 Career Pathways</h4>
            <p>Guidance toward sustainable income options and entrepreneurial opportunities</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;