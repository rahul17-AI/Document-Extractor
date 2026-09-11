import React from 'react';
import { AlignLeft } from 'lucide-react';

export default function SectionNav({ sections = [], activeIndex, onSelectSection }) {
  if (!sections.length) return null;

  return (
    <div className="bg-white border border-sky-100 rounded-2xl p-4 sticky top-20 max-h-[calc(100vh-6rem)] flex flex-col shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#F4ECE5] text-[#2D1F18]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#FAF4F0] border border-[#E6DAD0] flex items-center justify-center text-[#6C4A3A]">
            <AlignLeft className="w-3 h-3" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C4336]">Outline</h3>
        </div>
        <span className="text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full">
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
                  ? 'bg-sky-50 text-sky-900 border border-sky-200 font-semibold' 
                  : 'text-[#5C4336] hover:text-[#2D1F18] hover:bg-[#FAF4F0]'
              }`}
            >
              <span className="text-[11px] font-mono font-bold text-[#8C7060] shrink-0 mt-0.5">
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

