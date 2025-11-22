export enum ActivityType {
  MEAL = 'MEAL',
  EXERCISE = 'EXERCISE',
  WORK = 'WORK',
  REST = 'REST',
  HYDRATION = 'HYDRATION',
  CHECKIN = 'CHECKIN'
}

export interface PlanItem {
  id: string;
  time: string; // HH:MM format
  type: ActivityType;
  title: string;
  description: string;
  calories?: number; // Estimated calories (+ for intake, - for burn)
  completed: boolean;
  isHighlight?: boolean; // Important task
}

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  height: number; // cm
  currentWeight: number; // kg
  targetWeight: number; // kg
  profession: string; // Affects activity level and schedule
  wakeUpTime: string;
  sleepTime: string;
  dietaryPreferences?: string;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active';
}

export interface DailySummary {
  date: string;
  totalCaloriesIn: number;
  totalCaloriesOut: number;
  completionRate: number; // 0-100
  mood?: 'great' | 'good' | 'neutral' | 'bad';
  notes?: string;
}

export interface ReviewResult {
  feedback: string;
  suggestedAdjustment: string;
}

export type Language = 'en' | 'zh';
