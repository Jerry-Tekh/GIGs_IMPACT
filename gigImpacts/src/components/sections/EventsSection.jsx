import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import styles from './EventsSection.module.css';

const EVENTS = [
  {
    month: 'Rolling', day: '·',
    type: 'Cohort Intake',
    title: 'Foundations Cohort — Self-Awareness & Personal Mastery',
    text: 'Open enrolment for the entry stage of the 7-stage framework. Begin where the journey starts.',
    status: 'Open'
  },
  {
    month: 'Monthly', day: '·',
    type: 'Workshop',
    title: 'Skills-to-Income Practical Lab',
    text: 'Hands-on sessions where members turn a learned skill into a real, sellable offer.',
    status: 'Upcoming'
  },
  {
    month: 'Quarterly', day: '·',
    type: 'Community',
    title: 'GIGs Impact Community Gathering',
    text: 'Members, mentors, and partners connect — stories, learning, and momentum for the mission.',
    status: 'Upcoming'
  }
];

const EventsSection = () => (
  <section className={styles.section} id="events">
    <div className={styles.inner}>
      <div className={styles.head}>
        <span className={styles.eyebrow}>Events &amp; Cohorts</span>
        <h2 className={styles.title}>What&apos;s happening in the community.</h2>
        <p className={styles.lead}>
          Cohort intakes, workshops, and gatherings that move people through the journey. Reach out to
          register or learn the next dates.
        </p>
      </div>

      <div className={styles.list}>
        {EVENTS.map((e) => (
          <article key={e.title} className={styles.event}>
            <div className={styles.when}>
              <span className={styles.month}>{e.month}</span>
              <span className={styles.type}>{e.type}</span>
            </div>
            <div className={styles.body}>
              <h3 className={styles.eventTitle}>{e.title}</h3>
              <p className={styles.eventText}>{e.text}</p>
            </div>
            <div className={styles.action}>
              <span className={`${styles.status} ${e.status === 'Open' ? styles.statusOpen : ''}`}>{e.status}</span>
              <Link to="/contact" className={styles.register}>Register <FaArrowRight aria-hidden="true" /></Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default EventsSection;
