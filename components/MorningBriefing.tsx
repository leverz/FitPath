import React from 'react';
import { Sun, X } from 'lucide-react';

interface MorningBriefingProps {
  message: string;
  onDismiss: () => void;
}

const MorningBriefing: React.FC<MorningBriefingProps> = ({ message, onDismiss }) => {
  return (
    <div className="bg-gradient-to-r from-orange-100 to-amber-50 p-6 rounded-2xl mb-8 border border-orange-200 relative shadow-sm">
      <button 
        onClick={onDismiss}
        className="absolute top-4 right-4 text-orange-400 hover:text-orange-600 transition-colors"
      >
        <X size={20} />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white rounded-full text-orange-500 shadow-sm">
          <Sun size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-orange-900 mb-1">Morning Briefing</h2>
          <p className="text-orange-800 leading-relaxed text-sm md:text-base">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MorningBriefing;
