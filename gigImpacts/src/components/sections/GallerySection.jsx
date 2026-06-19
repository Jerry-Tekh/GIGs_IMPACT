import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import styles from './GallerySection.module.css';

import gPath from '../../assets/sucesspath.jpg';
import gCompetence from '../../assets/WhatWeDo/competence1.jpg';
import gVolunteer from '../../assets/volunteer3.png';
import gWhat from '../../assets/WhatWeDo/whatwedo2.jpg';
import gSoft from '../../assets/WhatWeDo/softskills.png';
import gExplore from '../../assets/explore.png';

const MOMENTS = [
  {
    img: gPath,
    tag: 'Talent Development',
    title: 'Helping young people discover and build their talent',
    span: 'wide'
  },
  {
    img: gCompetence,
    tag: 'Skills Training',
    title: 'Hands-on sessions that turn learning into real ability'
  },
  {
    img: gVolunteer,
    tag: 'Community',
    title: 'Volunteers and members building the mission together'
  },
  {
    img: gSoft,
    tag: 'Soft Skills',
    title: 'Communication, collaboration, and confidence in practice'
  },
  {
    img: gWhat,
    tag: 'Mentorship',
    title: 'Mentors guiding members through real growth and decisions',
    span: 'wide'
  },
  {
    img: gExplore,
    tag: 'Outreach',
    title: 'Meeting people where they are and opening new pathways'
  }
];

const GallerySection = () => (
  <section className={styles.section} id="gallery">
    <div className={styles.inner}>
      <header className={styles.head}>
        <div>
          <span className={styles.eyebrow}>In The Community</span>
          <h2 className={styles.title}>Our work, in moments.</h2>
          <p className={styles.lead}>
            Training, mentorship, outreach, and community — a look at how GIGs Impact turns potential
            into skill, value, and opportunity on the ground.
          </p>
        </div>
        <Link to="/get-involved" className={styles.headLink}>
          Be part of it <FaArrowRight aria-hidden="true" />
        </Link>
      </header>

      <div className={styles.grid}>
        {MOMENTS.map((m) => (
          <figure
            key={m.title}
            className={`${styles.tile} ${m.span === 'wide' ? styles.wide : ''}`}
          >
            <img src={m.img} alt={m.title} loading="lazy" decoding="async" />
            <figcaption className={styles.caption}>
              <span className={styles.tag}>{m.tag}</span>
              <p className={styles.captionTitle}>{m.title}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);

export default GallerySection;
