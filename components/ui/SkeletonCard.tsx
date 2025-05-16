import React from 'react';

export function SkeletonCard() {
  return (
    <div className="animate-pulse p-4 rounded-2xl bg-card border border-border shadow-md">
      {/* Top line (e.g., for a badge) */}
      <div className="h-6 bg-border rounded w-1/4 mb-4"></div>
      {/* Title line */}
      <div className="h-8 bg-border rounded w-3/4 mb-3"></div> {/* Adjusted width from 1/2 */}
      {/* Text lines for description */}
      <div className="h-4 bg-border rounded w-full mb-2"></div>
      <div className="h-4 bg-border rounded w-5/6 mb-3"></div> {/* Adjusted width from 3/4 */}
      {/* Bottom line (e.g., for another badge or short info) */}
      <div className="h-6 bg-border rounded w-1/3"></div>
    </div>
  );
} 