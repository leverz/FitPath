
import React, { useState } from 'react';
import { FoodItem, Language } from '../types';
import { translations } from '../translations';
import { analyzeFood } from '../services/geminiService';
import { X, Loader2, Check } from 'lucide-react';

interface FoodLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: FoodItem) => void;
  lang: Language;
}

const FoodLogger: React.FC<FoodLoggerProps> = ({ isOpen, onClose, onSave, lang }) => {
  const t = translations[lang];
  const [input, setInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FoodItem | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setAnalyzing(true);
    try {
      const data = await analyzeFood(input, lang);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (result) {
      onSave(result);
      handleClose();
    }
  };

  const handleClose = () => {
    setInput('');
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-800">{t.addFood}</h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {!result ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.whatDidYouEat}</label>
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.describeMeal}
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-slate-800 min-h-[100px] resize-none"
                  autoFocus
                />
              </div>
              <button 
                onClick={handleAnalyze}
                disabled={analyzing || !input.trim()}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {analyzing ? <Loader2 className="animate-spin" size={20} /> : t.analyzeFood}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                 <h4 className="font-bold text-emerald-900 text-lg mb-1">{result.name}</h4>
                 <div className="flex items-baseline gap-1 text-emerald-700">
                    <span className="text-2xl font-bold">{result.calories}</span>
                    <span className="text-sm font-medium">kcal</span>
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                 <div className="p-3 rounded-xl bg-slate-50 text-center border border-slate-100">
                    <span className="block text-xs text-slate-400 font-bold uppercase">{t.protein}</span>
                    <span className="block text-lg font-bold text-slate-700">{result.protein}g</span>
                 </div>
                 <div className="p-3 rounded-xl bg-slate-50 text-center border border-slate-100">
                    <span className="block text-xs text-slate-400 font-bold uppercase">{t.carbs}</span>
                    <span className="block text-lg font-bold text-slate-700">{result.carbs}g</span>
                 </div>
                 <div className="p-3 rounded-xl bg-slate-50 text-center border border-slate-100">
                    <span className="block text-xs text-slate-400 font-bold uppercase">{t.fat}</span>
                    <span className="block text-lg font-bold text-slate-700">{result.fat}g</span>
                 </div>
              </div>

              <div className="flex gap-3 pt-2">
                 <button 
                   onClick={() => setResult(null)}
                   className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                 >
                   {t.retry}
                 </button>
                 <button 
                   onClick={handleSave}
                   className="flex-[2] py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                 >
                   <Check size={20} /> {t.saveLog}
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodLogger;
