/**
 * App.jsx - Main ReviewLens Application Root
 * 
 * Orchestrates the full SaaS dashboard:
 * - Summary metrics (total, positive %, neutral %, negative %, needs reply)
 * - Visual sentiment distribution chart (Recharts)
 * - File upload and batch AI analysis triggers
 * - Top customer insights (complaints & praises)
 * - Product breakdown & rating mismatch detection (Bonus features)
 * - Interactive multi-dimensional review table with search and filters
 * - On-demand customer support reply generation
 */

import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import UploadCard from './components/UploadCard';
import SummaryCards from './components/SummaryCards';
import InsightCards from './components/InsightCards';
import ProductInsights from './components/ProductInsights';
import FilterBar from './components/FilterBar';
import ReviewTable from './components/ReviewTable';
import Charts from './components/Charts';
import { fetchDashboardStats, fetchReviews, checkHealth } from './services/api';
import { Zap, ShieldAlert } from 'lucide-react';

export function App() {
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Filters state
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch summary metrics
  const loadStats = async () => {
    try {
      const data = await fetchDashboardStats();
      if (data?.stats) setStats(data.stats);
    } catch (err) {
      console.warn('Could not load stats:', err.message);
    }
  };

  // Fetch reviews from API
  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const filters = {};
      if (selectedProduct) filters.product = selectedProduct;
      if (selectedSentiment) filters.sentiment = selectedSentiment;
      if (selectedTopic) filters.topic = selectedTopic;

      const data = await fetchReviews(filters);
      if (data?.data) {
        setReviews(data.data);
      }
    } catch (err) {
      console.warn('Could not load reviews:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    checkHealth()
      .then(() => setIsOnline(true))
      .catch(() => setIsOnline(false));

    loadStats();
    loadReviews();
  }, [selectedProduct, selectedSentiment, selectedTopic]);

  // Extract unique product list for the filter dropdown
  const productOptions = useMemo(() => {
    const set = new Set();
    reviews.forEach((r) => {
      if (r.product) set.add(r.product);
    });
    return Array.from(set).sort();
  }, [reviews]);

  // Client-side text search filtering
  const filteredReviews = useMemo(() => {
    if (!searchQuery.trim()) return reviews;

    const query = searchQuery.toLowerCase();
    return reviews.filter(
      (r) =>
        r.reviewId?.toLowerCase().includes(query) ||
        r.product?.toLowerCase().includes(query) ||
        r.reviewText?.toLowerCase().includes(query) ||
        r.summary?.toLowerCase().includes(query)
    );
  }, [reviews, searchQuery]);

  const handleResetFilters = () => {
    setSelectedProduct('');
    setSelectedSentiment('');
    setSelectedTopic('');
    setSearchQuery('');
  };

  const handleReplyGenerated = (reviewId, newReply) => {
    setReviews((prev) =>
      prev.map((r) => (r._id === reviewId ? { ...r, suggestedReply: newReply } : r))
    );
  };

  const handleDataRefresh = () => {
    loadStats();
    loadReviews();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* SaaS Navigation */}
      <Header isOnline={isOnline} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* CSV Upload & Batch Trigger Card */}
        <UploadCard
          onUploadSuccess={handleDataRefresh}
          onAnalyzeComplete={handleDataRefresh}
        />

        {/* Executive Summary Cards */}
        <section aria-label="Summary Statistics">
          <SummaryCards stats={stats} />
        </section>

        {/* Middle Section: Top Insights & Visual Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start" aria-label="Insights & Charts">
          <div className="lg:col-span-2">
            <InsightCards
              topComplaints={stats?.topComplaints || []}
              topPraises={stats?.topPraises || []}
            />
          </div>
          <div className="lg:col-span-1">
            <Charts stats={stats} />
          </div>
        </section>

        {/* Product Breakdown & Rating Mismatches (Bonus) */}
        <section aria-label="Product Insights">
          <ProductInsights
            productBreakdown={stats?.productBreakdown || []}
            ratingMismatches={stats?.ratingMismatches || {}}
          />
        </section>

        {/* Filter Bar */}
        <section aria-label="Review Filters">
          <FilterBar
            products={productOptions}
            selectedProduct={selectedProduct}
            onProductChange={setSelectedProduct}
            selectedSentiment={selectedSentiment}
            onSentimentChange={setSelectedSentiment}
            selectedTopic={selectedTopic}
            onTopicChange={setSelectedTopic}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onResetFilters={handleResetFilters}
            totalMatching={filteredReviews.length}
          />
        </section>

        {/* Review Table */}
        <section aria-label="Review Table">
          <ReviewTable
            reviews={filteredReviews}
            onReplyGenerated={handleReplyGenerated}
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
