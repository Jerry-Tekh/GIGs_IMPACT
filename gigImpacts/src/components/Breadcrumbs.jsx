import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import styles from './Breadcrumbs.module.css';

const LABELS = {
  about: 'About',
  programs: 'Programs',
  blog: 'Blog',
  contact: 'Contact',
  privacy: 'Privacy Policy',
  terms: 'Terms of Use',
  'get-involved': 'Get Involved'
};

const Breadcrumbs = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  // Hidden on the home page
  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const isId = i > 0; // e.g. /blog/:id — don't try to label raw ids
    const label = LABELS[seg] || (isId ? 'Article' : seg.charAt(0).toUpperCase() + seg.slice(1));
    return { path, label, last: i === segments.length - 1 };
  });

  return (
    <nav className={styles.crumbs} aria-label="Breadcrumb">
      <Link to="/" className={styles.crumbLink}>Home</Link>
      {crumbs.map((c) => (
        <span key={c.path} className={styles.crumbGroup}>
          <FaChevronRight className={styles.sep} aria-hidden="true" />
          {c.last ? (
            <span className={styles.current} aria-current="page">{c.label}</span>
          ) : (
            <Link to={c.path} className={styles.crumbLink}>{c.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
