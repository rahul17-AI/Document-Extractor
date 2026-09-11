import React, { useState } from 'react';
import Header from './components/Header.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import UploadZone from './components/UploadZone.jsx';
import DocumentMetrics from './components/DocumentMetrics.jsx';
import SectionNav from './components/SectionNav.jsx';
import SectionCard from './components/SectionCard.jsx';
import JsonModal from './components/JsonModal.jsx';
import JsonViewer from './components/JsonViewer.jsx';
import { 
  Search, 
  Code2, 
  Download, 
  Copy, 
  Check, 
  Filter, 
  FileText,
  FileSpreadsheet,
  FileJson,
  BookOpen
} from 'lucide-react';

export default function App() {
  // Authentication State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('comply_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Extraction State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionIndex, setActiveSectionIndex] = useState(null);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [allCopied, setAllCopied] = useState(false);
  const [viewMode, setViewMode] = useState('json'); // 'json' (default requested) or 'document'

  // Authentication Handlers
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('comply_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('comply_user');
  };

  // File Selection Handler
  const handleSelectFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMessage('Unsupported file format. Please upload a valid PDF document.');
      return;
    }
    setErrorMessage('');
    setSelectedFile(file);
    setExtractionResult(null);
    setActiveSectionIndex(null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setExtractionResult(null);
    setErrorMessage('');
    setActiveSectionIndex(null);
  };

  // Instant Sample Document Loader
  const handleLoadSample = async () => {
    try {
      setErrorMessage('');
      const response = await fetch('/sample_amgn_filing.pdf');
      if (!response.ok) {
        throw new Error('Sample filing could not be retrieved from server.');
      }
      const blob = await response.blob();
      const sampleFile = new File([blob], 'AMGN-135003565.pdf', { type: 'application/pdf' });
      setSelectedFile(sampleFile);
      setExtractionResult(null);
    } catch (err) {
      setErrorMessage(`Failed to load sample: ${err.message}`);
    }
  };

  // Run Extraction via API
  const API_URL = import.meta.env.VITE_API_URL;
  const handleExtract = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_URL}/extract`, {
      method: 'POST',
      body: formData,
      });

      if (!response.ok) {
        let errorDetail = 'Extraction failed. Please try again.';
        try {
          const errData = await response.json();
          if (errData.detail) {
            errorDetail = errData.detail;
          }
        } catch {
          // fallback if not json
        }
        throw new Error(errorDetail);
      }

      const data = await response.json();
      setExtractionResult(data);
    } catch (err) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setErrorMessage('Unable to reach the extraction service. Please verify that the Express development server is running on port 3000, then click "Extract to JSON" again.');
      } else {
        setErrorMessage(err.message || 'An error occurred while parsing the document.');
      }
    } finally {
      setIsExtracting(false);
    }
  };

  // Jump to Section
  const handleSelectSection = (index) => {
    setActiveSectionIndex(index);
    const element = document.getElementById(`section-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Copy All Sections
  const handleCopyAll = () => {
    if (!extractionResult?.sections) return;
    const fullText = extractionResult.sections
      .map((s, idx) => `### ${idx + 1}. ${s.heading}\n\n${s.text || '[No body text]'}`)
      .join('\n\n---\n\n');

    navigator.clipboard.writeText(fullText);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  // Download Markdown Report
  const handleDownloadMarkdown = () => {
    if (!extractionResult?.sections) return;
    const mdLines = [
      `# Regulatory Filing Extraction Report`,
      `**Source Document:** ${extractionResult.filename || 'Filing.pdf'}`,
      `**Generated On:** ${new Date().toUTCString()}`,
      `**Total Extracted Sections:** ${extractionResult.sections.length}`,
      `\n---\n`,
    ];

    extractionResult.sections.forEach((s, idx) => {
      mdLines.push(`## ${idx + 1}. ${s.heading}\n`);
      mdLines.push(s.text ? s.text : '_[Standalone Heading / Exhibit]_');
      mdLines.push(`\n---\n`);
    });

    const blob = new Blob([mdLines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(extractionResult.filename || 'filing').replace('.pdf', '')}_extracted.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // If user not authenticated, show Login Screen
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Filter sections by search query
  const filteredSections = extractionResult?.sections?.filter((section) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const headingMatch = section.heading?.toLowerCase().includes(query);
    const textMatch = section.text?.toLowerCase().includes(query);
    return headingMatch || textMatch;
  }) || [];

  return (
    <div className="min-h-screen bg-[#F0F6FA] text-[#2D1F18] flex flex-col">
      {/* Top Navigation */}
      <Header user={user} onLogout={handleLogout} />

      {/* Main Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Upload Zone */}
        <UploadZone
          selectedFile={selectedFile}
          onSelectFile={handleSelectFile}
          onClearFile={handleClearFile}
          onExtract={handleExtract}
          isExtracting={isExtracting}
          errorMessage={errorMessage}
          onLoadSample={handleLoadSample}
        />

        {/* Extraction Results Presentation */}
        {extractionResult && (
          <div className="space-y-6">
            {/* KPI Statistics */}
            <DocumentMetrics
              filename={extractionResult.filename}
              sections={extractionResult.sections}
            />

            {/* View Mode Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-sky-200/80 pb-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setViewMode('json')}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'json'
                      ? 'bg-[#6C4A3A] text-white shadow-xs'
                      : 'text-[#6C4A3A] hover:text-[#2D1F18] hover:bg-sky-100/60'
                  }`}
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>JSON Output</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    viewMode === 'json' ? 'bg-[#55382B] text-sky-100' : 'bg-sky-100 text-sky-800'
                  }`}>
                    {extractionResult.sections?.length || 0}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('document')}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'document'
                      ? 'bg-[#6C4A3A] text-white shadow-xs'
                      : 'text-[#6C4A3A] hover:text-[#2D1F18] hover:bg-sky-100/60'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Document View</span>
                </button>
              </div>

              <div className="text-xs text-sky-800/80 font-mono hidden sm:block bg-sky-50 border border-sky-200/70 px-2.5 py-1 rounded-full text-[11px]">
                schema: array&lt;&#123; heading, text &#125;&gt;
              </div>
            </div>

            {/* View Mode Content */}
            {viewMode === 'json' ? (
              <JsonViewer data={extractionResult} />
            ) : (
              <>
                {/* Results Filter & Action Bar */}
                <div className="bg-white border border-sky-100 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
                  {/* Search Bar */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-3.5 h-3.5 text-sky-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search heading or narrative text..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#E0D4C9] text-xs text-[#2D1F18] placeholder-[#9E877A] focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors bg-white"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8C7060] hover:text-[#2D1F18]"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleCopyAll}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#6C4A3A] hover:text-[#2D1F18] bg-white hover:bg-sky-50 border border-sky-200 transition-colors cursor-pointer shadow-2xs"
                      title="Copy full document text"
                    >
                      {allCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#8C6E5E]" />}
                      <span>{allCopied ? 'Copied' : 'Copy All'}</span>
                    </button>

                    <button
                      onClick={handleDownloadMarkdown}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#6C4A3A] hover:text-[#2D1F18] bg-white hover:bg-sky-50 border border-sky-200 transition-colors cursor-pointer shadow-2xs"
                      title="Download Markdown file"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#8C6E5E]" />
                      <span>Markdown</span>
                    </button>

                    <button
                      onClick={() => setShowJsonModal(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#6C4A3A] hover:bg-[#5A3C2E] transition-colors cursor-pointer shadow-xs"
                      title="Inspect JSON format"
                    >
                      <Code2 className="w-3.5 h-3.5 text-sky-100" />
                      <span>JSON Modal</span>
                    </button>
                  </div>
                </div>

                {/* Content Layout: Outline Sidebar + Section Cards Stream */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Sticky Sidebar: Table of Contents */}
                  <div className="hidden lg:block lg:col-span-4 sticky top-24">
                    <SectionNav
                      sections={extractionResult.sections}
                      activeIndex={activeSectionIndex}
                      onSelectSection={handleSelectSection}
                    />
                  </div>

                  {/* Main Content Stream */}
                  <div className="lg:col-span-8 space-y-4">
                    {filteredSections.length === 0 ? (
                      <div className="bg-white border border-sky-100 rounded-2xl p-8 text-center text-[#7A5E50] text-xs shadow-xs">
                        <Filter className="w-6 h-6 mx-auto text-sky-600 mb-2" />
                        <p className="font-bold text-[#2D1F18]">No matching sections found</p>
                        <p className="mt-1 text-[#8C7060]">
                          Try adjusting your search keyword "{searchQuery}".
                        </p>
                      </div>
                    ) : (
                      filteredSections.map((section, idx) => {
                        const originalIdx = extractionResult.sections.findIndex(
                          s => s.heading === section.heading && s.text === section.text
                        );
                        const indexToUse = originalIdx !== -1 ? originalIdx : idx;

                        return (
                          <SectionCard
                            key={indexToUse}
                            section={section}
                            index={indexToUse}
                            isHighlighted={activeSectionIndex === indexToUse}
                          />
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Structured Output JSON Modal */}
      <JsonModal
        isOpen={showJsonModal}
        onClose={() => setShowJsonModal(false)}
        data={extractionResult}
      />

      {/* Clean Footer */}
      <footer className="mt-auto border-t border-sky-100 py-6 text-center text-xs text-[#8C7060] bg-white/80">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Comply &bull; Regulatory Filing Structure &amp; Extraction</span>
          <span className="text-sky-700 font-medium">Local PyMuPDF Layout Engine &bull; Customer Workspace</span>
        </div>
      </footer>
    </div>
  );
}

