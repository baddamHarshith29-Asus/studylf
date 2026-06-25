import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/layout/Sidebar';

// Lazy-loaded pages
const Dashboard   = lazy(() => import('../pages/Dashboard'));
const Roadmap     = lazy(() => import('../pages/Roadmap'));
const Funding     = lazy(() => import('../pages/Funding'));
const Network     = lazy(() => import('../pages/Network'));
const CopilotPage = lazy(() => import('../pages/CopilotPage'));
const Admin       = lazy(() => import('../pages/Admin'));
const Onboarding  = lazy(() => import('../pages/Onboarding'));
const StartupDirectory = lazy(() => import('../pages/StartupDirectory'));

// New lazy-loaded pages
const StartupProfile   = lazy(() => import('../pages/StartupProfile'));
const PublicStartupPage = lazy(() => import('../pages/PublicStartupPage'));
const OpportunityBoard  = lazy(() => import('../pages/OpportunityBoard'));
const InvestorDirectory = lazy(() => import('../pages/InvestorDirectory'));
const MentorDirectory   = lazy(() => import('../pages/MentorDirectory'));
const PitchDeckReview   = lazy(() => import('../pages/PitchDeckReview'));
const ResourcesLibrary  = lazy(() => import('../pages/ResourcesLibrary'));
const ProfileSettings   = lazy(() => import('../pages/ProfileSettings'));

const LoginPage = lazy(() => import('../pages/auth/Login'));
const RegisterPage = lazy(() => import('../pages/auth/Register'));

const PageLoader: React.FC = () => (
  <div className="onboard-container" style={{ flexDirection: 'column', gap: '1.5rem' }}>
    <div style={{
      width: '56px', height: '56px', borderRadius: '14px',
      background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)', animation: 'glowPulse 2s infinite'
    }}>
      <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>S</span>
    </div>
    <div className="pulse-loader">
      <div className="pulse-bubble" />
      <div className="pulse-bubble" />
      <div className="pulse-bubble" />
    </div>
    <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Loading STUDLYF workspace...</span>
  </div>
);

// Authenticated layout wrapping Sidebar + page content
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { validationReports, roadmapTasks } = useAuth();

  return (
    <div className="app-container">
      <Sidebar validationReports={validationReports} roadmapTasks={roadmapTasks} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { profile, loading } = useAuth();

  if (loading) return <PageLoader />;

  // Not registered → onboarding
  if (!profile.registered) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*"         element={<Onboarding />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        } />
        <Route path="/roadmap" element={
          <AppLayout>
            <Roadmap />
          </AppLayout>
        } />
        <Route path="/funding" element={
          <AppLayout>
            <Funding />
          </AppLayout>
        } />
        <Route path="/network" element={
          <AppLayout>
            <Network />
          </AppLayout>
        } />
        <Route path="/directory" element={
          <AppLayout>
            <StartupDirectory />
          </AppLayout>
        } />
        <Route path="/copilot" element={
          <AppLayout>
            <CopilotPage />
          </AppLayout>
        } />
        <Route path="/admin" element={
          <AppLayout>
            <Admin />
          </AppLayout>
        } />
        
        {/* New Routes */}
        <Route path="/startup-profile" element={
          <AppLayout>
            <StartupProfile />
          </AppLayout>
        } />
        <Route path="/opportunities" element={
          <AppLayout>
            <OpportunityBoard />
          </AppLayout>
        } />
        <Route path="/investors" element={
          <AppLayout>
            <InvestorDirectory />
          </AppLayout>
        } />
        <Route path="/mentors" element={
          <AppLayout>
            <MentorDirectory />
          </AppLayout>
        } />
        <Route path="/pitch-review" element={
          <AppLayout>
            <PitchDeckReview />
          </AppLayout>
        } />
        <Route path="/playbooks" element={
          <AppLayout>
            <ResourcesLibrary />
          </AppLayout>
        } />
        <Route path="/settings" element={
          <AppLayout>
            <ProfileSettings />
          </AppLayout>
        } />
        
        {/* Standalone Public Startup Profile URL */}
        <Route path="/startup/:slug" element={<PublicStartupPage />} />
        
        <Route path="/login"    element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Navigate to="/" replace />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
