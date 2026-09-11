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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        {/* Brand mark */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs ring-1 ring-slate-800">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Comply
            </span>
            <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              Portal
            </span>
          </div>
        </div>

        <div className="bg-white py-8 px-6 sm:px-8 shadow-sm rounded-2xl border border-slate-200/90">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Sign in to Workspace
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Access SEC and regulatory filing extraction with structured JSON tools.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="analyst@company.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="••••••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors shadow-xs active:scale-[0.99]"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4 text-blue-100" />
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Local PyMuPDF Layout Engine &bull; Private Processing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
