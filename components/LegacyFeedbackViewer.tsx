import React from 'react';

// Define the legacy FeedbackItem type
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

interface LegacyFeedbackViewerProps {
  feedbackData: FeedbackItem[];
  viewMode?: 'card' | 'table';
  onSelectFeedback?: (feedback: FeedbackItem) => void;
}

/**
 * Legacy FeedbackViewer component that matches the original implementation
 * This is for backward compatibility with the deck-upload page
 */
const LegacyFeedbackViewer: React.FC<LegacyFeedbackViewerProps> = ({ 
  feedbackData, 
  viewMode = 'card',
  onSelectFeedback
}) => {
  if (!feedbackData || feedbackData.length === 0) {
    return (
      <div className="bg-gray-50 p-6 text-center rounded-lg border border-gray-200">
        <p className="text-gray-500">No feedback available.</p>
      </div>
    );
  }

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {feedbackData.map((feedback) => (
        <div key={feedback.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-4 mb-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-800">{feedback.persona}</h3>
          </div>
          
          <div className="mb-3">
            <p className="text-gray-700">{feedback.feedback}</p>
          </div>
          
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

            {feedback.slides && Object.keys(feedback.slides).length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-700 mt-3">Slide Feedback:</h4>
                {Object.entries(feedback.slides).map(([slideName, data], idx) => (
                  <div key={idx} className="mt-2 border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{slideName}</span>
                      <span className="text-xs text-gray-500">Relevance: {data.relevance}/10</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{data.comments}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {onSelectFeedback && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => onSelectFeedback(feedback)}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded text-sm"
              >
                Select
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
  
  const renderTableView = () => (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="py-3 px-6">Persona</th>
            <th scope="col" className="py-3 px-6">Feedback</th>
            <th scope="col" className="py-3 px-6">Strengths</th>
            <th scope="col" className="py-3 px-6">Concerns</th>
            {onSelectFeedback && (
              <th scope="col" className="py-3 px-6">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {feedbackData.map((feedback) => (
            <tr key={feedback.id} className="bg-white border-b hover:bg-gray-50">
              <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                {feedback.persona}
              </th>
              <td className="py-4 px-6">{feedback.feedback}</td>
              <td className="py-4 px-6">
                <ul className="list-disc list-inside">
                  {feedback.strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </td>
              <td className="py-4 px-6">
                <ul className="list-disc list-inside">
                  {feedback.concerns.map((concern, idx) => (
                    <li key={idx}>{concern}</li>
                  ))}
                </ul>
              </td>
              {onSelectFeedback && (
                <td className="py-4 px-6">
                  <button
                    onClick={() => onSelectFeedback(feedback)}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    View Details
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="mt-4">
      {viewMode === 'card' ? renderCardView() : renderTableView()}
    </div>
  );
};

export default LegacyFeedbackViewer; 