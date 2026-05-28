import React from 'react';
import { useLanguage, isUserInIndia } from '../lib/LanguageContext';
import { Languages } from 'lucide-react';
import { cn } from '../lib/utils';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  if (!isUserInIndia()) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full p-1">
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
          language === 'en' ? "bg-white text-[#1a1a2e]" : "text-white/60 hover:text-white"
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={cn(
          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
          language === 'hi' ? "bg-white text-[#1a1a2e]" : "text-white/60 hover:text-white"
        )}
      >
        हिन्दी
      </button>
    </div>
  );
}
