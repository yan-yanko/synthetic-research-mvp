import React from 'react';
import { FeedbackResponse } from '../generateInvestorFeedback';
import { summarizeInvestorPanel } from '../utils/summarizeInvestorPanel';

interface InvestorSummaryPanelProps {
  feedback: FeedbackResponse[];
}

export function InvestorSummaryPanel({ feedback }: InvestorSummaryPanelProps) {
  const summary = summarizeInvestorPanel(feedback);

  if (!feedback || feedback.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-50 rounded-xl p-6 border mt-6 shadow-sm">
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
          <ul className="list-disc list-inside text-sm space-y-2">
            {summary.topStrengths.map((strength, idx) => (
              <li key={idx} className="text-green-700">{strength}</li>
            ))}
            {summary.topStrengths.length === 0 && (
              <li className="text-gray-500 italic">No common strengths identified</li>
            )}
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium text-gray-900 mb-2">Top Concerns</h4>
          <ul className="list-disc list-inside text-sm space-y-2">
            {summary.topConcerns.map((concern, idx) => (
              <li key={idx} className="text-red-700">{concern}</li>
            ))}
            {summary.topConcerns.length === 0 && (
              <li className="text-gray-500 italic">No common concerns identified</li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-medium text-gray-900 mb-2">Investment Likelihood</h4>
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full ${
                summary.investmentLikelihood > 70 ? 'bg-green-500' : 
                summary.investmentLikelihood > 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${summary.investmentLikelihood}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Not Interested</span>
            <span>Needs More Info</span>
            <span>Would Invest</span>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-medium text-gray-900 mb-2">Recommended Next Steps</h4>
        <ul className="list-disc list-inside text-sm space-y-2">
          {summary.recommendedNextSteps.map((step, idx) => (
            <li key={idx} className="text-blue-700">{step}</li>
          ))}
        </ul>
      </div>
    </div>
  );
} 