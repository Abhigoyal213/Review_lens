/**
 * ReviewTable.jsx - Interactive Customer Review Table
 * 
 * Displays:
 * 1. Review ID (with Duplicate / Empty / Prompt Injection badges)
 * 2. Product Name
 * 3. Star Rating (Visual stars or Unknown rating badge)
 * 4. Sentiment (Color-coded: Green = Positive, Amber = Neutral, Red = Negative)
 * 5. Topics (Badges)
 * 6. English Summary
 * 7. Reply Status & "Generate Reply" Button
 */

import React, { useState } from 'react';
import { Star, MessageSquare, AlertCircle, CheckCircle, HelpCircle, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { generateSuggestedReply } from '../services/api';

export const ReviewTable = ({ reviews = [], onReplyGenerated }) => {
  const [generatingId, setGeneratingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleGenerateReply = async (review) => {
    try {
      setGeneratingId(review._id);
      const res = await generateSuggestedReply(review._id);
      if (onReplyGenerated) onReplyGenerated(review._id, res.suggestedReply);
    } catch (err) {
      alert(`Failed to generate reply: ${err.response?.data?.error || err.message}`);
    } finally {
      setGeneratingId(null);
    }
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderStars = (rating, rawRating) => {
    if (rating === null || rating === undefined) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
          {rawRating ? `"${rawRating}"` : 'Unknown'}
        </span>
      );
    }

    return (
      <div className="flex items-center space-x-0.5 text-amber-400">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
            }`}
          />
        ))}
        <span className="text-xs font-semibold text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  const renderSentimentBadge = (sentiment, status) => {
    if (status === 'skipped') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
          Skipped
        </span>
      );
    }

    if (status === 'analysis_failed') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          Failed
        </span>
      );
    }

    if (sentiment === 'positive') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle className="w-3 h-3" /> Positive
        </span>
      );
    }

    if (sentiment === 'neutral') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <HelpCircle className="w-3 h-3" /> Neutral
        </span>
      );
    }

    if (sentiment === 'negative') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3 h-3" /> Negative
        </span>
      );
    }

    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        Pending
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          Review Analysis Table
        </h3>
        <span className="text-xs text-gray-500">
          Showing {reviews.length} total entries
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-200">
            <tr>
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Rating</th>
              <th className="py-3 px-4">Sentiment</th>
              <th className="py-3 px-4">Topics</th>
              <th className="py-3 px-4 min-w-[280px]">Summary & Text</th>
              <th className="py-3 px-4 min-w-[160px]">Reply Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-400 italic">
                  No reviews match the selected filter criteria.
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r._id || r.reviewId} className="hover:bg-gray-50/60 transition-colors">
                  {/* Review ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900 align-top">
                    <div>{r.reviewId}</div>
                    {r.isDuplicate && (
                      <span className="mt-1 inline-block px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded font-sans border border-blue-200">
                        Duplicate
                      </span>
                    )}
                    {r.isEmpty && (
                      <span className="mt-1 inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded font-sans">
                        Blank
                      </span>
                    )}
                  </td>

                  {/* Product */}
                  <td className="py-3.5 px-4 font-medium text-gray-900 align-top">
                    {r.product}
                    <div className="text-[10px] text-gray-400 font-normal">{r.date}</div>
                  </td>

                  {/* Rating */}
                  <td className="py-3.5 px-4 align-top whitespace-nowrap">
                    {renderStars(r.rating, r.rawRating)}
                  </td>

                  {/* Sentiment */}
                  <td className="py-3.5 px-4 align-top whitespace-nowrap">
                    {renderSentimentBadge(r.sentiment, r.analysisStatus)}
                  </td>

                  {/* Topics */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex flex-wrap gap-1 max-w-[140px]">
                      {r.topics && r.topics.length > 0 ? (
                        r.topics.map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-medium capitalize"
                          >
                            {t.replace('_', ' ')}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>

                  {/* Summary & Raw Text */}
                  <td className="py-3.5 px-4 align-top">
                    {r.summary ? (
                      <div className="font-medium text-gray-900 mb-1">{r.summary}</div>
                    ) : (
                      <div className="italic text-gray-400 mb-1">Pending AI summary</div>
                    )}
                    <div className="text-gray-500 line-clamp-2 text-[11px] bg-gray-50 p-1.5 rounded border border-gray-100">
                      "{r.reviewText || r.originalText || '(empty review)'}"
                    </div>
                  </td>

                  {/* Suggested Reply / Action */}
                  <td className="py-3.5 px-4 align-top">
                    {r.needsReply ? (
                      <div className="space-y-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          Needs Reply
                        </span>

                        {r.suggestedReply ? (
                          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900">
                            <p className="line-clamp-3 italic">"{r.suggestedReply}"</p>
                            <button
                              onClick={() => copyToClipboard(r._id, r.suggestedReply)}
                              className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-700 hover:text-emerald-800 font-semibold"
                            >
                              {copiedId === r._id ? (
                                <>
                                  <Check className="w-3 h-3" /> Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" /> Copy Reply
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGenerateReply(r)}
                            disabled={generatingId === r._id}
                            className="w-full flex items-center justify-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium shadow-sm transition-colors disabled:opacity-50"
                          >
                            {generatingId === r._id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" /> Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3" /> Generate Reply
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-[11px]">No Reply Needed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewTable;
