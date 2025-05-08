import { useState } from 'react';

export interface SlideReviewPanelProps {
  slides: string[];
  onHideSlides?: () => void;
}

/**
 * Component to display parsed slides for user review
 */
export function SlideReviewPanel({ slides, onHideSlides }: SlideReviewPanelProps) {
  const [expandedSlideIndex, setExpandedSlideIndex] = useState<number | null>(null);
  
  const toggleSlideExpansion = (index: number) => {
    if (expandedSlideIndex === index) {
      setExpandedSlideIndex(null);
    } else {
      setExpandedSlideIndex(index);
    }
  };
  
  if (!slides.length) {
    return null;
  }
  
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium text-sm">Parsed Slides for Review:</h4>
        <span className="text-xs text-gray-500">
          {slides.length} {slides.length === 1 ? 'slide' : 'slides'} detected
        </span>
      </div>
      
      <div className="max-h-60 overflow-y-auto border rounded bg-white">
        {slides.map((slide, index) => (
          <div 
            key={index}
            className="border-b last:border-b-0 p-2 hover:bg-gray-50 cursor-pointer"
            onClick={() => toggleSlideExpansion(index)}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Slide {index + 1}</span>
              <span className="text-xs text-gray-500">
                {expandedSlideIndex === index ? 'Collapse ▲' : 'Expand ▼'}
              </span>
            </div>
            {expandedSlideIndex === index ? (
              <p className="text-sm mt-1 text-gray-700 whitespace-pre-line">{slide}</p>
            ) : (
              <p className="text-sm mt-1 text-gray-700 truncate">{slide.substring(0, 100)}{slide.length > 100 ? '...' : ''}</p>
            )}
          </div>
        ))}
      </div>
      
      {onHideSlides && (
        <div className="mt-2 text-right">
          <button
            type="button"
            onClick={onHideSlides}
            className="text-gray-600 hover:text-gray-800 text-sm underline"
          >
            Hide Slides
          </button>
        </div>
      )}
    </div>
  );
} 