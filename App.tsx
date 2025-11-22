import React, { useState, useEffect } from 'react';
import { UserProfile, PlanItem, ReviewResult } from './types';
import Onboarding from './components/Onboarding';
import TimelineItem from './components/TimelineItem';
import MorningBriefing from './components/MorningBriefing';
import EveningReview from './components/EveningReview';
import { generateDailyPlan, generateMorningBriefing, reviewDayAndAdjust } from './services/geminiService';
import { LayoutDashboard, Loader2, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [morningMessage, setMorningMessage] = useState<string | null>(null);
  const [view, setView] = useState<'onboarding' | 'dashboard' | 'review'>('onboarding');
  const [adjustment, setAdjustment] = useState<string>('');

  // Load state from local storage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('fitpath_profile');
    const savedPlan = localStorage.getItem('fitpath_plan');
    const savedAdjustment = localStorage.getItem('fitpath_adjustment');
    const savedDate = localStorage.getItem('fitpath_date');
    const today = new Date().toDateString();

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      
      if (savedPlan && savedDate === today) {
        // Restore today's session
        setPlan(JSON.parse(savedPlan));
        setView('dashboard');
        // If we have a plan but no message shown yet this session, maybe generate one? 
        // For simplicity, we only generate message on fresh plan creation or explicit reload, 
        // but let's try to restore the message if possible or just skip it on reload.
      } else {
        // Profile exists but no plan for today (or expired)
        setAdjustment(savedAdjustment || '');
        setView('dashboard'); // Will trigger useEffect to generate
      }
    }
  }, []);

  // Save plan updates
  useEffect(() => {
    if (plan.length > 0) {
      localStorage.setItem('fitpath_plan', JSON.stringify(plan));
      localStorage.setItem('fitpath_date', new Date().toDateString());
    }
  }, [plan]);

  // Generate Plan Trigger
  useEffect(() => {
    const initDay = async () => {
      if (profile && plan.length === 0 && view === 'dashboard') {
        setLoading(true);
        // Generate Plan
        const newPlan = await generateDailyPlan(profile, adjustment);
        setPlan(newPlan);
        
        // Generate Morning Briefing
        const briefing = await generateMorningBriefing(profile, newPlan);
        setMorningMessage(briefing);
        
        setLoading(false);
      }
    };
    initDay();
  }, [profile, plan.length, view, adjustment]);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('fitpath_profile', JSON.stringify(newProfile));
    setView('dashboard');
  };

  const toggleTask = (id: string) => {
    setPlan(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleReviewSubmit = async (feedback: string): Promise<ReviewResult> => {
    if (!profile) throw new Error("No profile");
    return await reviewDayAndAdjust(profile, plan, feedback);
  };

  const startNextDay = () => {
    // Clear current plan
    setPlan([]);
    setMorningMessage(null);
    setView('dashboard');
    localStorage.removeItem('fitpath_plan');
    // Note: In a real app, we'd archive the old plan.
  };

  if (view === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (view === 'review') {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <EveningReview 
          plan={plan} 
          onSubmit={handleReviewSubmit}
          onNextDay={() => {
            // Save any necessary context for next day here if needed
            startNextDay();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white sticky top-0 z-10 border-b border-slate-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-xl">
          <LayoutDashboard size={24} />
          <span>FitPath AI</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs text-slate-400">Current Goal</p>
            <p className="text-sm font-semibold text-slate-700">{profile?.targetWeight} kg</p>
          </div>
          <button 
            onClick={() => setView('onboarding')} // Reset for demo purposes
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200"
            title="Edit Profile"
          >
             <RefreshCw size={14} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-emerald-600">
            <Loader2 size={48} className="animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-slate-800">Designing Your Day...</h2>
            <p className="text-slate-500 mt-2">Analyzing your profession and goals</p>
          </div>
        ) : (
          <>
            {/* Morning Briefing */}
            {morningMessage && (
              <MorningBriefing 
                message={morningMessage} 
                onDismiss={() => setMorningMessage(null)} 
              />
            )}

            {/* Date Header */}
            <div className="mb-6 flex items-baseline justify-between">
              <h1 className="text-2xl font-bold text-slate-800">Today's Schedule</h1>
              <span className="text-slate-500 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* Timeline */}
            <div className="space-y-0">
              {plan.map(item => (
                <TimelineItem 
                  key={item.id} 
                  item={item} 
                  onToggle={toggleTask} 
                />
              ))}
            </div>

            {/* Empty State Fallback */}
            {plan.length === 0 && !loading && (
              <div className="text-center py-20 text-slate-400">
                <p>No plan generated yet.</p>
                <button onClick={() => setPlan([])} className="mt-4 text-emerald-600 font-medium hover:underline">Retry</button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Action Button for Review */}
      {!loading && plan.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 pointer-events-none">
          <button 
            onClick={() => setView('review')}
            className="pointer-events-auto bg-slate-900 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-slate-300 hover:bg-slate-800 hover:scale-105 transition-all flex items-center gap-2"
          >
            End Day & Review Check-in
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
