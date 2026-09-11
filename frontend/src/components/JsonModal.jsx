import React, { useState } from 'react';
import { X, Copy, Check, Download, FileJson } from 'lucide-react';

export default function JsonModal({ isOpen, onClose, data }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data.filename || 'filing').replace('.pdf', '')}_extracted.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D1F18]/50 backdrop-blur-xs">
      <div className="bg-white border border-sky-100 rounded-2xl w-full max-w-3xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#EAE0D7] flex items-center justify-between bg-[#FAF6F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#FAF4F0] border border-[#E6DAD0] flex items-center justify-center text-[#6C4A3A]">
              <FileJson className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#2D1F18]">Extracted JSON Payload</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#6C4A3A] hover:text-[#2D1F18] bg-white hover:bg-sky-50 border border-sky-200 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#8C6E5E]" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#6C4A3A] hover:bg-[#5A3C2E] transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-sky-100" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#7A5E50] hover:text-[#2D1F18] hover:bg-[#EFE6DF] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code View */}
        <div className="p-5 bg-[#131F2E] overflow-x-auto flex-1">
          <pre className="font-mono text-xs text-sky-100 leading-relaxed">
            <code>{jsonString}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-[#FAF6F2] border-t border-[#EAE0D7] text-[11px] text-[#7A5E50] flex items-center justify-between font-mono">
          <span className="font-medium text-[#6C4A3A]">{data.filename || 'filing.pdf'}</span>
          <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full">{data.sections?.length || 0} sections</span>
        </div>
      </div>
    </div>
  );
}

