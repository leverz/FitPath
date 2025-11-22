
import React from 'react';
import { FoodItem, Language } from '../types';
import { translations } from '../translations';
import { Flame, Plus } from 'lucide-react';

interface CalorieTrackerProps {
  logs: FoodItem[];
  goal: number;
  onAddFood: () => void;
  lang: Language;
}

const CalorieTracker: React.FC<CalorieTrackerProps> = ({ logs, goal, onAddFood, lang }) => {
  const t = translations[lang];
  
  const totalCalories = logs.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = logs.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = logs.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = logs.reduce((sum, item) => sum + item.fat, 0);

  const percentage = Math.min((totalCalories / goal) * 100, 100);
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <Flame size={18} className="text-orange-500" fill="currentColor" />
          {t.dailyIntake}
        </h2>
        <button 
          onClick={onAddFood}
          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1"
        >
          <Plus size={14} /> {t.addFood}
        </button>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="font-bold text-slate-700">{totalCalories} kcal</span>
          <span className="text-slate-400">{t.goal}: {goal}</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-400 to-pink-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="text-center bg-blue-50 rounded-lg p-2">
          <span className="block text-xs text-blue-400 font-bold uppercase tracking-wider">{t.protein}</span>
          <span className="text-sm font-bold text-blue-700">{totalProtein}g</span>
        </div>
        <div className="text-center bg-amber-50 rounded-lg p-2">
          <span className="block text-xs text-amber-400 font-bold uppercase tracking-wider">{t.carbs}</span>
          <span className="text-sm font-bold text-amber-700">{totalCarbs}g</span>
        </div>
        <div className="text-center bg-rose-50 rounded-lg p-2">
          <span className="block text-xs text-rose-400 font-bold uppercase tracking-wider">{t.fat}</span>
          <span className="text-sm font-bold text-rose-700">{totalFat}g</span>
        </div>
      </div>
    </div>
  );
};

export default CalorieTracker;
