import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiFetch, setAuthToken, removeAuthToken } from '../services/api';

export interface Profile {
  registered: boolean;
  email: string;
  name: string;
  startupName: string;
  description: string;
  industry: string;
  country: string;
  stage: string;
  avatar: string;
  is_public?: boolean;
  slug?: string;
}

export interface ValidationScore {
  overall: number;
  demand: number;
  competition: number;
  scalability: number;
  revenuePotential: number;
}

export interface Competitor {
  name: string;
  funding: string;
  pricing: string;
  type: 'Direct' | 'Indirect';
}

export interface MarketResearch {
  marketSize: string;
  growthTrends: string;
}

export interface ValidationReport {
  id: string;
  date: string;
  startupIdea: string;
  scores: ValidationScore;
  competitors: Competitor[];
  marketResearch: MarketResearch;
}

export interface RoadmapTask {
  id: string;
  text: string;
  completed: boolean;
  stage: string;
  category: string;
  guideId?: string;
}

export interface ChatSource {
  title: string;
  link?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  error?: boolean;
}

export interface PitchQuestion {
  id?: string;
  text: string;
  tips: string;
}

export interface PitchEvaluation {
  success: boolean;
  score: number;
  critique: string;
  tips: string;
}

export interface PitchSimulatorState {
  activeSubTab: 'chat' | 'simulator';
  pitchQuestions: PitchQuestion[];
  currentQIndex: number;
  answer: string;
  evaluation: PitchEvaluation | null;
  scoreHistory: number[];
  simulatorActive: boolean;
}

interface AuthContextType {
  profile: Profile;
  loading: boolean;
  googleClientId: string;
  validationReports: ValidationReport[];
  roadmapTasks: RoadmapTask[];
  copilotMessages: ChatMessage[];
  setCopilotMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  pitchSimulatorState: PitchSimulatorState;
  setPitchSimulatorState: React.Dispatch<React.SetStateAction<PitchSimulatorState>>;
  login: (email: string, password: string) => Promise<{ success: boolean; requiresVerification?: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; requiresVerification?: boolean; message?: string; debugOtp?: string }>;
  googleLogin: (credential: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; message?: string }>;
  adminBypass: () => Promise<boolean>;
  verifyEmailLink: (token: string) => Promise<{ success: boolean; message?: string }>;
  onboard: (data: any) => Promise<boolean>;
  logout: () => void;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  setValidationReports: React.Dispatch<React.SetStateAction<ValidationReport[]>>;
  setRoadmapTasks: React.Dispatch<React.SetStateAction<RoadmapTask[]>>;
  fetchProfile: () => Promise<void>;
  fetchWorkspaceData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile>({
    registered: false,
    email: '',
    name: '',
    startupName: '',
    description: '',
    industry: 'AI & SaaS',
    country: 'India',
    stage: 'Idea',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  });
  const [validationReports, setValidationReports] = useState<ValidationReport[]>([]);
  const [roadmapTasks, setRoadmapTasks] = useState<RoadmapTask[]>([]);
  const [googleClientId, setGoogleClientId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copilotMessages, setCopilotMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I am your AI Founder Copilot. Ask me anything about funding schemes, development advisors, or legal documents. I draw answers from our verified internal databases (grants, investors, templates) or my general knowledge.`,
      sources: []
    }
  ]);
  const [pitchSimulatorState, setPitchSimulatorState] = useState<PitchSimulatorState>({
    activeSubTab: 'chat',
    pitchQuestions: [],
    currentQIndex: 0,
    answer: '',
    evaluation: null,
    scoreHistory: [],
    simulatorActive: false
  });

  const fetchWorkspaceData = async () => {
    try {
      const [reportsRes, roadmapRes] = await Promise.all([
        apiFetch('/api/validation/reports'),
        apiFetch('/api/roadmap')
      ]);
      if (reportsRes.ok) {
        setValidationReports(await reportsRes.json());
      }
      if (roadmapRes.ok) {
        const rm = await roadmapRes.json();
        setRoadmapTasks(rm.tasks || []);
      }
    } catch (err) {
      console.error('Error fetching workspace data:', err);
    }
  };

  const fetchAuthConfig = async () => {
    try {
      const response = await fetch('/api/auth/config');
      if (response.ok) {
        const data = await response.json();
        if (data.google_client_id) {
          setGoogleClientId(data.google_client_id);
        }
      }
    } catch (err) {
      console.error('Error fetching auth config:', err);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await apiFetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        if (data.registered) {
          await fetchWorkspaceData();
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthConfig();
    fetchProfile();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; requiresVerification?: boolean; message?: string }> => {
    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.access_token);
        await fetchProfile();
        return { success: true };
      } else if (response.status === 400) {
        const data = await response.json().catch(() => ({}));
        if (data.detail && data.detail.requires_verification) {
          return {
            success: false,
            requiresVerification: true,
            message: data.detail.message
          };
        }
        return { success: false, message: data.detail || 'Login failed' };
      } else {
        const data = await response.json().catch(() => ({}));
        return { success: false, message: data.detail || 'Incorrect email or password' };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Connection error. Make sure the backend is running.' };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; requiresVerification?: boolean; message?: string }> => {
    try {
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          requiresVerification: data.requires_verification
        };
      } else {
        const data = await response.json().catch(() => ({}));
        return { success: false, message: data.detail || 'Registration failed' };
      }
    } catch (err) {
      console.error('Register error:', err);
      return { success: false, message: 'Connection error' };
    }
  };

  const googleLogin = async (credential: string): Promise<boolean> => {
    try {
      const response = await apiFetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential })
      });
      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.access_token);
        await fetchProfile();
        return true;
      }
    } catch (err) {
      console.error('Google login error:', err);
    }
    return false;
  };

  const verifyOtp = async (email: string, otp: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiFetch('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp })
      });
      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.access_token);
        await fetchProfile();
        return { success: true };
      } else {
        const data = await response.json().catch(() => ({}));
        return { success: false, message: data.detail || 'Invalid or expired OTP' };
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      return { success: false, message: 'Connection error' };
    }
  };

  const resendOtp = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiFetch('/api/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, message: data.message };
      } else {
        const data = await response.json().catch(() => ({}));
        return { success: false, message: data.detail || 'Failed to resend code' };
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      return { success: false, message: 'Connection error' };
    }
  };

  const adminBypass = async (): Promise<boolean> => {
    try {
      const response = await apiFetch('/api/auth/admin-bypass', {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.access_token);
        await fetchProfile();
        return true;
      }
    } catch (err) {
      console.error('Admin bypass login error:', err);
    }
    return false;
  };

  const verifyEmailLink = async (token: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiFetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.access_token);
        await fetchProfile();
        return { success: true, message: data.message };
      } else {
        const data = await response.json().catch(() => ({}));
        return { success: false, message: data.detail || 'Email verification failed' };
      }
    } catch (err) {
      console.error('Verify email link error:', err);
      return { success: false, message: 'Connection error' };
    }
  };

  const onboard = async (data: any): Promise<boolean> => {
    try {
      const response = await apiFetch('/api/onboarding', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (response.ok) {
        const resData = await response.json();
        setProfile(resData.profile);
        await fetchWorkspaceData();
        return true;
      }
    } catch (err) {
      console.error('Onboarding error:', err);
    }
    return false;
  };

  const logout = async () => {
    try {
      await apiFetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    removeAuthToken();
    setProfile({
      registered: false,
      email: '',
      name: '',
      startupName: '',
      description: '',
      industry: 'AI & SaaS',
      country: 'India',
      stage: 'Idea',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    });
    setValidationReports([]);
    setRoadmapTasks([]);
    setCopilotMessages([
      {
        role: 'assistant',
        content: `Hello! I am your AI Founder Copilot. Ask me anything about funding schemes, development advisors, or legal documents. I draw answers from our verified internal databases (grants, investors, templates) or my general knowledge.`,
        sources: []
      }
    ]);
    setPitchSimulatorState({
      activeSubTab: 'chat',
      pitchQuestions: [],
      currentQIndex: 0,
      answer: '',
      evaluation: null,
      scoreHistory: [],
      simulatorActive: false
    });
  };

  return (
    <AuthContext.Provider value={{ 
      profile, 
      loading, 
      googleClientId,
      validationReports, 
      roadmapTasks, 
      copilotMessages,
      setCopilotMessages,
      pitchSimulatorState,
      setPitchSimulatorState,
      login, 
      register, 
      googleLogin,
      verifyOtp,
      resendOtp,
      adminBypass,
      verifyEmailLink,
      onboard, 
      logout, 
      setProfile, 
      setValidationReports, 
      setRoadmapTasks, 
      fetchProfile,
      fetchWorkspaceData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
