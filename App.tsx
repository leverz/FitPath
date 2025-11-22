
import React, { useState, useEffect } from 'react';
import { UserProfile, PlanItem, ReviewResult, Language, FoodItem } from './types';
import { translations } from './translations';
import Onboarding from './components/Onboarding';
import TimelineItem from './components/TimelineItem';
import MorningBriefing from './components/MorningBriefing';
import EveningReview from './components/EveningReview';
import CalorieTracker from './components/CalorieTracker';
import FoodLogger from './components/FoodLogger';
import { generateDailyPlan, generateMorningBriefing, reviewDayAndAdjust } from './services/geminiService';
import { db, calculateCalorieGoal } from './services/db';
import { LayoutDashboard, Loader2, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [morningMessage, setMorningMessage] = useState<string | null>(null);
  const [view, setView] = useState<'onboarding' | 'dashboard' | 'review'>('onboarding');
  const [adjustment, setAdjustment] = useState<string>('');
  const [language, setLanguage] = useState<Language>('en');
  
  // Nutrition State
  const [foodLogs, setFoodLogs] = useState<FoodItem[]>([]);
  const [isFoodLoggerOpen, setIsFoodLoggerOpen] = useState(false);

  const t = translations[language];

  // Initialize App State from DB
  useEffect(() => {
    const savedProfile = db.getProfile();
    const savedPlan = db.getPlan();
    const savedAdjustment = db.getAdjustment();
    const savedLang = db.getLanguage();
    const today = new Date().toDateString();

    if (savedLang) setLanguage(savedLang);

    if (savedProfile) {
      setProfile(savedProfile);
      
      // Load Food Logs
      setFoodLogs(db.getFoodLogs(today));

      if (savedPlan) {
        setPlan(savedPlan);
        setView('dashboard');
      } else {
        setAdjustment(savedAdjustment || '');
        setView('dashboard'); // Triggers generation
      }
    }
  }, []);

  // Persist Plan Updates
  useEffect(() => {
    if (plan.length > 0) {
      db.savePlan(plan);
    }
  }, [plan]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    db.setLanguage(lang);
  };

  // Generate Plan Logic
  useEffect(() => {
    const initDay = async () => {
      if (profile && plan.length === 0 && view === 'dashboard') {
        setLoading(true);
        const newPlan = await generateDailyPlan(profile, adjustment, language);
        setPlan(newPlan);
        
        const briefing = await generateMorningBriefing(profile, newPlan, language);
        setMorningMessage(briefing);
        
        setLoading(false);
      }
    };
    initDay();
  }, [profile, plan.length, view, adjustment, language]);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    const saved = db.saveProfile(newProfile);
    setProfile(saved);
    setView('dashboard');
  };

  const toggleTask = (id: string) => {
    setPlan(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleReviewSubmit = async (feedback: string): Promise<ReviewResult> => {
    if (!profile) throw new Error("No profile");
    return await reviewDayAndAdjust(profile, plan, feedback, language);
  };

  const startNextDay = () => {
    db.clearPlan();
    setPlan([]);
    setMorningMessage(null);
    setView('dashboard');
    setFoodLogs([]); // Reset food logs for visual, though DB keeps history
  };

  const handleSaveFoodLog = (item: FoodItem) => {
    const updatedLogs = db.saveFoodLog(item);
    // Filter for today to update UI
    const today = new Date().toDateString();
    const todayLogs = updatedLogs.filter(
      log => new Date(log.timestamp).toDateString() === today
    );
    setFoodLogs(todayLogs);
  };

  const LanguageSwitcher = () => (
    <div className="flex items-center bg-slate-100 rounded-full p-1">
      <button 
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
      >
        EN
      </button>
      <button 
        onClick={() => handleLanguageChange('zh')}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'zh' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
      >
        中文
      </button>
    </div>
  );

  if (view === 'onboarding') {
    return (
      <>
        <div className="absolute top-4 right-4 z-50">
          <LanguageSwitcher />
        </div>
        <Onboarding onComplete={handleOnboardingComplete} lang={language} />
      </>
    );
  }

  if (view === 'review') {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <EveningReview 
          plan={plan} 
          onSubmit={handleReviewSubmit}
          onNextDay={startNextDay}
          lang={language}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-white sticky top-0 z-20 border-b border-slate-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-xl">
          <LayoutDashboard size={24} />
          <span className="hidden xs:inline">{t.appTitle}</span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <button 
            onClick={() => setView('onboarding')} 
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200"
            title={t.editProfile}
          >
             <RefreshCw size={14} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-emerald-600">
            <Loader2 size={48} className="animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-slate-800">{t.designing}</h2>
            <p className="text-slate-500 mt-2">{t.designingDesc}</p>
          </div>
        ) : (
          <>
            {/* Morning Briefing */}
            {morningMessage && (
              <MorningBriefing 
                message={morningMessage} 
                onDismiss={() => setMorningMessage(null)} 
                lang={language}
              />
            )}

            {/* Calorie Tracker Widget */}
            {profile && (
              <CalorieTracker 
                logs={foodLogs}
                goal={profile.dailyCalorieGoal || 2000}
                onAddFood={() => setIsFoodLoggerOpen(true)}
                lang={language}
              />
            )}

            {/* Date Header */}
            <div className="mb-6 flex items-baseline justify-between">
              <h1 className="text-2xl font-bold text-slate-800">{t.todaySchedule}</h1>
              <span className="text-slate-500 font-medium">
                {language === 'zh' 
                  ? new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })
                  : new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
                }
              </span>
            </div>

            {/* Timeline */}
            <div className="space-y-0">
              {plan.map(item => (
                <TimelineItem 
                  key={item.id} 
                  item={item} 
                  onToggle={toggleTask} 
                  lang={language}
                />
              ))}
            </div>

            {/* Empty State */}
            {plan.length === 0 && !loading && (
              <div className="text-center py-20 text-slate-400">
                <p>{t.noPlan}</p>
                <button onClick={() => setPlan([])} className="mt-4 text-emerald-600 font-medium hover:underline">{t.retry}</button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Action Button for Review */}
      {!loading && plan.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 pointer-events-none z-10">
          <button 
            onClick={() => setView('review')}
            className="pointer-events-auto bg-slate-900 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-slate-300 hover:bg-slate-800 hover:scale-105 transition-all flex items-center gap-2"
          >
            {t.endDay}
          </button>
        </div>
      )}

      {/* Food Logger Modal */}
      <FoodLogger 
        isOpen={isFoodLoggerOpen}
        onClose={() => setIsFoodLoggerOpen(false)}
        onSave={handleSaveFoodLog}
        lang={language}
      />
    </div>
  );
};

export default App;
