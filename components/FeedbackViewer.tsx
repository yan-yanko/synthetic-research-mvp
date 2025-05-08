import React, { useState } from 'react';
import { FeedbackResponse } from '../generateInvestorFeedback';

interface FeedbackViewerProps {
  feedback: FeedbackResponse;
  viewMode?: 'card' | 'table';
}

/**
 * Component for displaying investor feedback in either card or table format
 */
const FeedbackViewer: React.FC<FeedbackViewerProps> = ({ 
  feedback, 
  viewMode = 'card' 
}) => {
  const [expandedSlides, setExpandedSlides] = useState<number[]>([]);
  
  const toggleSlideExpansion = (slideNumber: number) => {
    if (expandedSlides.includes(slideNumber)) {
      setExpandedSlides(expandedSlides.filter(slide => slide !== slideNumber));
    } else {
      setExpandedSlides([...expandedSlides, slideNumber]);
    }
  };
  
  const renderDecisionBadge = () => {
    const { decision } = feedback.decision;
    let badgeColor = '';
    
    switch (decision) {
      case 'WOULD INVEST':
        badgeColor = 'bg-green-100 text-green-800';
        break;
      case 'WOULD NOT INVEST':
        badgeColor = 'bg-red-100 text-red-800';
        break;
      default:
        badgeColor = 'bg-yellow-100 text-yellow-800';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${badgeColor}`}>
        {decision}
      </span>
    );
  };
  
  const renderCardView = () => {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {feedback.personaName}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {feedback.personaType}
            </p>
          </div>
          <div>
            {renderDecisionBadge()}
            <span className="ml-2 text-sm text-gray-500">
              Confidence: {feedback.decision.confidence}
            </span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h4 className="text-md font-medium text-gray-900">Initial Impression</h4>
          <p className="mt-1 text-sm text-gray-600">{feedback.initialImpression}</p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h4 className="text-md font-medium text-gray-900">Key Takeaways</h4>
          <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <h5 className="text-sm font-medium text-gray-500">Strengths</h5>
              <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                {feedback.keyTakeaways
                  .filter(item => item.type === 'strength')
                  .map((item, index) => (
                    <li key={`strength-${index}`}>{item.text}</li>
                  ))
                }
              </ul>
            </div>
            <div className="sm:col-span-1">
              <h5 className="text-sm font-medium text-gray-500">Concerns</h5>
              <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                {feedback.keyTakeaways
                  .filter(item => item.type === 'concern')
                  .map((item, index) => (
                    <li key={`concern-${index}`}>{item.text}</li>
                  ))
                }
              </ul>
            </div>
            <div className="sm:col-span-2 mt-4">
              <h5 className="text-sm font-medium text-gray-500">Follow-up Questions</h5>
              <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                {feedback.keyTakeaways
                  .filter(item => item.type === 'question')
                  .map((item, index) => (
                    <li key={`question-${index}`}>{item.text}</li>
                  ))
                }
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h4 className="text-md font-medium text-gray-900">Slide-by-Slide Analysis</h4>
          <div className="mt-2 space-y-4">
            {Array.from(feedback.slideAnalysis.entries()).map(([slideNumber, slideContent]) => (
              <div key={`slide-${slideNumber}`} className="border rounded-md p-3">
                <div 
                  className="flex justify-between items-center cursor-pointer" 
                  onClick={() => toggleSlideExpansion(slideNumber)}
                >
                  <h5 className="text-sm font-medium">Slide {slideNumber}</h5>
                  <span className="text-sm text-gray-500">
                    {expandedSlides.includes(slideNumber) ? '▼' : '▶'}
                  </span>
                </div>
                
                {expandedSlides.includes(slideNumber) && (
                  <p className="mt-2 text-sm text-gray-600">{slideContent}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const renderTableView = () => {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slide
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Feedback
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Overall
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                <div className="mb-2">{renderDecisionBadge()} - {feedback.decision.confidence}</div>
                <p className="mb-2">{feedback.initialImpression}</p>
                <div className="mt-3">
                  <strong>Strengths:</strong>
                  <ul className="list-disc list-inside">
                    {feedback.keyTakeaways
                      .filter(item => item.type === 'strength')
                      .map((item, index) => (
                        <li key={`str-${index}`}>{item.text}</li>
                      ))
                    }
                  </ul>
                </div>
                <div className="mt-2">
                  <strong>Concerns:</strong>
                  <ul className="list-disc list-inside">
                    {feedback.keyTakeaways
                      .filter(item => item.type === 'concern')
                      .map((item, index) => (
                        <li key={`con-${index}`}>{item.text}</li>
                      ))
                    }
                  </ul>
                </div>
              </td>
            </tr>
            
            {Array.from(feedback.slideAnalysis.entries()).map(([slideNumber, slideContent]) => (
              <tr key={`slide-row-${slideNumber}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Slide {slideNumber}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {slideContent}
                </td>
              </tr>
            ))}
            
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Questions
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                <ul className="list-decimal list-inside">
                  {feedback.keyTakeaways
                    .filter(item => item.type === 'question')
                    .map((item, index) => (
                      <li key={`q-${index}`}>{item.text}</li>
                    ))
                  }
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };
  
  return viewMode === 'card' ? renderCardView() : renderTableView();
};

export default FeedbackViewer; 