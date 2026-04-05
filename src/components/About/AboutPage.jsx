import React from "react";
import { color, motion } from "framer-motion";
import FounderSection from './FounderSection.jsx';
import aboutBg from './../../assets/About/png2.png';



import styles from './AboutPage.module.css';





const About = () => {
  return (
    <div className={styles.aboutPage}>
      
      {/* HERO */}
      <section className={styles.hero}>
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
          About GIGs Impact Community
        </motion.h1>
        <p>
          A movement focused on unlocking human potential and bridging the gap
          between talent and opportunity.
        </p>
      </section>

      {/* SCROLL STRIP */}
      <div className={styles.scrollStrip}>
        <div>
          <span className={styles.color1}>Talent</span>  <span className={styles.color2}>Opportunity</span>  <span className={styles.color3}>Growth</span> <span className={styles.color4}>Impact</span> <span className={styles.color5}>Community</span> <span className={styles.color6}>Innovation</span> 
          <span className={styles.color1}>Talent</span>  <span className={styles.color2}>Opportunity</span>  <span className={styles.color3}>Growth</span>  <span className={styles.color4}>Impact</span> <span className={styles.color5}>Community</span> <span className={styles.color6}>Innovation</span> 
        </div>
      </div>

      {/* STORY */}
      <section className={`${styles.section} ${styles.storybg}`}>
        <div className="div">
        <h2 className={styles.label}>Our Story</h2>
        <p>
          GIGs Impact Community was born from a deep personal journey. The
          founder grew up in Agric Quarters, Coal Camp, Enugu State, where
          opportunities were limited.
        </p>
        <p>
          Driven by the question “Why am I here?”, he pursued knowledge and
          discovered that the greatest tragedy is not poverty, but unused
          potential.
        </p>
      
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className={styles.section}>
        <h2 className={styles.label} style={{ backgroundColor: '#ffb400' }}>What We Do</h2>
        <p>
          We build systems that identify talents, provide structure, and connect
          individuals to real opportunities. Our goal is to help people create
          value, income, and impact.
        </p>
      </section>

      {/* VALUES */}
      <section className={styles.values}>
      <div className={styles.Valueimage}>
        <img src={aboutBg} alt="Core Values"/>
      </div>
      <div >
        <h2 className={styles.label}>Core Values</h2>
        <ul>
          <li>Integrity</li>
          <li>Growth</li>
          <li>Independence</li>
          <li>Impact</li>
          <li>Community</li>
        </ul>
      </div>
      </section>

      {/* VISION & MISSION */}
      <section className={styles.grid}>
        <div>
          <h3 className={styles.label} style={{ backgroundColor: '#3ca1ff' }}>Our Vision</h3>
          <p>
          To build a global community of independent, visionary individuals
          who believe in their ability to create change and empower others
          through the effective use of their talents.
          </p>
        </div>
        <div>
          <h3 className={styles.label} style={{ backgroundColor: '#ff2200' }}>Our Mission</h3>
          <p>
           To build a talent-driven ecosystem that develops individuals into
          skilled, value-driven, and independent contributors while creating
            pathways for sustainable income, enterprise, and large-scale
            employment by: Developing strong values such as honesty, integrity, and
            discipline , Equipping youth with the mindset and skills required for success
          </p>
        </div>
      </section>

      {/* SCROLL STRIP 2 */}
      <div className={styles.scrollStripAlt}>
        <div>
          <span className={styles.color1}>Build</span>  <span className={styles.color2}>Empower</span>  <span className={styles.color3}>Transform</span> <span className={styles.color4}>Lead</span> <span className={styles.color5}>Create</span>  <span className={styles.color6}>Inspire</span> 
          <span className={styles.color1}>Build</span>  <span className={styles.color2}>Empower</span>  <span className={styles.color3}>Transform</span> <span className={styles.color4}>Lead</span> <span className={styles.color5}>Create</span>  <span className={styles.color6}>Inspire</span> 
        </div>
      </div>

      {/* APPROACH */}
      <section className={styles.section}>
        <h2 className={styles.label}>Our Approach</h2>
        <p>
          We focus on developing values, building skills, and connecting
          individuals to opportunities. We create a system where talents are not
          wasted and individuals become self-reliant.
        </p>
      </section>



      <FounderSection />

      {/* FOUNDER */}
      <section className={styles.founder}>
        <h2 className={styles.label}>Founder’s Message</h2>
        <p>
          “I didn’t start from abundance. I started from questions. I saw talents
          wasting. I saw people waiting. And I realized something — change will
          come from building.”
        </p>
      </section>
    </div>
  );
};

export default About;