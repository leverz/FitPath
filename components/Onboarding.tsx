
import React, { useState } from 'react';
import { UserProfile, Language } from '../types';
import { translations } from '../translations';
import { ChevronRight, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  lang: Language;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, lang }) => {
  const t = translations[lang];
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    wakeUpTime: '07:00',
    sleepTime: '23:00',
    gender: 'Male',
    activityLevel: 'sedentary',
    dietaryPreferences: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData as UserProfile);
  };

  const inputClass = "w-full p-4 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-medium text-slate-800 placeholder:text-slate-400";
  const labelClass = "block text-sm font-bold text-slate-700 mb-2 ml-1";

  const genders = [
    { val: 'Male', label: t.male },
    { val: 'Female', label: t.female },
    { val: 'Other', label: t.other }
  ];

  const activityLevels = [
    { val: 'sedentary', label: t.sedentary, icon: '🪑' },
    { val: 'light', label: t.light, icon: '🚶' },
    { val: 'moderate', label: t.moderate, icon: '🏃' },
    { val: 'active', label: t.active, icon: '🔥' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden flex flex-col min-h-[600px]">
        
        {/* Progress Header */}
        <div className="bg-slate-900 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">{t.appTitle}</h1>
            <span className="text-xs font-medium bg-slate-700 px-2 py-1 rounded-full">
              {t.step} {step} {t.of} 3
            </span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-400 transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6">
          
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="flex-1 space-y-6 animate-in slide-in-from-right duration-300">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">{t.whoAreYou}</h2>
                <p className="text-slate-500">{t.whoAreYouDesc}</p>
              </div>

              <div>
                <label className={labelClass}>{t.yourName}</label>
                <input 
                  required 
                  name="name" 
                  value={formData.name || ''}
                  onChange={handleChange} 
                  className={inputClass} 
                  placeholder={lang === 'zh' ? "如: 张三" : "e.g. Alex Smith"}
                  autoFocus 
                />
              </div>
              
              <div>
                <label className={labelClass}>{t.age}</label>
                <input 
                  required 
                  type="number"
                  name="age" 
                  value={formData.age || ''}
                  onChange={handleChange} 
                  className={inputClass} 
                  placeholder="30"
                />
              </div>

              <div>
                <label className={labelClass}>{t.gender}</label>
                <div className="grid grid-cols-3 gap-3">
                  {genders.map((g) => (
                    <button
                      key={g.val}
                      type="button"
                      onClick={() => handleSelect('gender', g.val)}
                      className={`p-3 rounded-xl font-medium transition-all border-2 ${
                        formData.gender === g.val 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>{t.profession}</label>
                <input 
                  required 
                  name="profession" 
                  value={formData.profession || ''}
                  onChange={handleChange} 
                  className={inputClass} 
                  placeholder={lang === 'zh' ? "如: 程序员, 司机, 教师" : "e.g. Designer, Teacher, Driver"} 
                />
                <p className="text-xs text-slate-400 mt-2 ml-1">{t.professionDesc}</p>
              </div>
            </div>
          )}

          {/* STEP 2: BODY METRICS */}
          {step === 2 && (
            <div className="flex-1 space-y-6 animate-in slide-in-from-right duration-300">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">{t.yourGoals}</h2>
                <p className="text-slate-500">{t.yourGoalsDesc}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t.height}</label>
                  <input 
                    required 
                    type="number" 
                    name="height" 
                    value={formData.height || ''}
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="175" 
                    autoFocus
                  />
                </div>
                <div>
                  <label className={labelClass}>{t.currentWeight}</label>
                  <input 
                    required 
                    type="number" 
                    name="currentWeight" 
                    value={formData.currentWeight || ''}
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="80" 
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>{t.targetWeight}</label>
                <div className="relative">
                  <input 
                    required 
                    type="number" 
                    name="targetWeight" 
                    value={formData.targetWeight || ''}
                    onChange={handleChange} 
                    className={`${inputClass} border-emerald-200 bg-emerald-50/30 text-lg`}
                    placeholder="70" 
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">
                    KG
                  </div>
                </div>
              </div>

               <div>
                <label className={labelClass}>{t.activityLevel}</label>
                <div className="grid grid-cols-2 gap-3">
                  {activityLevels.map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => handleSelect('activityLevel', item.val)}
                      className={`p-3 rounded-xl text-left border-2 transition-all ${
                        formData.activityLevel === item.val 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-slate-100 bg-slate-50 hover:border-emerald-200'
                      }`}
                    >
                      <span className="text-lg block mb-1">{item.icon}</span>
                      <span className={`text-sm font-bold ${formData.activityLevel === item.val ? 'text-emerald-800' : 'text-slate-600'}`}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ROUTINE */}
          {step === 3 && (
            <div className="flex-1 space-y-6 animate-in slide-in-from-right duration-300">
               <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">{t.dailyRoutine}</h2>
                <p className="text-slate-500">{t.dailyRoutineDesc}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t.wakeUp}</label>
                  <input 
                    required 
                    type="time" 
                    name="wakeUpTime" 
                    value={formData.wakeUpTime} 
                    onChange={handleChange} 
                    className={inputClass} 
                  />
                </div>
                <div>
                  <label className={labelClass}>{t.sleep}</label>
                  <input 
                    required 
                    type="time" 
                    name="sleepTime" 
                    value={formData.sleepTime} 
                    onChange={handleChange} 
                    className={inputClass} 
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>{t.dietary}</label>
                <input 
                  name="dietaryPreferences" 
                  value={formData.dietaryPreferences || ''}
                  onChange={handleChange} 
                  className={inputClass} 
                  placeholder={lang === 'zh' ? "如：素食, 戒糖..." : "Vegetarian, Keto, No Dairy..."} 
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                {t.back}
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={(step === 1 && !formData.name) || (step === 2 && !formData.currentWeight)}
                className="flex-[2] py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.continue} <ChevronRight size={20} />
              </button>
            ) : (
              <button
                type="submit"
                className="flex-[2] py-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
              >
                {t.generate} <Check size={20} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
