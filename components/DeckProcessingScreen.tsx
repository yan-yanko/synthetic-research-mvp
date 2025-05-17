import React, { useEffect } from 'react';
import { PeachLoader } from '@/components/ui/PeachLoader'; // Assuming PeachLoader is suitable

interface DeckProcessingScreenProps {
  onProcessingComplete: () => void;
}

export function DeckProcessingScreen({ onProcessingComplete }: DeckProcessingScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onProcessingComplete();
    }, 5000); // 5-second delay

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, [onProcessingComplete]);

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[300px] bg-background text-center">
      <PeachLoader message="Processing your deck..." />
      <p className="text-lg text-textSecondary mt-6 max-w-md">
        Sit tight! We're scanning your pitch through the lens of thousands of real investor decisions to extract actionable insights.
      </p>
    </div>
  );
} 