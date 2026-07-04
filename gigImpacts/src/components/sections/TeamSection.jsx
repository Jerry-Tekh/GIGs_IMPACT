import React from 'react';
import styles from './TeamSection.module.css';

const TEAM = [
  { name: 'Founder & Visionary', role: 'Leadership', text: 'Set the direction of the community — turning a personal journey out of Enugu into a movement that builds talent and opportunity.' },
  { name: 'Programs Lead', role: 'Programs & Training', text: 'Designs and runs the 7-stage framework, cohorts, and the day-to-day learning experience members move through.' },
  { name: 'Community Lead', role: 'Community & Partnerships', text: 'Grows the network — connecting members, volunteers, mentors, and partner organizations around the mission.' },
  { name: 'Operations Lead', role: 'Operations & Impact', text: 'Keeps the systems running and the impact measurable, so growth is sustainable and accountable.' }
];

const initials = (name) =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

const TeamSection = () => (
  <section className={styles.section} id="team">
    <div className={styles.inner}>
      <div className={styles.head}>
        <span className={styles.eyebrow}>Leadership &amp; Team</span>
        <h2 className={styles.title}>The people building the movement.</h2>
        <p className={styles.lead}>
          A committed team turning vision into structured, on-the-ground impact for young people.
        </p>
      </div>

      <div className={styles.grid}>
        {TEAM.map((member) => (
          <article key={member.name} className={styles.card}>
            <span className={styles.avatar} aria-hidden="true">{initials(member.name)}</span>
            <span className={styles.role}>{member.role}</span>
            <h3 className={styles.name}>{member.name}</h3>
            <p className={styles.text}>{member.text}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default TeamSection;
