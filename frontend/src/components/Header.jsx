import React from 'react';
import { FileText, LogOut, Sparkles } from 'lucide-react';

export default function Header({ user, onLogout }) {
  return (
    <header className="border-b border-sky-100 bg-white/95 backdrop-blur-xs sticky top-0 z-30 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#6C4A3A] text-white flex items-center justify-center font-semibold text-sm shadow-xs">
            <FileText className="w-4 h-4 text-sky-100" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold text-[#2D1F18] tracking-tight">
              Comply
            </span>
            <span className="text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
              Filing Intelligence
            </span>
          </div>
        </div>

        {/* User & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#5C4336] bg-[#F7F2EE] px-3 py-1 rounded-full border border-[#E6DAD0]">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[#6C4A3A] hover:text-[#2D1F18] bg-white hover:bg-[#F7F2EE] border border-[#E6DAD0] transition-colors cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5 text-[#8C6E5E]" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

