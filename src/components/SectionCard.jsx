import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function SectionCard({ section, index, isHighlighted }) {
  const [copied, setCopied] = useState(false);

  const wordCount = section.text ? section.text.trim().split(/\s+/).filter(Boolean).length : 0;
  const isNoText = !section.text || section.text.trim().length === 0;

  const handleCopy = () => {
    const content = `${section.heading}\n\n${section.text || ''}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      id={`section-${index}`}
      className={`rounded-2xl border transition-all ${
        isHighlighted
          ? 'bg-blue-50/40 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
      }`}
    >
      {/* Heading Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {section.heading}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">
                {isNoText ? 'Title Only' : `${wordCount} words`}
              </span>
            </div>
          </div>
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shrink-0 cursor-pointer shadow-2xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Body Content */}
      <div className="p-5 sm:p-6">
        {isNoText ? (
          <p className="text-xs italic text-slate-400">
            Standalone heading or section index without narrative body.
          </p>
        ) : (
          <div className="text-slate-700 text-sm leading-relaxed space-y-3 font-normal">
            {section.text.split('\n\n').map((paragraph, pIdx) => (
              <p key={pIdx} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

