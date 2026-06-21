import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/Toast';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import Funding from './pages/Funding';
import Network from './pages/Network';
import CopilotPage from './pages/CopilotPage';
import Admin from './pages/Admin';

export default function App() {
  const [profile, setProfile] = useState({ registered: false });
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [validationReports, setValidationReports] = useState([]);
  const [roadmapTasks, setRoadmapTasks] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageTransition, setPageTransition] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      setProfile(data);
      if (data.registered) {
        await fetchAllData(data.stage);
      }
    } catch (err) {
      console.error('Error connecting to backend:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      const [reportsRes, roadmapRes, resourcesRes] = await Promise.all([
        fetch('/api/validation/reports'),
        fetch('/api/roadmap'),
        fetch('/api/resources')
      ]);
      setValidationReports(await reportsRes.json());
      
      const roadmapData = await roadmapRes.json();
      setRoadmapTasks(roadmapData.tasks || []);
      
      setResources(await resourcesRes.json());
    } catch (err) {
      console.error('Error loading assets:', err);
    }
  };

  const handleOnboardingComplete = (newProfile) => {
    setProfile(newProfile);
    fetchAllData();
  };

  const handleLogout = () => {
    // Reset all client state
    setProfile({ registered: false });
    setCurrentPage('dashboard');
    setValidationReports([]);
    setRoadmapTasks([]);
    setResources([]);
  };

  // Animated page switching
  const handlePageChange = (newPage) => {
    if (newPage === currentPage) return;
    setPageTransition(true);
    setTimeout(() => {
      setCurrentPage(newPage);
      setPageTransition(false);
    }, 150);
  };

  if (loading) {
    return (
      <>
        <ToastContainer />
        <div className="onboard-container" style={{ flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
            animation: 'glowPulse 2s infinite'
          }}>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>S</span>
          </div>
          <div className="pulse-loader">
            <div className="pulse-bubble" />
            <div className="pulse-bubble" />
            <div className="pulse-bubble" />
          </div>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Connecting to STUDLYF workspace...</span>
        </div>
      </>
    );
  }

  // Route to onboarding if not registered
  if (!profile.registered) {
    return (
      <>
        <ToastContainer />
        <Onboarding onComplete={handleOnboardingComplete} />
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="app-container">
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={handlePageChange} 
          profile={profile} 
          validationReports={validationReports}
          roadmapTasks={roadmapTasks}
          onLogout={handleLogout}
        />
        
        <main className="main-content">
          <div 
            key={currentPage}
            style={{
              opacity: pageTransition ? 0 : 1,
              transform: pageTransition ? 'translateY(8px)' : 'translateY(0)',
              transition: 'opacity 0.25s ease, transform 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem'
            }}
          >
            {currentPage === 'dashboard' && (
              <Dashboard 
                profile={profile} 
                setProfile={setProfile} 
                validationReports={validationReports}
                setValidationReports={setValidationReports}
                setCurrentPage={handlePageChange}
              />
            )}
            
            {currentPage === 'roadmap' && (
              <Roadmap 
                profile={profile} 
                roadmapTasks={roadmapTasks} 
                setRoadmapTasks={setRoadmapTasks}
                resources={resources}
              />
            )}
            
            {currentPage === 'funding' && (
              <Funding profile={profile} />
            )}
            
            {currentPage === 'network' && (
              <Network profile={profile} />
            )}
            
            {currentPage === 'copilot' && (
              <CopilotPage profile={profile} />
            )}

            {currentPage === 'admin' && (
              <Admin />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
