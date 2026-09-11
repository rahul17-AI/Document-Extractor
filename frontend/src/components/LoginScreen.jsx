import React, { useState } from 'react';
import { FileText, ArrowRight, Shield } from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('analyst@compliance.corp');
  const [password, setPassword] = useState('passcode2026');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    onLogin({
      email: email.trim(),
      name: 'Analyst',
      organization: 'Regulatory Division',
    });
  };

  return (
    <div className="min-h-screen bg-[#F0F6FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#2D1F18]">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        {/* Brand mark */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#6C4A3A] text-white flex items-center justify-center shadow-xs">
            <FileText className="w-5 h-5 text-sky-100" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#2D1F18]">
              Comply
            </span>
            <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
              Portal
            </span>
          </div>
        </div>

        <div className="bg-white py-8 px-6 sm:px-8 shadow-sm rounded-2xl border border-sky-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#2D1F18] tracking-tight">
              Sign in to Workspace
            </h2>
            <p className="text-xs text-[#7A5E50] mt-1">
              Access SEC and regulatory filing extraction with structured JSON tools.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-[#5C4336] mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-[#E0D4C9] bg-white px-3 py-2 text-sm text-[#2D1F18] placeholder-[#9E877A] focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
                placeholder="analyst@company.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C4336] mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-[#E0D4C9] bg-white px-3 py-2 text-sm text-[#2D1F18] placeholder-[#9E877A] focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
                placeholder="••••••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-[#6C4A3A] hover:bg-[#5A3C2E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 cursor-pointer transition-colors shadow-xs"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4 text-sky-100" />
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-[#F2ECE6] flex items-center justify-center gap-1.5 text-xs text-[#8C7060]">
            <Shield className="w-3.5 h-3.5 text-sky-600" />
            <span>Local PyMuPDF Layout Engine &bull; Private Processing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
