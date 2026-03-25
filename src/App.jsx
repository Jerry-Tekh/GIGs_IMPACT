import React from 'react';
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
import FindUS from './components/FindUs.jsx';
import CompanyMVV from './components/CompanyMVV.jsx';
import AboutPage from './components/AboutPage.jsx';
import MissionVisionValues from './components/MissionVisionValue.jsx';


function App() {
  return (
    <div className={styles.appWrapper}>
      <Header />
      <main>
        <Hero />
        <CompanyMVV />  
         
        {/* <FindUS /> */}
        <ActionCards />
        <VideoSection />
        <WhatWeDo />
        <ImpactStats />
        <Partners />
        <DonationForm />
        <EfficiencyBadge />
      </main>
      <Footer />
    </div>
  );
}

export default App;