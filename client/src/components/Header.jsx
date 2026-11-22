/**
 * Header.jsx - SaaS Top Navigation Bar
 * 
 * Displays the ReviewLens logo, brief subtitle, and live backend connection badge.
 */

import React from 'react';
import { Eye, ShieldCheck, Database } from 'lucide-react';

export const Header = ({ isOnline = true }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-sm flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-900 tracking-tight">ReviewLens</span>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-gray-500">Automated Customer Review Intelligence</p>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center space-x-4 text-xs">
            <div className="hidden sm:flex items-center space-x-1.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Prompt Injection Protected</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
              <span className="font-medium text-gray-700">{isOnline ? 'System Ready' : 'Connecting...'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
