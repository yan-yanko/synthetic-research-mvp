import React, { useMemo } from 'react';
import { FeedbackResponse, InvestorSummary } from '../types/feedback';
import { summarizeInvestorPanel } from '../utils/summarizeInvestorPanel';

interface InvestorSummaryPanelProps {
  feedback: FeedbackResponse[];
}

/**
 * Component to display an aggregated summary of all investor feedback
 */
export function InvestorSummaryPanel({ feedback }: InvestorSummaryPanelProps) {
  // Memoize the summary calculation to prevent recalculation on re-renders
  const summary = useMemo(() => {
    return summarizeInvestorPanel(feedback);
  }, [feedback]);

  if (!feedback || feedback.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-50 rounded-xl p-6 border mt-6 shadow-sm">
      {summary.topConcerns && summary.topConcerns.length > 0 && (
        <h2 className="text-xl font-bold text-red-600 mb-4">
          🔥 Top Concern: {summary.topConcerns[0]}
        </h2>
      )}
      <h3 className="text-xl font-semibold mb-3 flex items-center">
        <span className="mr-2">🧠</span> AI Panel Summary
      </h3>
      <p className="text-gray-700 mb-4">{summary.consensusStatement}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium text-gray-900 mb-2">Sentiments</h4>
          <div className="flex items-center mb-3">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-500 h-2.5 rounded-full" 
                style={{ 
                  width: `${Math.round(
                    (summary.sentimentSummary.positive / feedback.length) * 100
                  )}%` 
                }}
              ></div>
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {summary.sentimentSummary.positive}/{feedback.length}
            </span>
          </div>
          <ul className="space-y-1 text-sm">
            <li className="flex justify-between">
              <span className="text-green-600">Positive</span>
              <span>{summary.sentimentSummary.positive}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-yellow-600">Neutral</span>
              <span>{summary.sentimentSummary.neutral}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-red-600">Negative</span>
              <span>{summary.sentimentSummary.negative}</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium text-gray-900 mb-2">Top Strengths</h4>
          <ul className="space-y-2">
            {summary.topStrengths.map((strength, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium text-gray-900 mb-2">Top Concerns</h4>
          <ul className="space-y-2">
            {summary.topConcerns.map((concern, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="text-red-500 mr-2">⚠</span>
                <span>{concern}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-900">Investment Likelihood</h4>
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {summary.investmentLikelihood}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${
              summary.investmentLikelihood > 66 
                ? 'bg-green-500' 
                : summary.investmentLikelihood > 33 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
            }`} 
            style={{ width: `${summary.investmentLikelihood}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-medium text-gray-900 mb-2">Recommended Next Steps</h4>
        <ol className="list-decimal list-inside space-y-2">
          {summary.recommendedNextSteps.map((step, index) => (
            <li key={index} className="text-sm text-gray-700">{step}</li>
          ))}
        </ol>
      </div>

      {/* VC-style memo summary */}
      <div className="mt-8 bg-white p-4 rounded-lg shadow border-t-4 border-blue-200">
        <h3 className="text-lg font-bold mb-2 text-blue-900">VC-Style Memo</h3>
        <div className="mb-2">
          <span className="font-semibold">Consensus View:</span> {summary.consensusStatement}
        </div>
        {summary.topConcerns && summary.topConcerns.length > 0 && (
          <div className="mb-2">
            <span className="font-semibold">Top Concern:</span> {summary.topConcerns[0]}
          </div>
        )}
        <div>
          <span className="font-semibold">Recommendation:</span> {/* Simple logic for recommendation */}
          {summary.investmentLikelihood >= 80 ? 'Proceed to Term Sheet Discussion' : summary.investmentLikelihood >= 50 ? 'Defer' : 'Pass'}
        </div>
      </div>
    </div>
  );
} 