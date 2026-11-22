/**
 * App.jsx - Main ReviewLens Application Root
 * 
 * Orchestrates the dashboard state:
 * - Summary metrics (total, positive %, neutral %, negative %, needs reply)
 * - File upload and batch AI analysis triggers
 * - Top customer insights (complaints & praises)
 * - AI usage statistics (API calls, cache hits, processing duration)
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadCard from './components/UploadCard';
import SummaryCards from './components/SummaryCards';
import InsightCards from './components/InsightCards';
import { fetchDashboardStats, checkHealth } from './services/api';
import { Cpu, Zap, Clock, ShieldAlert } from 'lucide-react';

export function App() {
  const [stats, setStats] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Load stats and verify backend connectivity on mount
  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      const data = await fetchDashboardStats();
      if (data?.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.warn('Backend not ready yet:', err.message);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    checkHealth()
      .then(() => setIsOnline(true))
      .catch(() => setIsOnline(false));

    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* SaaS Navigation */}
      <Header isOnline={isOnline} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Upload Card */}
        <UploadCard
          onUploadSuccess={() => loadStats()}
          onAnalyzeComplete={() => loadStats()}
        />

        {/* Executive Summary Cards */}
        <section aria-label="Summary Statistics">
          <SummaryCards stats={stats} />
        </section>

        {/* Top Insights: Complaints and Praises */}
        <section aria-label="Customer Insights">
          <InsightCards
            topComplaints={stats?.topComplaints || []}
            topPraises={stats?.topPraises || []}
          />
        </section>

        {/* AI Cache & Performance Bar */}
        {stats?.cache && (
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-wrap items-center justify-between text-xs text-gray-600 gap-3">
            <div className="flex items-center space-x-2 text-gray-800 font-semibold">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>AI Caching & Performance Metrics</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="bg-gray-100 px-2.5 py-1 rounded-md">
                <strong>{stats.cache.uniqueEntries}</strong> Unique Hashes Cached
              </span>
              <span className="bg-emerald-50 text-emerald-800 font-medium px-2.5 py-1 rounded-md border border-emerald-200">
                ⚡ <strong>{stats.cache.totalReusedHits}</strong> Reused Cache Hits (Saved API Calls)
              </span>
              {stats?.ratingMismatches?.count > 0 && (
                <span className="bg-rose-50 text-rose-800 font-medium px-2.5 py-1 rounded-md border border-rose-200 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <strong>{stats.ratingMismatches.count}</strong> Rating Mismatches Flagged
                </span>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        ReviewLens &copy; {new Date().getFullYear()} – CEDCOSS Technical Assessment
      </footer>
    </div>
  );
}

export default App;
