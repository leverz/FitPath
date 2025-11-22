import React from 'react';
import { PlanItem, ActivityType } from '../types';
import { CheckCircle2, Circle, Utensils, Dumbbell, Briefcase, Coffee, Moon, Droplets, Flame } from 'lucide-react';

interface TimelineItemProps {
  item: PlanItem;
  onToggle: (id: string) => void;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ item, onToggle }) => {
  const getIcon = () => {
    switch (item.type) {
      case ActivityType.MEAL: return <Utensils size={18} className="text-orange-500" />;
      case ActivityType.EXERCISE: return <Dumbbell size={18} className="text-emerald-500" />;
      case ActivityType.WORK: return <Briefcase size={18} className="text-slate-500" />;
      case ActivityType.HYDRATION: return <Droplets size={18} className="text-blue-400" />;
      case ActivityType.REST: return <Moon size={18} className="text-indigo-400" />;
      default: return <Coffee size={18} className="text-slate-400" />;
    }
  };

  const getBorderColor = () => {
    if (item.completed) return 'border-emerald-200 bg-emerald-50/30';
    if (item.isHighlight) return 'border-emerald-500 border-l-4 bg-white shadow-md';
    return 'border-slate-100 bg-white shadow-sm';
  };

  return (
    <div className={`relative pl-8 pb-8 border-l-2 ${item.completed ? 'border-emerald-300' : 'border-slate-200'} last:border-0 last:pb-0`}>
      {/* Timeline Dot */}
      <div 
        onClick={() => onToggle(item.id)}
        className={`absolute -left-[9px] top-0 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-all bg-white border-2 ${item.completed ? 'border-emerald-500 text-emerald-500' : 'border-slate-300 text-slate-300 hover:border-emerald-400 hover:text-emerald-400'}`}
      >
        {item.completed ? <CheckCircle2 size={16} fill="currentColor" className="text-white" /> : <div className="w-2 h-2 rounded-full bg-current" />}
      </div>

      {/* Card */}
      <div 
        onClick={() => onToggle(item.id)}
        className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${getBorderColor()} ${item.completed ? 'opacity-60 grayscale-[0.3]' : 'opacity-100'}`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded">
              {item.time}
            </span>
            {item.isHighlight && (
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                Priority
              </span>
            )}
          </div>
          <div className="p-1.5 bg-slate-50 rounded-full border border-slate-100">
            {getIcon()}
          </div>
        </div>

        <h3 className={`font-semibold text-slate-900 text-lg ${item.completed && 'line-through text-slate-500'}`}>
          {item.title}
        </h3>
        
        <p className="text-slate-600 text-sm mt-1 leading-relaxed">
          {item.description}
        </p>

        {item.calories !== undefined && item.calories !== 0 && (
           <div className={`mt-3 text-xs font-medium flex items-center gap-1 ${item.calories > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
             <Flame size={12} />
             {item.calories > 0 ? `+${item.calories} kcal` : `${item.calories} kcal`}
           </div>
        )}
      </div>
    </div>
  );
};

export default TimelineItem;
