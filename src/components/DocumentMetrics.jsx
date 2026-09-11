import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';

export default function DocumentMetrics({ filename, sections = [] }) {
  const totalSections = sections.length;
  const totalWords = sections.reduce((acc, s) => {
    return acc + (s.text ? s.text.trim().split(/\s+/).filter(Boolean).length : 0);
  }, 0);
  const readingTimeMin = Math.max(1, Math.ceil(totalWords / 200));

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl px-5 py-3.5 mb-6 flex flex-wrap items-center justify-between gap-4 text-xs shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-2xs">
          <FileText className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-900 font-bold text-sm">{filename || 'Filing document'}</span>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Extracted
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 text-slate-500">
        <div>
          <span className="text-slate-900 font-bold text-sm">{totalSections}</span> <span className="text-xs">sections</span>
        </div>
        <div className="h-3 w-px bg-slate-200" />
        <div>
          <span className="text-slate-900 font-bold text-sm">{totalWords.toLocaleString()}</span> <span className="text-xs">words</span>
        </div>
        <div className="h-3 w-px bg-slate-200" />
        <div>
          ~<span className="text-slate-900 font-bold text-sm">{readingTimeMin}</span> <span className="text-xs">min read</span>
        </div>
      </div>
    </div>
  );
}

