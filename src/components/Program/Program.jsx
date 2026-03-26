import React, { useState } from 'react';
import styles from './Program.module.css';

const Program = () => {
  const [activeTab, setActiveTab] = useState('all');

  const programs = [
    {
      id: 1,
      name: 'Digital Skills Bootcamp',
      category: 'skills',
      duration: '8 weeks',
      level: 'Beginner to Intermediate',
      description: 'Master essential digital skills including e-commerce, digital marketing, and content creation to boost your online earning potential.',
      topics: ['E-Commerce Platform Management', 'Digital Marketing', 'Social Media Strategy', 'Content Creation'],
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 2,
      name: 'Financial Literacy Program',
      category: 'finance',
      duration: '6 weeks',
      level: 'All Levels',
      description: 'Learn to manage income volatility, save effectively, and plan for your financial future in the gig economy.',
      topics: ['Income Management', 'Savings Planning', 'Tax Basics', 'Investment Fundamentals', 'Risk Management'],
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 3,
      name: 'Entrepreneurship Accelerator',
      category: 'leadership',
      duration: '12 weeks',
      level: 'Intermediate to Advanced',
      description: 'Transform your gig work into a sustainable business with mentorship, business planning, and growth strategies.',
      topics: ['Business Planning', 'Marketing Strategy', 'Customer Acquisition', 'Scaling Operations', 'Funding Basics'],
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 4,
      name: 'Professional Development Series',
      category: 'skills',
      duration: '4 weeks',
      level: 'All Levels',
      description: 'Build professional skills including communication, negotiation, time management, and personal branding.',
      topics: ['Communication Skills', 'Negotiation Tactics', 'Time Management', 'Personal Branding'],
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 5,
      name: 'Wellness & Mental Health',
      category: 'wellness',
      duration: '8 weeks',
      level: 'All Levels',
      description: 'Support your well-being with programs focused on work-life balance, stress management, and mental health.',
      topics: ['Stress Management', 'Work-Life Balance', 'Health Insurance Guidance', 'Community Support'],
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 6,
      name: 'Industry-Specific Training',
      category: 'skills',
      duration: 'Varies',
      level: 'Specialized',
      description: 'Targeted training for delivery drivers, freelancers, translators, and other gig economy sectors.',
      topics: ['Delivery Optimization', 'Freelance Best Practices', 'Client Management', 'Quality Excellence'],
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400',
    },
  ];

  const filteredPrograms = activeTab === 'all' ? programs : programs.filter(p => p.category === activeTab);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Transform Your Gig Work Journey</h1>
          <p>Comprehensive programs designed to help gig workers build skills, increase earnings, and create sustainable careers.</p>
        </div>
      </section>

      {/* Program Filters */}
      <section className={styles.filterSection}>
        <div className={styles.filterContainer}>
          <button 
            className={`${styles.filterBtn} ${activeTab === 'all' ? styles.active : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Programs
          </button>
          <button 
            className={`${styles.filterBtn} ${activeTab === 'skills' ? styles.active : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            Skills Development
          </button>
          <button 
            className={`${styles.filterBtn} ${activeTab === 'finance' ? styles.active : ''}`}
            onClick={() => setActiveTab('finance')}
          >
            Financial Programs
          </button>
          <button 
            className={`${styles.filterBtn} ${activeTab === 'leadership' ? styles.active : ''}`}
            onClick={() => setActiveTab('leadership')}
          >
            Leadership
          </button>
          <button 
            className={`${styles.filterBtn} ${activeTab === 'wellness' ? styles.active : ''}`}
            onClick={() => setActiveTab('wellness')}
          >
            Wellness
          </button>
        </div>
      </section>

      {/* Programs Grid */}
      <section className={styles.programsSection}>
        <div className={styles.programsGrid}>
          {filteredPrograms.map((program) => (
            <div key={program.id} className={styles.programCard}>
              <div className={styles.cardImage}>
                <img src={program.image} alt={program.name} />
                <div className={styles.categoryBadge}>{program.category.toUpperCase()}</div>
              </div>
              
              <div className={styles.cardContent}>
                <h3>{program.name}</h3>
                <p className={styles.description}>{program.description}</p>
                
                <div className={styles.programMeta}>
                  <span className={styles.metaItem}>
                    <strong>Duration:</strong> {program.duration}
                  </span>
                  <span className={styles.metaItem}>
                    <strong>Level:</strong> {program.level}
                  </span>
                </div>

                <div className={styles.topics}>
                  <p className={styles.topicsTitle}>Key Topics:</p>
                  <div className={styles.topicsList}>
                    {program.topics.map((topic, idx) => (
                      <span key={idx} className={styles.topic}>{topic}</span>
                    ))}
                  </div>
                </div>

                <button className={styles.enrollBtn}>Explore Program</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2>Ready to Transform Your Career?</h2>
        <p>Join thousands of gig workers who have already benefited from our programs.</p>
        <button className={styles.ctaBtn}>Get Started Today</button>
      </section>
    </div>
  );
};

export default Program;
