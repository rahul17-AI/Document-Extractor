import React from 'react';
import { AlignLeft } from 'lucide-react';

export default function SectionNav({ sections = [], activeIndex, onSelectSection }) {
  if (!sections.length) return null;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sticky top-20 max-h-[calc(100vh-6rem)] flex flex-col shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 text-slate-900">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
            <AlignLeft className="w-3 h-3" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Outline</h3>
        </div>
        <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full">
          {sections.length} sections
        </span>
      </div>

      <div className="overflow-y-auto space-y-0.5 pr-1 text-xs">
        {sections.map((section, idx) => {
          const isActive = activeIndex === idx;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSection(idx)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-start gap-2 cursor-pointer ${
                isActive 
                  ? 'bg-blue-50 text-blue-900 border border-blue-200/90 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0 mt-0.5">
                {String(idx + 1).padStart(2, '0')}.
              </span>
              <span className="truncate leading-relaxed">
                {section.heading}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

