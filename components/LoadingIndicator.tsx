import React from 'react';

export interface LoadingIndicatorProps {
  message?: string;
  subMessage?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * A reusable loading indicator component
 */
export function LoadingIndicator({ 
  message = 'Loading...', 
  subMessage,
  size = 'medium' 
}: LoadingIndicatorProps) {
  // Determine spinner size
  const spinnerSizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-b-2'
  };
  
  return (
    <div className="text-center p-4">
      <div 
        className={`inline-block animate-spin rounded-full border-t-2 border-b-2 border-blue-700 mx-auto ${spinnerSizeClasses[size]}`}
      ></div>
      
      {message && (
        <p className="mt-3 text-gray-600 font-medium">{message}</p>
      )}
      
      {subMessage && (
        <p className="text-sm text-gray-500 mt-1">{subMessage}</p>
      )}
    </div>
  );
} 