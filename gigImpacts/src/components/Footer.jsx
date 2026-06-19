import React from "react";
import { Link } from "react-router-dom";
import {
  FaInstagram, FaFacebook, FaLinkedin, FaYoutube,
  FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaArrowRight, FaArrowUp
} from "react-icons/fa";
import { motion } from "framer-motion";
import styles from "./Footer.module.css";
import logo from "./../assets/logo.png";
import { siteData } from "../SiteData.js";
import { smoothScrollToY } from "../utils/smoothScroll.js";

const Footer = () => {
  const org = siteData.org || {};

  return (
    <footer className={styles.footer}>
      {/* Call-to-action band */}
      <div className={styles.ctaBand}>
        <div className={styles.ctaInner}>
          <div>
            <span className={styles.ctaKicker}>Join the movement</span>
            <h2 className={styles.ctaTitle}>Help us turn overlooked talent into lasting impact.</h2>
          </div>
          <Link to="/get-involved" className={styles.ctaBtn}>
            Get Involved <FaArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>

      <motion.div
        className={styles.top}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        {/* Brand */}
        <div className={styles.brand}>
          <Link to="/" className={styles.brandLockup} aria-label="GIGs Impact Community — home">
            <img src={logo} alt="GIGs Impact Community logo" />
            <span>GIGs Impact Community</span>
          </Link>
          <p className={styles.brandMission}>
            Transforming mindsets and unlocking talent — building structured pathways that move
            young people from potential to skill to lasting impact.
          </p>
          <div className={styles.socials}>
            <a href="https://youtube.com/@gigsimpact?si=H00lBKE5d-jW41R9" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://www.facebook.com/profile.php?id=100091976651385" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://www.linkedin.com" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="https://youtube.com/@gigsimpact?si=H00lBKE5d-jW41R9" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </div>

        {/* Link columns */}
        <nav className={styles.links} aria-label="Footer">
          <div className={styles.linkCol}>
            <h4>Explore</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/programs">Programs</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>
          <div className={styles.linkCol}>
            <h4>Get Involved</h4>
            <ul>
              <li><Link to="/get-involved">Volunteer</Link></li>
              <li><Link to="/donate">Donate</Link></li>
              <li><Link to="/get-involved">Partner With Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className={styles.linkCol}>
            <h4>Resources</h4>
            <ul>
              <li><Link to="/blog">Insights &amp; Stories</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Use</Link></li>
            </ul>
          </div>
        </nav>

        {/* Contact */}
        <div className={styles.contact}>
          <h4>Reach Us</h4>
          <ul>
            <li>
              <a href={`mailto:${org.email || "gigsimpact@gmail.com"}`}>
                <FaEnvelope aria-hidden="true" />
                <span>{org.email || "gigsimpact@gmail.com"}</span>
              </a>
            </li>
            <li>
              <a href={`tel:${org.phone || "08146163211"}`}>
                <FaPhoneAlt aria-hidden="true" />
                <span>{org.phone || "08146163211"}</span>
              </a>
            </li>
            <li className={styles.location}>
              <FaMapMarkerAlt aria-hidden="true" />
              <span>{org.location || "Enugu State, Nigeria"}</span>
            </li>
          </ul>
        </div>
      </motion.div>

      <div className={styles.bottom}>
        <p className={styles.copy}>
          © 2026 GIGs Impact Community. A youth empowerment &amp; human-capacity development community.
        </p>
        <div className={styles.bottomRight}>
          <div className={styles.legal}>
            <Link to="/privacy">Privacy</Link>
            <span aria-hidden="true">·</span>
            <Link to="/terms">Terms</Link>
            <span aria-hidden="true">·</span>
            <Link to="/contact">Contact</Link>
          </div>
          <button type="button" className={styles.toTop} onClick={() => smoothScrollToY(0)} aria-label="Back to top">
            <FaArrowUp aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
