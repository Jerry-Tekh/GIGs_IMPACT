import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import FounderSection from "./FounderSection.jsx";
import aboutBg from "./../../assets/About/png2.png";

import styles from "./AboutPage.module.css";

const About = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const id = location.hash.replace("#", "");
    const element = document.getElementById(id);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, [location]);

  return (
    <div className={styles.aboutPage}>
      {/* HERO */}
      <motion.section
        className={styles.hero}
        initial={{ backgroundColor: "transparent" }}
        whileInView={{ backgroundColor: "#f5f5f5" }} // adjust
        transition={{ duration: 1 }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          About GIGs Impact Community
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          A movement focused on unlocking human potential and bridging the gap
          between talent and opportunity.
        </motion.p>
      </motion.section>

      {/* SCROLL STRIP */}
      <div className={styles.scrollStrip}>
        <div>
          <span className={styles.color1}>Talent</span>{" "}
          <span className={styles.color2}>Opportunity</span>{" "}
          <span className={styles.color3}>Growth</span>{" "}
          <span className={styles.color4}>Impact</span>{" "}
          <span className={styles.color5}>Community</span>{" "}
          <span className={styles.color6}>Innovation</span>
          <span className={styles.color1}>Talent</span>{" "}
          <span className={styles.color2}>Opportunity</span>{" "}
          <span className={styles.color3}>Growth</span>{" "}
          <span className={styles.color4}>Impact</span>{" "}
          <span className={styles.color5}>Community</span>{" "}
          <span className={styles.color6}>Innovation</span>
        </div>
      </div>

      {/* STORY */}

      <motion.section
        className={styles.grid}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h3
            className={styles.label}
            style={{ backgroundColor: "#004ade" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Our Community
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            GIGs Impact Community was born from a deep personal journey. The
            founder grew up in Agric Quarters, Coal Camp, Enugu State, where
            opportunities were limited.
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <motion.h3
            className={styles.label}
            style={{ backgroundColor: " #004ade " }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            What We Do
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            We build systems that identify talents, provide structure, and
            connect individuals to real opportunities. Our goal is to help
            people create value, income, and impact.
          </motion.p>
        </motion.div>
      </motion.section>

      {/* VALUES */}
      {/* <section className={styles.values}>
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
      </section>*/}

      <motion.section
        className={styles.grid}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.Valueimage}>
            <motion.img
              src={aboutBg}
              alt="Core Values"
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
        </motion.div>
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
         
          <motion.h3
           
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
           HOW OUR SYSTEM CREATES REAL IMPACT
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Unlike traditional learning environments, our model ensures that:
            Learning leads to practical application. Skills lead to income
            opportunities. Individuals grow into leaders and creators. Talents
            are transformed into real economic value.
          </motion.p>


          
           <motion.h3
           
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Our Long-Term Execution Model
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            GIGs Impact Community is building a scalable ecosystem that will:
            <ul>
              <li>Launch talent-driven ventures across multiple industries. </li>
              <li>Create
            platforms where members can work and earn.</li>
              <li>Develop businesses in
            sectors such as technology, creative industries, sports, education,
            and more.</li>
              <li>Generate employment opportunities through enterprise
            development.</li>
            <li>  This is how we move from individual transformation to
            national and global impact. </li>
            </ul>
               
          </motion.p>
        </motion.div>
      </motion.section>

      {/* VISION & MISSION */}
      <motion.section
        className={styles.grid}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h3
            className={styles.label}
            style={{ backgroundColor: " #004ade " }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Our Vision
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            To build a global community of independent, visionary individuals
            who believe in their ability to create change and empower others
            through the effective use of their talents.
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <motion.h3
            className={styles.label}
            style={{ backgroundColor: " #004ade " }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Our Mission
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            To build a talent-driven ecosystem that develops individuals into
            skilled, value-driven, and independent contributors while creating
            pathways for sustainable income, enterprise, and large-scale
            employment by: Developing strong values such as honesty, integrity,
            and discipline , Equipping youth with the mindset and skills
            required for success
          </motion.p>
        </motion.div>
      </motion.section>

      {/* SCROLL STRIP 2 */}
      <div className={styles.scrollStripAlt}>
        <div>
          <span className={styles.color1}>Build</span>{" "}
          <span className={styles.color2}>Empower</span>{" "}
          <span className={styles.color3}>Transform</span>{" "}
          <span className={styles.color4}>Lead</span>{" "}
          <span className={styles.color5}>Create</span>{" "}
          <span className={styles.color6}>Inspire</span>
          <span className={styles.color1}>Build</span>{" "}
          <span className={styles.color2}>Empower</span>{" "}
          <span className={styles.color3}>Transform</span>{" "}
          <span className={styles.color4}>Lead</span>{" "}
          <span className={styles.color5}>Create</span>{" "}
          <span className={styles.color6}>Inspire</span>
        </div>
      </div>

      {/* APPROACH */}
      <motion.section
        className={styles.section}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          className={styles.label}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Our Approach
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          We focus on developing values, building skills, and connecting
          individuals to opportunities. We create a system where talents are not
          wasted and individuals become self-reliant.
        </motion.p>
      </motion.section>

      <FounderSection />

      {/* FOUNDER */}
      <motion.section
        className={styles.founder}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          className={styles.label}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Founder's Message
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          "I didn't start from abundance. I started from questions. I saw
          talents wasting. I saw people waiting. And I realized something —
          change will come from building."
        </motion.p>
      </motion.section>
    </div>
  );
};

export default About;
