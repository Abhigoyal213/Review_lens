/**
 * UploadCard.jsx - CSV File Upload and Data Cleaning Status Component
 * 
 * Allows store owners to select or drop reviews.csv, shows upload progress,
 * and displays cleaning statistics (empty reviews skipped, duplicates caught, bad ratings sanitized).
 */

import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { uploadCSV, triggerBatchAnalysis } from '../services/api';

export const UploadCard = ({ onUploadSuccess, onAnalyzeComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadStats, setUploadStats] = useState(null);
  const [analysisStats, setAnalysisStats] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Please select a valid .csv file.');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setError(null);
      const res = await uploadCSV(selectedFile);
      setUploadStats(res.stats);
      if (onUploadSuccess) onUploadSuccess(res);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      const res = await triggerBatchAnalysis();
      setAnalysisStats(res.stats);
      if (onAnalyzeComplete) onAnalyzeComplete(res.stats);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-600" />
            Upload Product Reviews
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload customer review CSV to clean data and extract AI-powered sentiment & insights.
          </p>
        </div>

        {uploadStats && (
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Batches...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run AI Analysis (Batch 5)</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Upload Drop Zone / Input */}
      <div className="mt-4">
        <div className="border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-xl p-6 text-center bg-gray-50/50 hover:bg-emerald-50/30 transition-colors">
          <input
            type="file"
            id="csv-file-input"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 mb-3">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {selectedFile ? selectedFile.name : 'Click to select reviews.csv'}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Supports CSV with review_id, product, rating, date, review_text
            </span>
          </label>
        </div>

        {selectedFile && !uploadStats && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="inline-flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cleaning & Uploading...</span>
                </>
              ) : (
                <span>Upload & Clean Data</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Cleaning Stats Pills */}
      {uploadStats && (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-emerald-900">
            <div className="font-semibold text-emerald-700">Total Valid Rows</div>
            <div className="text-lg font-bold mt-0.5">{uploadStats.validReviews}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-blue-900">
            <div className="font-semibold text-blue-700">Duplicates Detected</div>
            <div className="text-lg font-bold mt-0.5">{uploadStats.duplicateReviews} (Cached)</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-amber-900">
            <div className="font-semibold text-amber-700">Ratings Sanitized</div>
            <div className="text-lg font-bold mt-0.5">{uploadStats.invalidOrMissingRatings}</div>
          </div>
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-gray-800">
            <div className="font-semibold text-gray-600">Empty Rows Skipped</div>
            <div className="text-lg font-bold mt-0.5">{uploadStats.emptyReviews}</div>
          </div>
        </div>
      )}

      {/* Analysis Batch Completion Alert */}
      {analysisStats && (
        <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Batch Analysis Complete:</strong> {analysisStats.successCount} reviews analyzed in {analysisStats.processingTimeSeconds}s ({analysisStats.apiCalls} API calls, {analysisStats.cacheHits} cache hits).
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadCard;
