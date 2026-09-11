import React, { useState } from 'react';
import { Copy, Check, FileText } from 'lucide-react';

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
          ? 'bg-sky-50/60 border-sky-400 shadow-sm'
          : 'bg-white border-sky-100 hover:border-sky-300 shadow-2xs'
      }`}
    >
      {/* Heading Header */}
      <div className="px-5 py-4 border-b border-[#F5EDE7] flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="w-7 h-7 rounded-lg bg-[#FAF4F0] text-[#6C4A3A] border border-[#E6DAD0] flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#2D1F18] leading-snug">
              {section.heading}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full">
                {isNoText ? 'Title Only' : `${wordCount} words`}
              </span>
            </div>
          </div>
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#6C4A3A] hover:text-[#2D1F18] bg-white hover:bg-[#FAF4F0] border border-[#E6DAD0] transition-colors shrink-0 cursor-pointer shadow-2xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#8C6E5E]" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Body Content */}
      <div className="p-5 sm:p-6">
        {isNoText ? (
          <p className="text-xs italic text-[#998173]">
            Standalone heading or section index without narrative body.
          </p>
        ) : (
          <div className="text-[#3E2B22] text-sm leading-relaxed space-y-3 font-normal">
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

