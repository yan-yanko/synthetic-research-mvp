import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { AnalysisSetup, PitchDetails, InvestorFeedbackResponse } from '../pages/deck-upload';

interface AnalysisSetupScreenProps {
  onSetupComplete: (setup: AnalysisSetup, responseData: InvestorFeedbackResponse | null) => void;
  pitchFileName?: string | null;
  deckBase64: string | null;
  currentPitchDetails: PitchDetails | null;
}

const investorPersonasOptions = [
  { id: 'angel', label: 'Angel Investor' },
  { id: 'analytical_vc', label: 'Analytical VC' },
  { id: 'impact_investor', label: 'Impact Investor' },
  { id: 'growth_investor', label: 'Growth Investor' },
  { id: 'institutional_lp', label: 'Institutional LP' },
];

const feedbackTypesOptions = [
  { id: 'email', label: '📧 Email Responses' },
  { id: 'meeting_notes', label: '📅 Meeting Notes' },
  { id: 'slide_feedback', label: '📊 Slide Feedback' },
  { id: 'consensus_report', label: '🧩 Consensus Report' },
];

export function AnalysisSetupScreen({ onSetupComplete, pitchFileName, deckBase64, currentPitchDetails }: AnalysisSetupScreenProps) {
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>(['angel']);
  const [selectedFeedbackTypes, setSelectedFeedbackTypes] = useState<string[]>(
    feedbackTypesOptions.map(ft => ft.id)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFeedbackTypeChange = (typeId: string, checked: boolean) => {
    setSelectedFeedbackTypes(prev => 
      checked ? [...prev, typeId] : prev.filter(id => id !== typeId)
    );
  };

  const handleSubmit = async () => {
    if (selectedPersonas.length === 0) {
      alert('Please select at least one investor persona.');
      return;
    }
    if (selectedFeedbackTypes.length === 0) {
      alert('Please select at least one feedback type.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload = {
      deckUrl: "PLACEHOLDER_DECK_URL", 
      elevatorPitch: currentPitchDetails?.elevatorPitch || "",
    };

    try {
      const response = await fetch('/api/generate-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "API request failed with status: " + response.status }));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }

      const responseData: InvestorFeedbackResponse = await response.json();
      onSetupComplete({ selectedPersonas, selectedFeedbackTypes }, responseData);

    } catch (err: any) {
      console.error("Error generating feedback:", err);
      setError(err.message || "An unexpected error occurred.");
      onSetupComplete({ selectedPersonas, selectedFeedbackTypes }, null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6 border border-border rounded-xl bg-card shadow-sm">
      {pitchFileName && (
        <p className="text-sm text-muted-foreground">Analysis Setup for: <span className="font-semibold text-card-foreground">{pitchFileName}</span></p>
      )}
      <h2 className="text-2xl font-semibold text-card-foreground">Analysis Setup</h2>

      <div>
        <Label className="text-lg font-medium text-card-foreground">Select Investor Personas (choose at least one)</Label>
        <ToggleGroup 
          type="multiple" 
          variant="outline" 
          value={selectedPersonas}
          onValueChange={(value) => setSelectedPersonas(value)}
          className="flex flex-wrap gap-2 mt-2"
        >
          {investorPersonasOptions.map(persona => (
            <ToggleGroupItem key={persona.id} value={persona.id} aria-label={`Toggle ${persona.label}`}>
              {persona.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div>
        <Label className="text-lg font-medium text-card-foreground">Select Feedback Types (choose at least one)</Label>
        <div className="space-y-2 mt-2">
          {feedbackTypesOptions.map(type => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`type-${type.id}`} 
                checked={selectedFeedbackTypes.includes(type.id)}
                onCheckedChange={(checked) => handleFeedbackTypeChange(type.id, !!checked)}
              />
              <Label htmlFor={`type-${type.id}`} className="text-base font-normal text-muted-foreground">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-destructive mt-2 text-center">Error: {error}</p>}
      <Button onClick={handleSubmit} disabled={isLoading} className="w-full py-3 text-lg">
        {isLoading ? 'Generating...' : 'Generate Feedback'}
      </Button>
    </div>
  );
} 