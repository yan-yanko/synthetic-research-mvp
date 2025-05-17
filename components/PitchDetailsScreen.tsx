import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { PitchDetails } from '../pages/deck-upload'; // Import the type from DeckUploaderPage

interface PitchDetailsScreenProps {
  onDetailsComplete: (details: PitchDetails) => void;
}

const defaultDetails: PitchDetails = {
  industry: 'SaaS',
  fundingStage: 'Seed',
  seekingAmount: '2500000',
  primaryRegion: 'United States',
  executiveSummary: 'The startup focuses on scalable B2B SaaS solutions aimed at improving productivity for mid-sized companies.',
  elevatorPitch: '', // Initialize elevator pitch as empty
};

export function PitchDetailsScreen({ onDetailsComplete }: PitchDetailsScreenProps) {
  const [details, setDetails] = useState<PitchDetails>(defaultDetails);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDetails((prev: PitchDetails) => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Allow only numbers for seeking amount
    if (/^\d*$/.test(value)) {
      setDetails((prev: PitchDetails) => ({ ...prev, seekingAmount: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation example: Ensure elevator pitch is not empty
    if (!details.elevatorPitch.trim()) {
      alert('Please provide an elevator pitch.');
      return;
    }
    onDetailsComplete(details);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-6 border border-border rounded-xl bg-card shadow-sm">
      <h2 className="text-2xl font-semibold text-card-foreground">Pitch Deck Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="industry" className="text-sm font-medium text-muted-foreground">Industry</Label>
          <Input id="industry" name="industry" value={details.industry} onChange={handleChange} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="fundingStage" className="text-sm font-medium text-muted-foreground">Funding Stage</Label>
          <Input id="fundingStage" name="fundingStage" value={details.fundingStage} onChange={handleChange} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="seekingAmount" className="text-sm font-medium text-muted-foreground">Seeking Amount (USD)</Label>
          <Input id="seekingAmount" name="seekingAmount" type="text" inputMode="numeric" value={details.seekingAmount} onChange={handleAmountChange} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="primaryRegion" className="text-sm font-medium text-muted-foreground">Primary Region</Label>
          <Input id="primaryRegion" name="primaryRegion" value={details.primaryRegion} onChange={handleChange} className="mt-1" />
        </div>
      </div>

      <div>
        <Label htmlFor="executiveSummary" className="text-sm font-medium text-muted-foreground">Executive Summary</Label>
        <Textarea 
          id="executiveSummary" 
          name="executiveSummary" 
          value={details.executiveSummary} 
          onChange={handleChange} 
          className="mt-1 min-h-[100px]"
          maxLength={1000} 
        />
        <p className="text-xs text-muted-foreground mt-1">{details.executiveSummary.length}/1000</p>
      </div>

      <div>
        <Label htmlFor="elevatorPitch" className="text-sm font-medium text-muted-foreground">Elevator Pitch <span className="text-destructive">*</span></Label>
        <Textarea 
          id="elevatorPitch" 
          name="elevatorPitch" 
          value={details.elevatorPitch} 
          onChange={handleChange} 
          placeholder="Your concise and compelling elevator pitch..."
          className="mt-1 min-h-[120px]"
          maxLength={500} 
          required
        />
        <p className="text-xs text-muted-foreground mt-1">{details.elevatorPitch.length}/500</p>
      </div>

      <Button type="submit" className="w-full py-3 text-lg">Continue to Analysis</Button>
    </form>
  );
} 