import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
      <motion.section 
        className={styles.hero}
        initial={{ backgroundColor: 'transparent' }}
        whileInView={{ backgroundColor: '#e8f4f8' }} // adjust
        transition={{ duration: 1 }}
      >
        <motion.div 
          className={styles.heroContent}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Transform Your Gig Work Journey
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Comprehensive programs designed to help gig workers build skills, increase earnings, and create sustainable careers.
          </motion.p>
        </motion.div>
      </motion.section>

      {/* Program Filters */}
      <motion.section 
        className={styles.filterSection}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className={styles.filterContainer}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.button 
            className={`${styles.filterBtn} ${activeTab === 'all' ? styles.active : ''}`}
            onClick={() => setActiveTab('all')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            All Programs
          </motion.button>
          <motion.button 
            className={`${styles.filterBtn} ${activeTab === 'skills' ? styles.active : ''}`}
            onClick={() => setActiveTab('skills')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Skills Development
          </motion.button>
          <motion.button 
            className={`${styles.filterBtn} ${activeTab === 'finance' ? styles.active : ''}`}
            onClick={() => setActiveTab('finance')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Financial Programs
          </motion.button>
          <motion.button 
            className={`${styles.filterBtn} ${activeTab === 'leadership' ? styles.active : ''}`}
            onClick={() => setActiveTab('leadership')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Leadership
          </motion.button>
          <motion.button 
            className={`${styles.filterBtn} ${activeTab === 'wellness' ? styles.active : ''}`}
            onClick={() => setActiveTab('wellness')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Wellness
          </motion.button>
        </motion.div>
      </motion.section>

      {/* Programs Grid */}
      <motion.section 
        className={styles.programsSection}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div 
          className={styles.programsGrid}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {filteredPrograms.map((program, index) => (
            <motion.div 
              key={program.id} 
              className={styles.programCard}
              initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className={styles.cardImage}>
                <motion.img 
                  src={program.image} 
                  alt={program.name}
                  initial={{ x: -100, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                />
                <div className={styles.categoryBadge}>{program.category.toUpperCase()}</div>
              </div>
              
              <motion.div 
                className={styles.cardContent}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.4 }}
              >
                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.6 }}
                >
                  {program.name}
                </motion.h3>
                <motion.p 
                  className={styles.description}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.8 }}
                >
                  {program.description}
                </motion.p>
                
                <motion.div 
                  className={styles.programMeta}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 1.0 }}
                >
                  <span className={styles.metaItem}>
                    <strong>Duration:</strong> {program.duration}
                  </span>
                  <span className={styles.metaItem}>
                    <strong>Level:</strong> {program.level}
                  </span>
                </motion.div>

                <motion.div 
                  className={styles.topics}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 1.2 }}
                >
                  <p className={styles.topicsTitle}>Key Topics:</p>
                  <div className={styles.topicsList}>
                    {program.topics.map((topic, idx) => (
                      <motion.span 
                        key={idx} 
                        className={styles.topic}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 + 1.4 + idx * 0.1 }}
                      >
                        {topic}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>

                <motion.button 
                  className={styles.enrollBtn}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 1.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Program
                </motion.button>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className={styles.ctaSection}
        initial={{ backgroundColor: 'transparent' }}
        whileInView={{ backgroundColor: '#007bff' }} // adjust
        transition={{ duration: 1 }}
      >
        <motion.h2 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Ready to Transform Your Career?
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Join thousands of gig workers who have already benefited from our programs.
        </motion.p>
        <motion.button 
          className={styles.ctaBtn}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started Today
        </motion.button>
      </motion.section>
    </div>
  );
};

export default Program;
