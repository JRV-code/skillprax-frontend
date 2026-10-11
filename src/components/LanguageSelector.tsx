'use client';

import React, { useState, useEffect } from 'react';
import { Languages, ChevronDown } from 'lucide-react';
import { SupportedLanguage } from '@/types';

const LANGUAGES: Array<{ code: SupportedLanguage; label: string; flag: string }> = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('skillprax_preferred_lang') as SupportedLanguage;
    if (saved && LANGUAGES.some((l) => l.code === saved)) {
      setCurrentLang(saved);
    }
  }, []);

  const handleSelect = (code: SupportedLanguage) => {
    setCurrentLang(code);
    localStorage.setItem('skillprax_preferred_lang', code);
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('skillprax:language-changed', { detail: { language: code } }));
  };

  const active = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
        title="Select System Language"
      >
        <Languages className="w-3.5 h-3.5 text-emerald-600" />
        <span className="hidden sm:inline">{active.flag}</span>
        <span>{active.label}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 z-50 animate-fade-in">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code)}
              className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                currentLang === l.code
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </div>
              {currentLang === l.code && <span className="text-emerald-600">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
