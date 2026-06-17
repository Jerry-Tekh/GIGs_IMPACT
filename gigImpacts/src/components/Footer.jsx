import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import styles from "./Footer.module.css";
import logo from "./../assets/logo.png";

const Footer = () => {
  return (
    <motion.footer
      className={styles.footer}
      initial={{ backgroundColor: "transparent" }}
      whileInView={{ backgroundColor: "#000" }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className={styles.top}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.div className={styles.brand}>
          <Link to="/" className={styles.brandLockup} aria-label="GIGs Impact Community — home">
            <img src={logo} alt="GIGs Impact Community logo" />
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              GIGs Impact Community
            </motion.h2>
          </Link>
          <p className={styles.brandMission}>
            Transforming mindsets and unlocking talent — building structured
            pathways that move young people from potential to skill to lasting impact.
          </p>
          <div className={styles.socials}>
            <a href="https://youtube.com/@gigsimpact?si=H00lBKE5d-jW41R9" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://www.facebook.com/profile.php?id=100091976651385" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://www.linkedin.com" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="https://youtube.com/@gigsimpact?si=H00lBKE5d-jW41R9" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </motion.div>
        <div className={styles.links}>
          <div>
            <motion.h4
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              ABOUT US
            </motion.h4>
            <ul>
              <li><Link to="/about#ourstory">Our Story</Link></li>
              {/*<li><Link to="/about#mission">Mission</Link></li>
              <li><Link to="/about#vision">Vision</Link></li>*/} 
            </ul>
          </div>
          <div>
            <motion.h4
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              PROGRAMS
            </motion.h4>
            <ul>
              <li><Link to="/about#what-we-do">7-Stage Framework</Link></li>
              <li><Link to="/programs">Cohort Learning</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>
          <div>
            <motion.h4
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              GET INVOLVED
            </motion.h4>
            <ul>
              <li><Link to="/#volunteer">Volunteer</Link></li>
              <li><Link to="/#bridge">Partner</Link></li>
            </ul>
          </div>
          <div>
            <motion.h4
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              CONTACT
            </motion.h4>
            <ul>
              <li>
                <a href="mailto:gigsimpact@gmail.com">
                  <FaEnvelope /> gigsimpact@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:08146163211">
                  <FaPhoneAlt /> 08146163211
                </a>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
      <motion.div
        className={styles.bottom}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <p>© Copyright 2026 GIGs Impact Community. All Rights Reserved.</p>
        <div className={styles.legal}>Privacy Policy | <Link to="/contact">Contact Us</Link></div>
      </motion.div>
    </motion.footer>
  );
};
export default Footer;
