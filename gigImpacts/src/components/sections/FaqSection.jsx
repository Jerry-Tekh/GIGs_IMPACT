import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import styles from './FaqSection.module.css';

const FAQS = [
  {
    q: 'Who can join GIGs Impact programs?',
    a: 'Our programs are built for young people who are ready to discover their talent and grow it into real skill, income, and impact — regardless of where they are starting from. Willingness and commitment matter more than your current level.'
  },
  {
    q: 'How much does it cost to participate?',
    a: 'We work to keep participation as accessible as possible. Specific requirements are shared per cohort and program. Reach out and we will guide you on the current options.'
  },
  {
    q: 'Do I need prior skills or experience?',
    a: 'No. The 7-stage framework starts with self-awareness and foundational mindset, then builds practical and technical skills step by step — so beginners and more experienced people both have a clear path.'
  },
  {
    q: 'How can I volunteer or partner with you?',
    a: 'Visit the Get Involved page to apply as a volunteer, mentor, or partner organization. We welcome trainers, facilitators, mentors, event organizers, and content collaborators.'
  },
  {
    q: 'How are donations used?',
    a: 'Support goes directly into program delivery, opportunity and enterprise pathways, and the systems that let us sustain and scale our impact. See the Donate page for the breakdown.'
  },
  {
    q: 'Where is GIGs Impact based?',
    a: 'We are rooted in Enugu State, Nigeria, with a vision to reach young people across Africa through a connected, talent-driven community.'
  }
];

const FaqSection = () => {
  const [open, setOpen] = useState(0);

  return (
    <section className={styles.section} id="faq">
      <div className={styles.inner}>
        <div className={styles.head}>
          <span className={styles.eyebrow}>FAQ</span>
          <h2 className={styles.title}>Questions, answered.</h2>
          <p className={styles.lead}>
            A few of the things people ask most. Can&apos;t find what you need? Use the form above and
            we&apos;ll respond within one business day.
          </p>
        </div>

        <div className={styles.list}>
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}>
                <button
                  type="button"
                  className={styles.q}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <FaPlus className={styles.icon} aria-hidden="true" />
                </button>
                <div className={styles.aWrap} role="region">
                  <p className={styles.a}>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
