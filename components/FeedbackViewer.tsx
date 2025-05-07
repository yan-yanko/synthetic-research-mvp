import React, { useState, useMemo } from 'react';
import { summarizeSentiment, extractHighlights } from '../utils/feedback';

// Define the FeedbackItem type
export interface FeedbackItem {
  id: string;
  persona: string;
  feedback: string;
  strengths: string[];
  concerns: string[];
  recommendation: string;
  slides?: {
    [key: string]: { relevance: number; comments: string }
  };
}

// Props for the component
interface FeedbackViewerProps {
  feedbackData: FeedbackItem[];
  viewMode: 'card' | 'table';
  onSelectFeedback?: (feedback: FeedbackItem) => void;
}

// Helper component for sentiment badges
const SentimentBadge = ({ sentiment }: { sentiment: 'Positive' | 'Neutral' | 'Negative' }) => {
  const colors = {
    Positive: 'bg-green-100 text-green-800 border-green-200',
    Neutral: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Negative: 'bg-red-100 text-red-800 border-red-200',
  };

  const icons = {
    Positive: '👍',
    Neutral: '✋',
    Negative: '👎',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[sentiment]}`}>
      <span className="mr-1">{icons[sentiment]}</span>
      {sentiment}
    </span>
  );
};

// Card view component
const FeedbackCard = ({ feedback, onSelect }: { feedback: FeedbackItem; onSelect?: (feedback: FeedbackItem) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const sentiment = summarizeSentiment(feedback);
  const { compellingSlide, concern } = extractHighlights(feedback);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-800">{feedback.persona}</h3>
        <SentimentBadge sentiment={sentiment} />
      </div>
      
      <div className="mb-3">
        <div className="text-sm font-medium text-gray-500 mb-1">KEY HIGHLIGHTS</div>
        <div className="space-y-2">
          {compellingSlide && (
            <div>
              <span className="text-green-600 font-medium">Most compelling:</span> {compellingSlide}
            </div>
          )}
          {concern && (
            <div>
              <span className="text-red-600 font-medium">Main concern:</span> {concern}
            </div>
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="space-y-3">
            {feedback.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-700">Strengths:</h4>
                <ul className="list-disc pl-5 text-sm text-gray-600 mt-1">
                  {feedback.strengths.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {feedback.concerns.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-700">Concerns:</h4>
                <ul className="list-disc pl-5 text-sm text-gray-600 mt-1">
                  {feedback.concerns.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {feedback.recommendation && (
              <div>
                <h4 className="text-sm font-bold text-gray-700">Recommendation:</h4>
                <p className="text-sm text-gray-600 mt-1">{feedback.recommendation}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
        
        {onSelect && (
          <button
            onClick={() => onSelect(feedback)}
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded text-sm"
          >
            Select
          </button>
        )}
      </div>
    </div>
  );
};

// Table view component
const FeedbackTable = ({ 
  feedbackData, 
  onSelect 
}: { 
  feedbackData: FeedbackItem[]; 
  onSelect?: (feedback: FeedbackItem) => void 
}) => {
  const [sortColumn, setSortColumn] = useState<string>('persona');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const sortedData = useMemo(() => {
    return [...feedbackData].sort((a, b) => {
      let aValue, bValue;
      
      if (sortColumn === 'sentiment') {
        aValue = summarizeSentiment(a);
        bValue = summarizeSentiment(b);
      } else if (sortColumn === 'slide') {
        aValue = extractHighlights(a).compellingSlide || '';
        bValue = extractHighlights(b).compellingSlide || '';
      } else if (sortColumn === 'summary') {
        aValue = a.recommendation || '';
        bValue = b.recommendation || '';
      } else {
        // Default to persona
        aValue = a.persona;
        bValue = b.persona;
      }
      
      // Sort strings
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [feedbackData, sortColumn, sortDirection]);
  
  const renderSortArrow = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('persona')}
            >
              Persona{renderSortArrow('persona')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('sentiment')}
            >
              Sentiment{renderSortArrow('sentiment')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('slide')}
            >
              Most Mentioned Slide{renderSortArrow('slide')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('summary')}
            >
              Summary{renderSortArrow('summary')}
            </th>
            {onSelect && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((feedback) => {
            const sentiment = summarizeSentiment(feedback);
            const { compellingSlide } = extractHighlights(feedback);
            
            return (
              <tr key={feedback.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {feedback.persona}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <SentimentBadge sentiment={sentiment} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {compellingSlide || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {feedback.recommendation || 'No summary available'}
                </td>
                {onSelect && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => onSelect(feedback)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Main component
const FeedbackViewer: React.FC<FeedbackViewerProps> = ({ 
  feedbackData, 
  viewMode,
  onSelectFeedback 
}) => {
  // Show placeholder if no data
  if (!feedbackData || feedbackData.length === 0) {
    return (
      <div className="bg-gray-50 p-6 text-center rounded-lg border border-gray-200">
        <p className="text-gray-500">No feedback available.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbackData.map((feedback) => (
            <FeedbackCard 
              key={feedback.id} 
              feedback={feedback} 
              onSelect={onSelectFeedback}
            />
          ))}
        </div>
      ) : (
        <FeedbackTable 
          feedbackData={feedbackData} 
          onSelect={onSelectFeedback}
        />
      )}
    </div>
  );
};

export default FeedbackViewer; 