import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './Legal.module.css';
import { siteData } from '../../SiteData.js';
import { smoothScrollToY } from '../../utils/smoothScroll.js';

const CONTENT = {
  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    intro:
      'GIGs Impact Community respects your privacy. This policy explains what information we collect, how we use it, and the choices you have.',
    updated: 'Last updated: June 2026',
    sections: [
      {
        h: 'Information We Collect',
        p: 'When you volunteer, subscribe, or contact us, we may collect your name, email address, phone number, and any details you choose to share. We also collect basic, non-identifying usage data to improve the website.'
      },
      {
        h: 'How We Use Your Information',
        p: 'We use your information to respond to enquiries, process volunteer and partnership applications, send updates you have requested, and improve our programs and communications. We do not sell your personal data.'
      },
      {
        h: 'Data Protection',
        p: 'We apply reasonable technical and organisational measures to protect your information. Form submissions are validated with reCAPTCHA to prevent abuse, and access to personal data is limited to authorised team members.'
      },
      {
        h: 'Your Choices',
        p: 'You may request access to, correction of, or deletion of your personal data at any time. To unsubscribe from updates or make a request, contact us using the details below.'
      },
      {
        h: 'Contact',
        p: `For any privacy questions, email ${siteData.org.email} or call ${siteData.org.phone}.`
      }
    ]
  },
  terms: {
    eyebrow: 'Legal',
    title: 'Terms of Use',
    intro:
      'By using the GIGs Impact Community website you agree to these terms. Please read them carefully.',
    updated: 'Last updated: June 2026',
    sections: [
      {
        h: 'Use of This Website',
        p: 'This website is provided for information about GIGs Impact Community, our programs, and ways to get involved. You agree to use it lawfully and not to disrupt or misuse the service.'
      },
      {
        h: 'Programs & Participation',
        p: 'Information about programs, stages, and outcomes is provided in good faith and may change as our work evolves. Participation in any program is subject to the specific terms communicated for that program.'
      },
      {
        h: 'Intellectual Property',
        p: 'Content on this site — text, graphics, and logos — belongs to GIGs Impact Community unless otherwise stated, and may not be reproduced for commercial use without permission.'
      },
      {
        h: 'Third-Party Links',
        p: 'Our site may link to external sites and social platforms. We are not responsible for the content or privacy practices of those third parties.'
      },
      {
        h: 'Contact',
        p: `Questions about these terms? Email ${siteData.org.email} or call ${siteData.org.phone}.`
      }
    ]
  }
};

const LegalPage = ({ type = 'privacy' }) => {
  const data = CONTENT[type] || CONTENT.privacy;

  useEffect(() => {
    smoothScrollToY(0);
  }, [type]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>{data.eyebrow}</span>
          <h1 className={styles.title}>{data.title}</h1>
          <p className={styles.updated}>{data.updated}</p>
        </div>
      </section>

      <motion.section
        className={styles.body}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.bodyInner}>
          <p className={styles.intro}>{data.intro}</p>
          {data.sections.map((s, i) => (
            <article key={s.h} className={styles.block}>
              <span className={styles.blockNum}>{String(i + 1).padStart(2, '0')}</span>
              <div className={styles.blockBody}>
                <h2 className={styles.blockTitle}>{s.h}</h2>
                <p>{s.p}</p>
              </div>
            </article>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default LegalPage;
