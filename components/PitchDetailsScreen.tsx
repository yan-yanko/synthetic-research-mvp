import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PitchDetails } from '../pages/deck-upload';

interface PitchDetailsScreenProps {
  onDetailsComplete: (details: PitchDetails) => void;
  initialDeckTextForDebug?: string | null;
}

const industryOptions = ["SaaS", "Fintech", "Healthtech", "Biotech", "eCommerce", "AI/ML", "Cleantech", "EdTech", "Security", "Other"];
const fundingStageOptions = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+", "Other"];
const primaryRegionOptions = ["United States", "Europe", "Israel", "Asia-Pacific", "LATAM", "Other"];

const defaultDetails: Omit<PitchDetails, 'elevatorPitch'> = { // Omit elevatorPitch
  industry: 'SaaS',
  fundingStage: 'Seed',
  seekingAmount: '2,500,000', // Default with commas
  primaryRegion: 'United States',
  executiveSummary: 'The startup focuses on scalable B2B SaaS solutions aimed at improving productivity for mid-sized companies.',
};

// Helper to format number with commas
const formatNumberWithCommas = (value: string): string => {
  const numStr = value.replace(/[^\d]/g, '');
  if (numStr === '') return '';
  return Number(numStr).toLocaleString('en-US');
};

// Helper to remove commas for storing raw number if needed later (though state stores formatted)
const parseFormattedNumber = (value: string): string => {
  return value.replace(/,/g, '');
};

export function PitchDetailsScreen({ onDetailsComplete, initialDeckTextForDebug }: PitchDetailsScreenProps) {
  const [details, setDetails] = useState<Omit<PitchDetails, 'elevatorPitch'>>(defaultDetails);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (initialDeckTextForDebug && details.executiveSummary === defaultDetails.executiveSummary) {
      // This is a placeholder. In a real scenario, you might generate a summary here
      // or expect an AI-generated summary to be passed in and set.
      // For now, we are just showing the raw text, not trying to make it the executive summary.
    }
  }, [initialDeckTextForDebug, details.executiveSummary]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof Omit<PitchDetails, 'elevatorPitch'>) => (value: string) => {
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = formatNumberWithCommas(value);
    setDetails(prev => ({ ...prev, seekingAmount: formattedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add any new validation if necessary, elevatorPitch validation removed
    if (!details.executiveSummary.trim()) { // Example: Ensure executive summary is not empty
        alert('Please provide an executive summary.');
        return;
    }
    // Casting back to PitchDetails, assuming other parts of the app expect it fully.
    // If elevatorPitch is truly gone everywhere, this cast isn't strictly necessary for the object shape.
    onDetailsComplete(details as PitchDetails);
  };

  return (
    <div className="space-y-8">
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2">💡 AI Recommendation</h3>
        <p className="text-sm mb-2">Based on our AI analysis of your pitch deck:</p>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Recommended Stage: [Seed]</li>
          <li>Suggested Funding: [$3,000,000]</li>
        </ul>
        <p className="text-sm mt-2">
          The startup has validated its product through discovery sessions, demos, and design partnerships with large companies, suggesting it has moved beyond ideation into product development and early traction. The $3M funding amount aligns with Seed stage investments to further build the product, expand partnerships, and scale operations before a larger Series A round.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 p-6 border border-border rounded-xl bg-card shadow-sm">
        <h2 className="text-2xl font-semibold text-card-foreground">Pitch Deck Details</h2>
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="industry" className="text-sm font-medium text-muted-foreground">Industry</Label>
            <Select name="industry" value={details.industry} onValueChange={handleSelectChange('industry')}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select industry" /></SelectTrigger>
              <SelectContent>
                {industryOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fundingStage" className="text-sm font-medium text-muted-foreground">Funding Stage</Label>
            <Select name="fundingStage" value={details.fundingStage} onValueChange={handleSelectChange('fundingStage')}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select funding stage" /></SelectTrigger>
              <SelectContent>
                {fundingStageOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="seekingAmount" className="text-sm font-medium text-muted-foreground">Seeking Amount (USD)</Label>
            <Input 
              id="seekingAmount" 
              name="seekingAmount" 
              type="text" 
              inputMode="numeric" 
              value={details.seekingAmount} 
              onChange={handleAmountChange} 
              className="mt-1" 
              placeholder="e.g., 1,000,000"
            />
          </div>
          <div>
            <Label htmlFor="primaryRegion" className="text-sm font-medium text-muted-foreground">Primary Region</Label>
            <Select name="primaryRegion" value={details.primaryRegion} onValueChange={handleSelectChange('primaryRegion')}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select primary region" /></SelectTrigger>
              <SelectContent>
                {primaryRegionOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="executiveSummary" className="text-sm font-medium text-muted-foreground">Executive Summary <span className="text-destructive">*</span></Label>
          <Textarea 
            id="executiveSummary" 
            name="executiveSummary" 
            value={details.executiveSummary} 
            onChange={handleChange} 
            className="mt-1 min-h-[100px]"
            maxLength={1000} 
            minLength={50}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">{details.executiveSummary.length}/1000</p>
        </div>

        <Button type="submit" className="w-full py-3 text-lg">Continue to Analysis</Button>
      </form>

      {/* Debug Section for Parsed PDF Text */} 
      {initialDeckTextForDebug && (
        <div className="mt-6 p-4 border border-dashed border-gray-400 rounded-md bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-md font-semibold text-gray-700">Debug: Parsed PDF Content (First 1000 chars)</h4>
            <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)}>
              {showDebug ? 'Hide' : 'Show'}
            </Button>
          </div>
          {showDebug && (
            <pre className="mt-2 p-2 bg-white text-xs text-gray-600 whitespace-pre-wrap break-all overflow-auto max-h-60 border rounded">
              {initialDeckTextForDebug.substring(0, 1000)}{initialDeckTextForDebug.length > 1000 ? '...' : ''}
            </pre>
          )}
        </div>
      )}
    </div>
  );
} 