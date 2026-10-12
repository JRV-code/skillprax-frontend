"use client";

import React, { useState, useRef, useEffect } from "react";
import { Languages, ChevronDown, Check } from "lucide-react";
import { useLanguage, SUPPORTED_LANGUAGES } from "@/context/LanguageContext";
import { SupportedLanguage } from "@/types";

export function LanguageSelector({ className = "" }: { className?: string }) {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const active =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer hover:border-emerald-300"
        title="Select Regional Language (English, Hindi, Gujarati, Marathi, etc.)"
      >
        <Languages className="w-3.5 h-3.5 text-emerald-600" />
        <span className="text-xs">{active.flag}</span>
        <span className="font-semibold">{active.native}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-2xl py-2 z-50 animate-fade-in max-h-72 overflow-y-auto">
          <div className="px-3 py-1 border-b border-slate-100 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Select Language
            </span>
          </div>
          {SUPPORTED_LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => handleSelect(l.code)}
              className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                currentLanguage === l.code
                  ? "bg-emerald-50 text-emerald-900 font-bold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">{l.flag}</span>
                <div>
                  <p className="leading-tight">{l.native}</p>
                  <p className="text-[10px] text-slate-400">{l.label}</p>
                </div>
              </div>
              {currentLanguage === l.code && (
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
