/**
 * ProductInsights.jsx - Product Breakdown & Rating Mismatch Component (Bonus Features 1, 2, 4)
 * 
 * Displays:
 * 1. Agreement Percentage between star ratings and AI sentiment
 * 2. Rating Mismatches (e.g. R008 with 5 stars and negative complaint)
 * 3. Product-wise sentiment breakdown and average ratings
 */

import React, { useState } from 'react';
import { Package, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Star } from 'lucide-react';

export const ProductInsights = ({ productBreakdown = [], ratingMismatches = {} }) => {
  const [showMismatches, setShowMismatches] = useState(false);
  const mismatches = ratingMismatches?.reviews || [];
  const agreementPct = ratingMismatches?.agreementPct ?? 100;

  if (productBreakdown.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Top Banner: Rating Agreement Percentage & Mismatches */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-gray-900 text-sm">Rating & Sentiment Agreement</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {agreementPct}% Agreement
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Compares customer numerical star ratings (1-5) against AI-classified sentiment.
          </p>
        </div>

        {mismatches.length > 0 && (
          <button
            onClick={() => setShowMismatches(!showMismatches)}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{mismatches.length} Rating Mismatches Detected</span>
            {showMismatches ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Expandable Mismatch Details */}
      {showMismatches && mismatches.length > 0 && (
        <div className="bg-rose-50/50 rounded-xl p-4 border border-rose-200 space-y-2.5">
          <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Flagged Reviews with Rating vs Sentiment Contradictions:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mismatches.map((m) => (
              <div key={m.reviewId} className="bg-white p-3 rounded-lg border border-rose-200 text-xs shadow-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 font-semibold">
                  <span className="font-mono text-gray-900">{m.reviewId} - {m.product}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 flex items-center">
                      <Star className="w-3 h-3 fill-amber-400 mr-0.5" /> {m.rating}★
                    </span>
                    <span className="text-rose-700 font-bold capitalize">[{m.sentiment}]</span>
                  </div>
                </div>
                <p className="mt-1.5 text-gray-600 italic">"{m.reviewText}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product-Wise Sentiment Grid */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2 pb-3 border-b border-gray-100 font-semibold text-sm text-gray-800">
          <Package className="w-4 h-4 text-emerald-600" />
          <span>Product-Wise Breakdown</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          {productBreakdown.map((p) => (
            <div key={p.product} className="bg-gray-50/80 rounded-lg p-3.5 border border-gray-200 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xs text-gray-900 line-clamp-1" title={p.product}>
                  {p.product}
                </h4>
                <div className="flex items-center space-x-1 text-[11px] text-gray-500 mt-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                  <span>{p.avgRating ? `${p.avgRating} / 5` : 'N/A'}</span>
                  <span className="text-gray-300">•</span>
                  <span>{p.total} reviews</span>
                </div>
              </div>

              {/* Sentiment pills */}
              <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-gray-200/80 text-[10px]">
                <span className="text-emerald-700 font-bold">{p.positive} pos</span>
                <span className="text-amber-700 font-medium">{p.neutral} neu</span>
                <span className="text-rose-700 font-bold">{p.negative} neg</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductInsights;
