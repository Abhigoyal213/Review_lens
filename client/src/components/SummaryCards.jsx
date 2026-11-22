/**
 * SummaryCards.jsx - Executive SaaS Metric Summary Cards
 * 
 * Displays:
 * 1. Total Reviews Analyzed
 * 2. Positive Sentiment % (Green)
 * 3. Neutral Sentiment % (Yellow/Amber)
 * 4. Negative Sentiment % (Red)
 * 5. Reviews Needing Action/Reply
 */

import React from 'react';
import { CheckCircle, AlertCircle, HelpCircle, MessageSquareWarning, BarChart3 } from 'lucide-react';

export const SummaryCards = ({ stats }) => {
  const sentiment = stats?.sentiment || { positivePct: 0, neutralPct: 0, negativePct: 0 };
  const totalAnalyzed = stats?.analyzedReviews || 0;
  const needsReply = stats?.needsReply || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Analyzed */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-gray-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Analyzed Reviews</span>
          <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
            <BarChart3 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-gray-900">{totalAnalyzed}</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats?.totalReviews ? `Out of ${stats.totalReviews} total rows` : 'Ready for analysis'}
          </div>
        </div>
      </div>

      {/* 2. Positive Sentiment (Green) */}
      <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-emerald-700">
          <span className="text-xs font-semibold uppercase tracking-wider">Positive</span>
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-emerald-600">{sentiment.positivePct}%</div>
          <div className="w-full bg-emerald-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${sentiment.positivePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Neutral Sentiment (Yellow/Orange) */}
      <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-amber-700">
          <span className="text-xs font-semibold uppercase tracking-wider">Neutral</span>
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
            <HelpCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-amber-600">{sentiment.neutralPct}%</div>
          <div className="w-full bg-amber-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${sentiment.neutralPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Negative Sentiment (Red) */}
      <div className="bg-white rounded-xl p-5 border border-rose-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-rose-700">
          <span className="text-xs font-semibold uppercase tracking-wider">Negative</span>
          <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-rose-600">{sentiment.negativePct}%</div>
          <div className="w-full bg-rose-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${sentiment.negativePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5. Needs Reply */}
      <div className="bg-white rounded-xl p-5 border border-indigo-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-indigo-700">
          <span className="text-xs font-semibold uppercase tracking-wider">Needs Reply</span>
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <MessageSquareWarning className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-indigo-600">{needsReply}</div>
          <div className="text-xs text-gray-500 mt-1">Pending customer replies</div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
