import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import RouteFallback from './components/RouteFallback.jsx';
import { smoothScrollToElement, smoothScrollToY } from './utils/smoothScroll.js';



const Dashboard = lazy(() => import('./dashboard/pages/admin/Dashboard.jsx'));
const CreatePost = lazy(() => import('./dashboard/pages/admin/CreatePost.jsx'));
const ManagePosts = lazy(() => import('./dashboard/pages/admin/ManagePosts.jsx'));
const ManageUsers = lazy(() => import('./dashboard/pages/admin/ManageUsers.jsx'));
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

// Using shared RouteFallback component

function withRouteSuspense(element) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

function AppRoutes() {
  const { user, isLoading, refreshUser } = useCurrentUser();

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
            <RoleProtectedRoute user={user} isLoading={isLoading} allowedRoles={['admin']}>
              <Dashboard user={user} refreshUser={refreshUser} />
            </RoleProtectedRoute>
          )}
        />
        <Route
          path="/admin/createPost"
          element={withRouteSuspense(
            <RoleProtectedRoute user={user} isLoading={isLoading} allowedRoles={['admin']}>
              <CreatePost user={user} refreshUser={refreshUser} />
            </RoleProtectedRoute>
          )}
        />
        <Route
          path="/admin/posts"
          element={withRouteSuspense(
            <RoleProtectedRoute user={user} isLoading={isLoading} allowedRoles={['admin']}>
              <ManagePosts user={user} refreshUser={refreshUser} />
            </RoleProtectedRoute>
          )}
        />
        <Route
          path="/admin/users"
          element={withRouteSuspense(
            <RoleProtectedRoute user={user} isLoading={isLoading} allowedRoles={['admin']}>
              <ManageUsers user={user} refreshUser={refreshUser} />
            </RoleProtectedRoute>
          )}
        />

        <Route
          path="/author/dashboard"
          element={withRouteSuspense(
            <RoleProtectedRoute user={user} isLoading={isLoading} allowedRoles={['author']}>
              <AuthorDashboard user={user} refreshUser={refreshUser} />
            </RoleProtectedRoute>
          )}
        />
        <Route
          path="/author/createPost"
          element={withRouteSuspense(
            <RoleProtectedRoute user={user} isLoading={isLoading} allowedRoles={['author']}>
              <AuthorCreatePost user={user} refreshUser={refreshUser} />
            </RoleProtectedRoute>
          )}
        />
        <Route
          path="/author/posts"
          element={withRouteSuspense(
            <RoleProtectedRoute user={user} isLoading={isLoading} allowedRoles={['author']}>
              <AuthorManagePost user={user} refreshUser={refreshUser} />
            </RoleProtectedRoute>
          )}
        />

        <Route
          path="/reader/dashboard"
          element={withRouteSuspense(
            <RoleProtectedRoute user={user} isLoading={isLoading} allowedRoles={['reader']}>
              <ReaderDashboard user={user} refreshUser={refreshUser} />
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
