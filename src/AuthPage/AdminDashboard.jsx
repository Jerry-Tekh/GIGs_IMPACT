import React from 'react';
import { Link } from 'react-router-dom';



import styles from './AdminDashboard.module.css';



const AdminDashboard = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>GigImpact Admin Dashboard</h1>
        <p>Welcome to your admin panel</p>
      </header>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Blog Posts</h3>
          <p>Manage your blog content</p>
          <Link to="/blog" className={styles.link}>View Blog</Link>
        </div>

        <div className={styles.card}>
          <h3>Analytics</h3>
          <p>View site statistics</p>
          <span className={styles.comingSoon}>Coming Soon</span>
        </div>

        <div className={styles.card}>
          <h3>Users</h3>
          <p>Manage user accounts</p>
          <span className={styles.comingSoon}>Coming Soon</span>
        </div>

        <div className={styles.card}>
          <h3>Settings</h3>
          <p>Configure your site</p>
          <span className={styles.comingSoon}>Coming Soon</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;