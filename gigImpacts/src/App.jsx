import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './App.module.css';

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
import Reveal from './components/Reveal.jsx';
import Breadcrumbs from './components/Breadcrumbs.jsx';
import Testimonials from './components/Testimonials.jsx';
import CompanyMVV from './components/OrgMissionVison.jsx';
import RoleProtectedRoute from './components/RoleProtectedRoute.jsx';
import RouteFallback from './components/RouteFallback.jsx';
import { smoothScrollToElement, smoothScrollToY } from './utils/smoothScroll.js';
import { preloadRecaptcha } from './utils/recaptcha.js';



const Dashboard = lazy(() => import('./dashboard/pages/admin/Dashboard.jsx'));
const CreatePost = lazy(() => import('./dashboard/pages/admin/CreatePost.jsx'));
const ManagePosts = lazy(() => import('./dashboard/pages/admin/ManagePosts.jsx'));
const ManageUsers = lazy(() => import('./dashboard/pages/admin/ManageUsers.jsx'));
const ManageCarousel = lazy(() => import('./dashboard/pages/admin/ManageCarousel.jsx'));
const AuthorDashboard = lazy(() => import('./dashboard/pages/author/Dashboard.jsx'));
const AuthorManagePost = lazy(() => import('./dashboard/pages/author/ManagePosts.jsx'));
const AuthorCreatePost = lazy(() => import('./dashboard/pages/author/CreatePost.jsx'));
const ReaderDashboard = lazy(() => import('./dashboard/pages/reader/Dashboard.jsx'));
const AboutPage = lazy(() => import('./pages/About/AboutPage.jsx'));
const Program = lazy(() => import('./pages/Program/Program.jsx'));
const Blog = lazy(() => import('./pages/Blog/Blog.jsx'));
const SinglePost = lazy(() => import('./pages/Blog/SinglePost.jsx'));
const Login = lazy(() => import('./AuthPage/Login.jsx'));
const Signup = lazy(() => import('./AuthPage/Signup.jsx'));
const VerifyEmail = lazy(() => import('./AuthPage/VerifyEmail.jsx'));
const ResetPassword = lazy(() => import('./AuthPage/ResetPassword.jsx'));
const ContactPage = lazy(() => import('./pages/Contact/ContactPage.jsx'));
const LegalPage = lazy(() => import('./pages/Legal/LegalPage.jsx'));

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      smoothScrollToY(0);
      return;
    }

    const id = location.hash.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      setTimeout(() => {
        smoothScrollToElement(element, 100);
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
      <Reveal><CompanyMVV /></Reveal>
      <Reveal><Carosel /></Reveal>
      <Reveal><ActionCards /></Reveal>
      <Reveal><WhatWeDo /></Reveal>
      <Reveal><ImpactStats /></Reveal>
      <Reveal><Partners /></Reveal>
      <Reveal><Testimonials /></Reveal>
      <Reveal><DonationForm /></Reveal>
      <Reveal><EfficiencyBadge /></Reveal>
    </main>
  );
}

function PublicPage({ children }) {
  return (
    <div className={styles.publicShell}>
      <Header />
      <motion.div
        className={styles.publicPage}
        style={{ position: 'relative' }}
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Breadcrumbs />
        {children}
      </motion.div>
      <Footer />
    </div>
  );
}

// Using shared RouteFallback component

function withRouteSuspense(element) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

function AppRoutes() {
  return (
    <div className={styles.appWrapper}>
      <Routes>
        <Route path="/login" element={withRouteSuspense(<Login />)} />
        <Route path="/signup" element={withRouteSuspense(<Signup />)} />
        <Route path="/verify-email/:token" element={withRouteSuspense(<VerifyEmail />)} />
        <Route path="/reset-password/:token" element={withRouteSuspense(<ResetPassword />)} />

        <Route
          path="/admin/dashboard"
          element={withRouteSuspense(
            <RoleProtectedRoute allowedRoles={['admin']}>
              <Dashboard />
            </RoleProtectedRoute>
          )}
        />
        <Route
          path="/admin/createPost"
          element={withRouteSuspense(
            <RoleProtectedRoute allowedRoles={['admin']}>
              <CreatePost />
            </RoleProtectedRoute>
          )}
        />
        <Route
          path="/admin/posts"
          element={withRouteSuspense(
            <RoleProtectedRoute allowedRoles={['admin']}>
              <ManagePosts />
            </RoleProtectedRoute>
          )}
        />
          <Route
            path="/admin/carousels"
            element={withRouteSuspense(
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ManageCarousel />
              </RoleProtectedRoute>
            )}
          />
        <Route
          path="/admin/users"
          element={withRouteSuspense(
            <RoleProtectedRoute allowedRoles={['admin']}>
              <ManageUsers />
            </RoleProtectedRoute>
          )}
        />

        <Route
          path="/author/dashboard"
          element={withRouteSuspense(
            <RoleProtectedRoute allowedRoles={['author']}>
              <AuthorDashboard />
            </RoleProtectedRoute>
          )}
        />
        <Route
          path="/author/createPost"
          element={withRouteSuspense(
            <RoleProtectedRoute allowedRoles={['author']}>
              <AuthorCreatePost />
            </RoleProtectedRoute>
          )}
        />
        <Route
          path="/author/posts"
          element={withRouteSuspense(
            <RoleProtectedRoute allowedRoles={['author']}>
              <AuthorManagePost />
            </RoleProtectedRoute>
          )}
        />

        <Route
          path="/reader/dashboard"
          element={withRouteSuspense(
            <RoleProtectedRoute allowedRoles={['reader']}>
              <ReaderDashboard />
            </RoleProtectedRoute>
          )}
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
          element={withRouteSuspense(
            <PublicPage>
              <AboutPage />
            </PublicPage>
          )}
        />
        <Route
          path="/programs"
          element={withRouteSuspense(
            <PublicPage>
              <Program />
            </PublicPage>
          )}
        />
        <Route
          path="/blog"
          element={withRouteSuspense(
            <PublicPage>
              <Blog />
            </PublicPage>
          )}
        />
        <Route
          path="/blog/:id"
          element={withRouteSuspense(
            <PublicPage>
              <SinglePost />
            </PublicPage>
          )}
        />
        <Route
          path="/contact"
          element={withRouteSuspense(
            <PublicPage>
              <ContactPage />
            </PublicPage>
          )}
        />
        <Route
          path="/privacy"
          element={withRouteSuspense(
            <PublicPage>
              <LegalPage type="privacy" />
            </PublicPage>
          )}
        />
        <Route
          path="/terms"
          element={withRouteSuspense(
            <PublicPage>
              <LegalPage type="terms" />
            </PublicPage>
          )}
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
  useEffect(() => {
    preloadRecaptcha();
  }, []);

  return (
    <Router>
      <ScrollToHash />
      
      <AppRoutes />
    </Router>
  );
}

export default App;
