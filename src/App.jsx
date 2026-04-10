import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import styles from './App.module.css';

import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import ActionCards from './components/ActionCards.jsx';
import VideoSection from './components/VideoSection.jsx';
import WhatWeDo from './components/WhatWeDo.jsx';
import ImpactStats from './components/ImpactStats.jsx';
import Partners from './components/Partners.jsx';
import Carosel from './components/Carosel.jsx';
import DonationForm from './components/DonationForm.jsx';
import EfficiencyBadge from './components/EfficiencyBadge.jsx';
import Footer from './components/Footer.jsx';
import CompanyMVV from './components/OrgMissionVison.jsx';



//pages not in use 
import UpcomingEvents from './components/UpcomingEvents.jsx';



{/*pages*/}

import Dashboard from './pages/Admin/DashBoard.jsx';
import AboutPage from './pages/About/AboutPage.jsx';
import Program from './pages/Program/Program.jsx';
import Blog from './pages/Blog/Blog.jsx';
import SinglePost from './pages/Blog/SinglePost.jsx';
import Login from './AuthPage/Login.jsx';
import Signup from './AuthPage/Signup.jsx';
import AdminDashboard from './AuthPage/AdminDashboard.jsx';

import ContactPage from './pages/Contact/ContactPage.jsx';


import ProtectedRoute from './components/protectedRoute.jsx';


function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const id = location.hash.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [location]);

  return null;
}

import CreatePost from './pages/Admin/CreatePost.jsx';
import ManagePosts from './pages/Admin/ManagePost.jsx';




function HomeContent() {
  return (
    <main className={styles.pageContent}>
      <Hero />
      <CompanyMVV />
      <Carosel />
     {/* <VideoSection />*/}
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
      <ScrollToHash />
      <div className={styles.appWrapper}>
        <Routes>
          {/* Auth routes with header/footer */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected admin route */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/createPost"
            element={
              <ProtectedRoute>
                <CreatePost/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/posts"
            element={
              <ProtectedRoute>
                <ManagePosts/>
              </ProtectedRoute>
            }
          />

          {/* Public routes with header/footer */}
          <Route path="/" element={
            <>
              <Header />
              <HomeContent />
              <Footer />
            </>
          } />
          <Route path="/about" element={
            <>
              <Header />
              <AboutPage />
              <Footer />
            </>
          } />
          <Route path="/programs" element={
            <>
              <Header />
              <Program />
              <Footer />
            </>
          } />
          <Route path="/blog" element={
            <>
              <Header />
              <Blog />
              <Footer />
            </>
          } />
          <Route path="/blog/:id" element={
            <>
              <Header />
              <SinglePost />
              <Footer />
            </>
          } />
          <Route path="/contact" element={
            <>
              <Header />
              <ContactPage />
              <Footer />
            </>
          } />
          <Route path="*" element={
            <>
              <Header />
              <HomeContent />
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;