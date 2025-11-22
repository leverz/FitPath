import React, { useState } from 'react';
import { PlanItem, ReviewResult, Language } from '../types';
import { translations } from '../translations';
import { CheckCircle, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';

interface EveningReviewProps {
  plan: PlanItem[];
  onSubmit: (feedback: string) => Promise<ReviewResult>;
  onNextDay: () => void;
  lang: Language;
}

const EveningReview: React.FC<EveningReviewProps> = ({ plan, onSubmit, onNextDay, lang }) => {
  const t = translations[lang];
  const [feedback, setFeedback] = useState('');
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completedCount = plan.filter(p => p.completed).length;
  const progress = Math.round((completedCount / plan.length) * 100);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    setIsSubmitting(true);
    const data = await onSubmit(feedback);
    setResult(data);
    setIsSubmitting(false);
  };

  const addTag = (tag: string) => {
    setFeedback(prev => {
      const prefix = prev.length > 0 ? prev + ' ' : '';
      return prefix + tag + '.';
    });
  };

  if (result) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full mx-auto border border-emerald-100">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full text-emerald-600 mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{t.dayComplete}</h2>
          <p className="text-slate-500 mt-2">{t.summaryTitle}</p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
            <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide mb-2">{t.dailySummary}</h3>
            <p className="text-emerald-900 leading-relaxed">{result.feedback}</p>
          </div>
          
          <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
            <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wide mb-2">{t.planAdjustment}</h3>
            <p className="text-indigo-900 leading-relaxed">{result.suggestedAdjustment}</p>
          </div>
        </div>

        <button 
          onClick={onNextDay}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {t.startTomorrow} <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">{t.eveningCheckin}</h2>
      <p className="text-slate-500 mb-6">
        {t.tasksCompleted
          .replace('{completed}', completedCount.toString())
          .replace('{total}', plan.length.toString())
          .replace('{percent}', progress.toString())}
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-bold text-slate-700 mb-2 block">{t.howDidYouFeel}</label>
          
          {/* Quick Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {t.tags.map(tag => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-transparent rounded-full text-xs font-semibold text-slate-600 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          <textarea 
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 outline-none min-h-[120px] transition-all text-slate-800 placeholder:text-slate-400"
            placeholder="..."
          />
        </div>

        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || !feedback.trim()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : <MessageSquare size={18} />}
          {isSubmitting ? t.analyzing : t.completeDay}
        </button>
      </div>
    </div>
  );
};

export default EveningReview;
