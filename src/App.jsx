import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styles from './App.module.css';

import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import ActionCards from './components/ActionCards.jsx';
import VideoSection from './components/VideoSection.jsx';
import WhatWeDo from './components/WhatWeDo.jsx';
import ImpactStats from './components/ImpactStats.jsx';
import Partners from './components/Partners.jsx';
import DonationForm from './components/DonationForm.jsx';
import EfficiencyBadge from './components/EfficiencyBadge.jsx';
import Footer from './components/Footer.jsx';
import CompanyMVV from './components/CompanyMVV.jsx';

import AboutPage from './components/About/AboutPage.jsx';
import Program from './components/Program/Program.jsx';
import Blog from './components/Blog/Blog.jsx';

function HomeContent() {
  return (
    <main className={styles.pageContent}>
      <Hero />
      <CompanyMVV />
      <VideoSection />
      <ActionCards />
      <WhatWeDo />
      <ImpactStats />
      <Partners />
      <DonationForm />
      <EfficiencyBadge />
    </main>
  );
}

function App() {
  return (
    <Router>
      <div className={styles.appWrapper}>
        <Header />

        <Routes>
          <Route path="/" element={<HomeContent />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/programs" element={<Program />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="*" element={<HomeContent />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;