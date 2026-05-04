import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './App.module.css';
import useCurrentUser from './hooks/useCurrentUser.js';

import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import ActionCards from './components/ActionCards.jsx';
import WhatWeDo from './components/WhatWeDo.jsx';
import ImpactStats from './components/ImpactStats.jsx';
import Partners from './components/Partners.jsx';
import Carosel from './components/Carosel.jsx';
import DonationForm from './components/DonationForm.jsx';
import EfficiencyBadge from './components/EfficiencyBadge.jsx';
import Footer from './components/Footer.jsx';
import CompanyMVV from './components/OrgMissionVison.jsx';
import RoleProtectedRoute from './components/RoleProtectedRoute.jsx';

import Dashboard from './pages/Admin/DashBoard.jsx';
import CreatePost from './pages/Admin/CreatePost.jsx';
import ManagePosts from './pages/Admin/ManagePost.jsx';
import ManageUsers from './pages/Admin/ManageUsers.jsx';
import AuthorDashboard from './pages/Author/DashBoard.jsx';
import AuthorManagePost from './pages/Author/ManagePost.jsx';
import AuthorCreatePost from './pages/Author/CreatePost.jsx';
import ReaderDashboard from './pages/Blog/ReaderDashboard.jsx';
import AboutPage from './pages/About/AboutPage.jsx';
import Program from './pages/Program/Program.jsx';
import Blog from './pages/Blog/Blog.jsx';
import SinglePost from './pages/Blog/SinglePost.jsx';
import Login from './AuthPage/Login.jsx';
import Signup from './AuthPage/Signup.jsx';
import ContactPage from './pages/Contact/ContactPage.jsx';
// import PageLoader from './components/PageLoader.jsx';

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

// RouteLoader removed: global page loader spinner eliminated

function HomeContent() {
  return (
    <main className={styles.pageContent}>
      <Hero />
      <CompanyMVV />
      <Carosel />
      <ActionCards />
      <WhatWeDo />
      <ImpactStats />
      <Partners />
      <DonationForm />
      <EfficiencyBadge />
    </main>
  );
}

function PublicPage({ children }) {
  return (
    <div className={styles.publicShell}>
      <Header />
      <motion.div
        className={styles.publicPage}
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  const { user, isLoading, refreshUser } = useCurrentUser();

  return (
    <div className={styles.appWrapper}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/admin/dashboard"
          element={
            <RoleProtectedRoute user={user} isLoading={isLoading} allowedRoles={['admin']}>
              <Dashboard user={user} refreshUser={refreshUser} />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/createPost"
          element={
            <RoleProtectedRoute user={user} isLoading={isLoading} allowedRoles={['admin']}>
              <CreatePost user={user} />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/posts"
          element={
            <RoleProtectedRoute user={user} isLoading={isLoading} allowedRoles={['admin']}>
              <ManagePosts user={user} />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleProtectedRoute user={user} isLoading={isLoading} allowedRoles={['admin']}>
              <ManageUsers user={user} />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/author/dashboard"
          element={
            <RoleProtectedRoute user={user} isLoading={isLoading} allowedRoles={['author']}>
              <AuthorDashboard user={user} />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/author/createPost"
          element={
            <RoleProtectedRoute user={user} isLoading={isLoading} allowedRoles={['author']}>
              <AuthorCreatePost user={user} />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/author/posts"
          element={
            <RoleProtectedRoute user={user} isLoading={isLoading} allowedRoles={['author']}>
              <AuthorManagePost user={user} />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/reader/dashboard"
          element={
            <RoleProtectedRoute user={user} isLoading={isLoading} allowedRoles={['reader']}>
              <ReaderDashboard user={user} />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <PublicPage>
              <HomeContent />
            </PublicPage>
          }
        />
        <Route
          path="/about"
          element={
            <PublicPage>
              <AboutPage />
            </PublicPage>
          }
        />
        <Route
          path="/programs"
          element={
            <PublicPage>
              <Program />
            </PublicPage>
          }
        />
        <Route
          path="/blog"
          element={
            <PublicPage>
              <Blog />
            </PublicPage>
          }
        />
        <Route
          path="/blog/:id"
          element={
            <PublicPage>
              <SinglePost />
            </PublicPage>
          }
        />
        <Route
          path="/contact"
          element={
            <PublicPage>
              <ContactPage />
            </PublicPage>
          }
        />
        <Route
          path="*"
          element={
            <PublicPage>
              <HomeContent />
            </PublicPage>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToHash />
      
      <AppRoutes />
    </Router>
  );
}

export default App;
