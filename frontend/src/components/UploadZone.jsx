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
    <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6 sm:p-7 mb-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-[#2D1F18] tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#6C4A3A] text-white flex items-center justify-center text-xs">
              <FileText className="w-3.5 h-3.5 text-sky-100" />
            </span>
            Document Ingestion
          </h2>
          <p className="text-xs text-[#6B5143] mt-1">
            Upload an SEC filing or regulatory report in PDF format to parse headings and narrative text.
          </p>
        </div>

        {/* Load sample filing */}
        <button
          type="button"
          onClick={onLoadSample}
          disabled={isExtracting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 hover:text-sky-950 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
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
            ? 'border-[#6C4A3A] bg-[#FAF5F2]'
            : 'border-sky-200 hover:border-sky-400 bg-sky-50/40 hover:bg-sky-50/80'
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
          <div className="w-12 h-12 rounded-xl bg-white border border-sky-100 flex items-center justify-center shadow-xs">
            {selectedFile ? (
              <FileCheck className="w-6 h-6 text-[#6C4A3A]" />
            ) : (
              <Upload className="w-6 h-6 text-sky-600" />
            )}
          </div>

          {selectedFile ? (
            <div className="space-y-1 max-w-md mx-auto">
              <p className="text-sm font-semibold text-[#2D1F18] truncate px-2">
                {selectedFile.name}
              </p>
              <p className="text-xs text-[#7A5E50]">
                {(selectedFile.size / 1024).toFixed(1)} KB &bull; Ready for extraction
              </p>
              <p className="text-xs text-sky-700 font-medium pt-1">
                Click to choose a different filing
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-[#3E2B22]">
                <span className="font-semibold text-[#2D1F18]">Click to upload</span> or drag and drop filing
              </p>
              <p className="text-xs text-[#8C7060] mt-0.5">
                PDF document up to 25 MB &bull; High precision PyMuPDF parsing
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Control Action Bar */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#F2ECE6]">
        <div className="text-xs text-[#6B5143] flex items-center gap-2">
          <span>Target Schema:</span>
          <span className="font-mono text-[11px] bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded font-medium">
            Array&lt;&#123; heading, text &#125;&gt;
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {selectedFile && (
            <button
              type="button"
              onClick={onClearFile}
              disabled={isExtracting}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-[#7A5E50] hover:text-[#2D1F18] hover:bg-[#F7F2EE] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-[#8C7060]" />
              <span>Remove</span>
            </button>
          )}

          <button
            type="button"
            onClick={onExtract}
            disabled={!selectedFile || isExtracting}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
              !selectedFile || isExtracting
                ? 'bg-[#F2ECE6] text-[#A0887A] cursor-not-allowed border border-[#E6DAD0]'
                : 'bg-[#6C4A3A] hover:bg-[#5A3C2E] text-white cursor-pointer hover:shadow-sm'
            }`}
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-200" />
                <span>Extracting sections...</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-sky-100" />
                <span>Extract to JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message Box */}
      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold block text-red-800">Extraction Error</span>
            {errorMessage}
          </div>
        </div>
      )}
    </div>
  );
}

