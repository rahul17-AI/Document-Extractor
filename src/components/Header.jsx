import React from 'react';
import { FileText, LogOut } from 'lucide-react';

export default function Header({ user, onLogout }) {
  return (
    <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-semibold text-sm shadow-xs ring-1 ring-slate-800">
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold text-slate-900 tracking-tight">
              Comply
            </span>
            <span className="text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/80 px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              Filing Intelligence
            </span>
          </div>
        </div>

        {/* User & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-700 bg-slate-100/90 px-3 py-1 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium font-mono text-[11px]">{user?.email}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

