
import { UserProfile, PlanItem, FoodItem, Language } from '../types';

// Storage Keys
const KEYS = {
  PROFILE: 'fitpath_profile',
  PLAN: 'fitpath_plan',
  FOOD_LOGS: 'fitpath_food_logs',
  ADJUSTMENT: 'fitpath_adjustment',
  DATE: 'fitpath_date',
  LANG: 'fitpath_language'
};

// Helper to calculate BMR and Daily Calorie Needs
export const calculateCalorieGoal = (profile: UserProfile): number => {
  // Mifflin-St Jeor Equation
  let bmr = 10 * profile.currentWeight + 6.25 * profile.height - 5 * profile.age;
  bmr += profile.gender === 'Male' ? 5 : -161;

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725
  };

  const multiplier = activityMultipliers[profile.activityLevel || 'sedentary'];
  
  // Deficit for weight loss (approx 500 kcal)
  const maintenance = bmr * multiplier;
  return Math.round(maintenance - 500);
};

export const db = {
  // --- Profile ---
  saveProfile: (profile: UserProfile) => {
    const profileWithGoal = {
      ...profile,
      dailyCalorieGoal: calculateCalorieGoal(profile)
    };
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profileWithGoal));
    return profileWithGoal;
  },

  getProfile: (): UserProfile | null => {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  },

  // --- Plan ---
  savePlan: (plan: PlanItem[]) => {
    localStorage.setItem(KEYS.PLAN, JSON.stringify(plan));
    localStorage.setItem(KEYS.DATE, new Date().toDateString());
  },

  getPlan: (): PlanItem[] | null => {
    const date = localStorage.getItem(KEYS.DATE);
    const today = new Date().toDateString();
    if (date !== today) return null; // Expired plan
    const data = localStorage.getItem(KEYS.PLAN);
    return data ? JSON.parse(data) : null;
  },

  clearPlan: () => {
    localStorage.removeItem(KEYS.PLAN);
  },

  // --- Food Logs ---
  saveFoodLog: (item: FoodItem) => {
    const logs = db.getFoodLogs();
    logs.push(item);
    localStorage.setItem(KEYS.FOOD_LOGS, JSON.stringify(logs));
    return logs;
  },

  getFoodLogs: (dateString?: string): FoodItem[] => {
    const data = localStorage.getItem(KEYS.FOOD_LOGS);
    const allLogs: FoodItem[] = data ? JSON.parse(data) : [];
    
    if (!dateString) return allLogs;

    // Filter by date if provided
    const start = new Date(dateString).setHours(0,0,0,0);
    const end = new Date(dateString).setHours(23,59,59,999);
    
    return allLogs.filter(log => log.timestamp >= start && log.timestamp <= end);
  },

  // --- Settings ---
  setLanguage: (lang: Language) => {
    localStorage.setItem(KEYS.LANG, lang);
  },

  getLanguage: (): Language => {
    return (localStorage.getItem(KEYS.LANG) as Language) || 'en';
  },

  setAdjustment: (adj: string) => {
    localStorage.setItem(KEYS.ADJUSTMENT, adj);
  },

  getAdjustment: (): string => {
    return localStorage.getItem(KEYS.ADJUSTMENT) || '';
  }
};
