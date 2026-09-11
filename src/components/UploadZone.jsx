import React, { useRef } from 'react';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  Loader2, 
  X,
  FileCheck,
  RotateCcw
} from 'lucide-react';

export default function UploadZone({ 
  selectedFile, 
  onSelectFile, 
  onClearFile, 
  onExtract, 
  isExtracting, 
  errorMessage,
  onLoadSample
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelectFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onSelectFile(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-7 mb-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs shadow-xs">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
            </span>
            Document Ingestion
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload an SEC filing or regulatory report in PDF format to parse headings and narrative text.
          </p>
        </div>

        {/* Load sample filing */}
        <button
          type="button"
          onClick={onLoadSample}
          disabled={isExtracting}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
          <span>Load sample filing (AMGN)</span>
        </button>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-7 sm:p-8 text-center cursor-pointer transition-all ${
          selectedFile
            ? 'border-blue-500 bg-blue-50/30'
            : 'border-slate-300 hover:border-blue-400 bg-slate-50/40 hover:bg-blue-50/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center justify-center gap-2.5">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
            {selectedFile ? (
              <FileCheck className="w-6 h-6 text-blue-600" />
            ) : (
              <Upload className="w-6 h-6 text-slate-400" />
            )}
          </div>

          {selectedFile ? (
            <div className="space-y-1 max-w-md mx-auto">
              <p className="text-sm font-semibold text-slate-900 truncate px-2">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500">
                {(selectedFile.size / 1024).toFixed(1)} KB &bull; Ready for extraction
              </p>
              <p className="text-xs text-blue-600 font-medium pt-1">
                Click to choose a different filing
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Click to upload</span> or drag and drop filing
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                PDF document up to 25 MB &bull; High precision PyMuPDF parsing
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Control Action Bar */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Target Schema:</span>
          <span className="font-mono text-[11px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-medium">
            Array&lt;&#123; heading, text &#125;&gt;
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {selectedFile && (
            <button
              type="button"
              onClick={onClearFile}
              disabled={isExtracting}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
              <span>Remove</span>
            </button>
          )}

          <button
            type="button"
            onClick={onExtract}
            disabled={!selectedFile || isExtracting}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
              !selectedFile || isExtracting
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:shadow-sm active:scale-[0.99]'
            }`}
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-200" />
                <span>Extracting sections...</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-blue-100" />
                <span>Extract to JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message Box */}
      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold block text-rose-800">Extraction Error</span>
            {errorMessage}
          </div>
        </div>
      )}
    </div>
  );
}

