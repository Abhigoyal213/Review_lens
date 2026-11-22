/**
 * InsightCards.jsx - Top Complaints and Top Praises Component
 * 
 * Displays:
 * 1. Top 3 Complaints (Aggregated from negative reviews by topic)
 * 2. Top 3 Praises (Aggregated from positive reviews by topic)
 */

import React from 'react';
import { ThumbsDown, ThumbsUp, Tag } from 'lucide-react';

export const InsightCards = ({ topComplaints = [], topPraises = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Top 3 Complaints */}
      <div className="bg-white rounded-xl p-6 border border-rose-100 shadow-sm">
        <div className="flex items-center space-x-2 text-rose-700 pb-3 border-b border-rose-50">
          <ThumbsDown className="w-5 h-5 text-rose-500" />
          <h3 className="font-bold text-sm tracking-wide uppercase">Top 3 Customer Complaints</h3>
        </div>
        <div className="mt-4 space-y-3">
          {topComplaints.length === 0 ? (
            <p className="text-xs text-gray-400 py-3 italic">No complaints detected yet.</p>
          ) : (
            topComplaints.map((item, index) => (
              <div key={item.topic} className="flex items-center justify-between p-2.5 bg-rose-50/50 rounded-lg border border-rose-100/60">
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold capitalize text-gray-800">{item.topic.replace('_', ' ')}</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
                  {item.count} {item.count === 1 ? 'issue' : 'issues'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top 3 Praises */}
      <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm">
        <div className="flex items-center space-x-2 text-emerald-700 pb-3 border-b border-emerald-50">
          <ThumbsUp className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-sm tracking-wide uppercase">Top 3 Customer Praises</h3>
        </div>
        <div className="mt-4 space-y-3">
          {topPraises.length === 0 ? (
            <p className="text-xs text-gray-400 py-3 italic">No positive praise detected yet.</p>
          ) : (
            topPraises.map((item, index) => (
              <div key={item.topic} className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100/60">
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold capitalize text-gray-800">{item.topic.replace('_', ' ')}</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                  {item.count} {item.count === 1 ? 'mention' : 'mentions'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightCards;
