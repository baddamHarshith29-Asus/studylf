import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TopNavbar from '../components/layout/TopNavbar';

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
const IdeaAnalysis      = lazy(() => import('../pages/IdeaAnalysis'));
const BuildAdvisor      = lazy(() => import('../pages/BuildAdvisor'));

// Public Rava-style pages
const Landing           = lazy(() => import('../pages/Landing'));
const About             = lazy(() => import('../pages/About'));
const Blog              = lazy(() => import('../pages/Blog'));
const Pricing           = lazy(() => import('../pages/Pricing'));

const LoginPage = lazy(() => import('../pages/auth/Login'));
const RegisterPage = lazy(() => import('../pages/auth/Register'));
const VerifyEmailPage = lazy(() => import('../pages/auth/VerifyEmail'));

// Intermediate dashboard hub
const WorkspaceHub      = lazy(() => import('../pages/WorkspaceHub'));

const PageLoader: React.FC = () => (
  <div className="onboard-container" style={{ flexDirection: 'column', gap: '1.5rem' }}>
    <div style={{
      width: '56px', height: '56px', borderRadius: '14px',
      background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(239, 43, 112, 0.3)', animation: 'glowPulse 2s infinite'
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

// Authenticated layout wrapping TopNavbar + page content
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <TopNavbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { profile, loading } = useAuth();

  if (loading) return <PageLoader />;

  // Case 1: Not logged in -> Access to Public Pages + Auth Pages
  if (!profile.email) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"         element={<Landing />} />
          <Route path="/about"    element={<About />} />
          <Route path="/blog"     element={<Blog />} />
          <Route path="/pricing"  element={<Pricing />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/startup/:slug" element={<PublicStartupPage />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // Case 2: Logged in but not onboarded -> Redirect to onboarding
  if (!profile.registered) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="*"           element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // Case 3: Logged in & onboarded -> Access to private workspace + public pages
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={
          <AppLayout>
            <WorkspaceHub />
          </AppLayout>
        } />
        <Route path="/dashboard" element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        } />
        <Route path="/about" element={
          <AppLayout>
            <About />
          </AppLayout>
        } />
        <Route path="/blog" element={
          <AppLayout>
            <Blog />
          </AppLayout>
        } />
        <Route path="/pricing" element={
          <AppLayout>
            <Pricing />
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
        <Route path="/idea-analysis" element={
          <AppLayout>
            <IdeaAnalysis />
          </AppLayout>
        } />
        <Route path="/build-advisor" element={
          <AppLayout>
            <BuildAdvisor />
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
