/**
 * FilterBar.jsx - Interactive Dashboard Filters Component
 * 
 * Allows store owners to filter the reviews by:
 * 1. Product (dynamically populated from review data)
 * 2. Sentiment (All, Positive, Neutral, Negative)
 * 3. Topic (Quality, Delivery, Price, Packaging, Support, Size/Fit, Other)
 * 4. Search query (by review ID, product name, or review text)
 */

import React from 'react';
import { Filter, Search, RotateCcw } from 'lucide-react';

export const FilterBar = ({
  products = [],
  selectedProduct,
  onProductChange,
  selectedSentiment,
  onSentimentChange,
  selectedTopic,
  onTopicChange,
  searchQuery,
  onSearchChange,
  onResetFilters,
  totalMatching = 0,
}) => {
  const topicsList = [
    { value: '', label: 'All Topics' },
    { value: 'quality', label: 'Quality' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'price', label: 'Price' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'support', label: 'Support' },
    { value: 'size_fit', label: 'Size & Fit' },
    { value: 'other', label: 'Other' },
  ];

  const sentimentsList = [
    { value: '', label: 'All Sentiments' },
    { value: 'positive', label: 'Positive' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'negative', label: 'Negative' },
  ];

  const hasActiveFilters = Boolean(
    selectedProduct || selectedSentiment || selectedTopic || searchQuery
  );

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center space-x-2 text-gray-800 font-semibold text-sm">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filter Customer Reviews</span>
          <span className="text-xs font-normal text-gray-500">
            ({totalMatching} {totalMatching === 1 ? 'review' : 'reviews'} matching)
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center space-x-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search text, ID, or product..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-gray-800"
          />
        </div>

        {/* Product Filter */}
        <div>
          <select
            value={selectedProduct}
            onChange={(e) => onProductChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-gray-800"
          >
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Sentiment Filter */}
        <div>
          <select
            value={selectedSentiment}
            onChange={(e) => onSentimentChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-gray-800"
          >
            {sentimentsList.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Topic Filter */}
        <div>
          <select
            value={selectedTopic}
            onChange={(e) => onTopicChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-gray-800"
          >
            {topicsList.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
