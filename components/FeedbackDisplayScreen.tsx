import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PitchDetails, AnalysisSetup } from '../pages/deck-upload';
import { type InvestorFeedbackResponse, mockData } from '../types/feedback';

interface FeedbackDisplayScreenProps {
  deckInfo: PitchDetails & { originalFileName: string };
  analysisSettings: AnalysisSetup;
  apiResponseData: InvestorFeedbackResponse | null;
}

export function FeedbackDisplayScreen({ deckInfo, analysisSettings, apiResponseData }: FeedbackDisplayScreenProps) {
  const dataToDisplay = apiResponseData || mockData;

  const activeTabsConfig = [
    { id: 'email', trigger: '📧 Email Responses' },
    { id: 'meeting_notes', trigger: '📅 Meeting Notes' },
    { id: 'slide_feedback', trigger: '📊 Slide Feedback' },
    { id: 'consensus_report', trigger: '🧩 Consensus Report' },
  ];
  
  const activeTabs = activeTabsConfig.filter(tab => 
    analysisSettings.selectedFeedbackTypes.includes(tab.id)
  );
  
  let defaultActiveTab = 'consensus_report'; 
  if (activeTabs.length > 0) {
    const preferredOrder = ['consensus_report', 'email', 'meeting_notes', 'slide_feedback'];
    let foundPreferred = false;
    for (const preferred of preferredOrder) {
      if (activeTabs.find(t => t.id === preferred)) {
        defaultActiveTab = preferred;
        foundPreferred = true;
        break;
      }
    }
    if (!foundPreferred) {
        defaultActiveTab = activeTabs[0].id;
    }
  } else {
    // No active tabs, perhaps set to a non-existent one or handle appropriately
    // For now, if activeTabs is empty, the Tabs component won't render meaningfully anyway.
  }

  return (
    <div className="space-y-8 p-1 bg-card shadow-sm">
      <div className="p-6 border border-border rounded-xl mb-8">
        <h2 className="text-2xl font-semibold text-card-foreground mb-1">Feedback Report</h2>
        <p className="text-sm text-muted-foreground">
          For: <span className="font-medium">{deckInfo.originalFileName}</span> | Industry: <span className="font-medium">{deckInfo.industry}</span> | Stage: <span className="font-medium">{deckInfo.fundingStage}</span>
        </p>
      </div>

      {activeTabs.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">No feedback types were selected for generation.</p>
      ) : (
        <Tabs defaultValue={defaultActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
            {activeTabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id} className="py-2 px-1 text-xs sm:text-sm whitespace-normal h-full">
                {tab.trigger}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Email Responses Tab - Temporary Adaptation */} 
          {activeTabs.find(t => t.id === 'email') && (
            <TabsContent value="email" className="p-4 border border-border rounded-md mt-2">
              <h3 className="text-xl font-semibold mb-3">Email Responses (Per Persona)</h3>
              {dataToDisplay.personaFeedbacks && dataToDisplay.personaFeedbacks.length > 0 ? (
                dataToDisplay.personaFeedbacks.map((pf, index) => (
                  <div key={index} className="mb-3 p-3 border rounded-md bg-muted/20">
                    <p className="font-semibold text-md text-primary">{pf.persona}</p>
                    <p className="text-sm mt-1"><span className="font-medium">Meeting Interest:</span> {pf.wouldTakeMeeting}</p>
                    <p className="text-sm"><span className="font-medium">Verdict:</span> {pf.verdict}</p>
                    <p className="text-xs mt-1"><span className="font-medium">Bias Applied:</span> {pf.biasApplied ? 'Yes' : 'No'}</p>
                    {pf.emotionalTriggers && pf.emotionalTriggers.length > 0 && 
                      <p className="text-xs mt-1 text-muted-foreground"><span className="font-medium">Triggers:</span> {pf.emotionalTriggers.join(', ')}</p>
                    }
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No persona feedback available to display for email summaries.</p>
              )}
            </TabsContent>
          )}

          {/* Meeting Notes Tab - Temporary Adaptation */} 
          {activeTabs.find(t => t.id === 'meeting_notes') && (
            <TabsContent value="meeting_notes" className="p-4 border border-border rounded-md mt-2 space-y-3">
              <h3 className="text-xl font-semibold mb-3">Meeting Notes (Per Persona)</h3>
              {dataToDisplay.personaFeedbacks && dataToDisplay.personaFeedbacks.length > 0 ? (
                dataToDisplay.personaFeedbacks.map((pf, index) => (
                  <div key={index} className="mb-4 p-3 border rounded-md bg-muted/20">
                    <h4 className="font-semibold text-md text-primary mb-1">{pf.persona}</h4>
                    <p className="text-xs mb-2"><span className="font-medium">Bias Applied:</span> {pf.biasApplied ? 'Yes' : 'No'}</p>
                    <div>
                        <h5 className="font-medium text-sm">Strengths:</h5>
                        {pf.strengths && pf.strengths.length > 0 ? (
                            <ul className="list-disc list-inside pl-4 text-sm">{pf.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                        ) : <p className="text-sm text-muted-foreground pl-4">N/A</p>}
                    </div>
                    <div className="mt-2">
                        <h5 className="font-medium text-sm">Concerns:</h5>
                        {pf.concerns && pf.concerns.length > 0 ? (
                            <ul className="list-disc list-inside pl-4 text-sm">{pf.concerns.map((c, i) => <li key={i}>{c}</li>)}</ul>
                        ) : <p className="text-sm text-muted-foreground pl-4">N/A</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No persona feedback available for meeting notes.</p>
              )}
            </TabsContent>
          )}

          {/* Slide Feedback Tab - Temporary Adaptation */} 
          {activeTabs.find(t => t.id === 'slide_feedback') && (
            <TabsContent value="slide_feedback" className="p-4 border border-border rounded-md mt-2">
              <h3 className="text-xl font-semibold mb-3">Slide Feedback (Conceptual)</h3>
              <p className="text-base text-muted-foreground">Detailed slide-by-slide feedback is not part of this aggregated view.</p>
              <p className="text-sm text-muted-foreground">(The current AI response provides overall strengths/concerns per persona, not per-slide feedback.)</p>
            </TabsContent>
          )}

          {/* Consensus Report Tab - Updated for new structure */} 
          {activeTabs.find(t => t.id === 'consensus_report') && (
            <TabsContent value="consensus_report" className="p-4 border border-border rounded-md mt-2 space-y-3">
              <h3 className="text-xl font-semibold mb-3">Consensus Report</h3>
              {dataToDisplay.consensusReport ? (
                <>
                  <div>
                    <h4 className="font-medium text-base">Likelihood to Invest:</h4>
                    <p className="text-3xl font-bold text-primary">{dataToDisplay.consensusReport.likelihoodToInvest}%</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-base mt-3">Overall Summary:</h4>
                    <p className="text-base whitespace-pre-line">{dataToDisplay.consensusReport.summary}</p>
                  </div>
                  <div className="mt-4 text-xs">
                    {apiResponseData 
                      ? <span style={{ color: 'green' }}>Live AI Feedback</span> 
                      : <span style={{ color: 'orange' }}>Mock Data (Demo Only)</span>}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Consensus report data is not available.</p>
              )}
            </TabsContent>
          )}
        </Tabs>
      )}

      <div className="mt-10 text-center pb-6">
        <Button disabled={!apiResponseData} className="w-full md:w-auto py-3 px-8 text-lg">
          Download Full Feedback Report (PDF)
        </Button>
        <p className="text-xs text-muted-foreground mt-2">(PDF download functionality coming soon)</p>
      </div>
    </div>
  );
} 