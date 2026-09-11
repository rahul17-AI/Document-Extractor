import React, { useState } from 'react';
import { Copy, Check, Download, FileJson } from 'lucide-react';

export default function JsonViewer({ data }) {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState('full'); // 'full' or 'pairs_only'

  if (!data) return null;

  const jsonToDisplay = mode === 'pairs_only' ? data.sections : data;
  const jsonString = JSON.stringify(jsonToDisplay, null, 2);

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
    a.download = mode === 'pairs_only' 
      ? `${(data.filename || 'filing').replace('.pdf', '')}_pairs.json`
      : `${(data.filename || 'filing').replace('.pdf', '')}_extracted.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sizeKb = (new Blob([jsonString]).size / 1024).toFixed(1);

  return (
    <div className="bg-white border border-sky-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Viewer Header Bar */}
      <div className="px-5 py-3.5 border-b border-[#EAE0D7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF6F2]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#6C4A3A] flex items-center justify-center text-white shadow-xs">
            <FileJson className="w-4 h-4 text-sky-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#2D1F18] font-mono">
                {mode === 'pairs_only' ? 'Array<{ heading, text }>' : 'FilingPayload'}
              </span>
              <span className="text-[11px] bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full font-medium font-mono">
                {data.sections?.length || 0} items
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Format selector */}
          <div className="inline-flex p-0.5 bg-[#EFE6DF] rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setMode('full')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                mode === 'full'
                  ? 'bg-white text-[#2D1F18] font-bold shadow-xs'
                  : 'text-[#7A5E50] hover:text-[#2D1F18]'
              }`}
            >
              Full Payload
            </button>
            <button
              type="button"
              onClick={() => setMode('pairs_only')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                mode === 'pairs_only'
                  ? 'bg-white text-[#2D1F18] font-bold shadow-xs'
                  : 'text-[#7A5E50] hover:text-[#2D1F18]'
              }`}
            >
              Heading/Text Only
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#6C4A3A] hover:text-[#2D1F18] bg-white hover:bg-sky-50 border border-sky-200 transition-colors cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#8C6E5E]" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#6C4A3A] hover:bg-[#5A3C2E] transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-sky-100" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code Display Canvas */}
      <div className="p-5 bg-[#131F2E] overflow-x-auto max-h-[65vh]">
        <pre className="font-mono text-xs text-sky-100 leading-relaxed">
          <code>{jsonString}</code>
        </pre>
      </div>

      {/* Footer Info */}
      <div className="px-5 py-2.5 bg-[#FAF6F2] border-t border-[#EAE0D7] text-xs text-[#7A5E50] flex items-center justify-between">
        <span className="font-mono text-[11px] text-[#6C4A3A] font-medium">{data.filename || 'filing.pdf'}</span>
        <span className="font-mono text-[11px] text-sky-700 font-semibold bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">{sizeKb} KB</span>
      </div>
    </div>
  );
}

