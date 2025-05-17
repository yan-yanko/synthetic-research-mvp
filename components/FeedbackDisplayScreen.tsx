import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PitchDetails, AnalysisSetup } from '../pages/deck-upload';
import { type InvestorFeedbackResponse, mockData, type MockSlideFeedback } from '../types/feedback';

interface FeedbackDisplayScreenProps {
  deckInfo: PitchDetails & { originalFileName: string };
  analysisSettings: AnalysisSetup;
  apiResponseData: InvestorFeedbackResponse | null;
  // deckBase64?: string | null; // For future PDF generation
}

// Mock data structure for slide feedback
// interface MockSlideFeedback {
//   slide: string;
//   feedback: string;
// }

// The original mockData definition
// const mockData: InvestorFeedbackResponse = {
//   emailResponses: "Thank you for sharing your pitch. At this time, we believe you need more traction before we consider investing. Looking forward to future updates.",
//   meetingNotes: {
//     strengths: "Strong market opportunity, experienced team, clear value proposition.",
//     concerns: "Limited customer traction, competitive market, unclear monetization strategy.",
//   },
//   slideFeedback: [
//     { slide: "Slide 1 (Title Slide)", feedback: "Clear and professional." },
//     { slide: "Slide 2 (Problem)", feedback: "Problem is not quantified enough." },
//     { slide: "Slide 3 (Solution)", feedback: "Strong visual, could benefit from a clearer value proposition." },
//   ],
//   consensusReport: {
//     likelihoodToInvest: "30%",
//     overallFeedback: "Moderate interest. Recommend reaching key milestones before re-engaging.",
//   },
// };

export function FeedbackDisplayScreen({ deckInfo, analysisSettings, apiResponseData }: FeedbackDisplayScreenProps) {
  const dataToDisplay = apiResponseData || mockData;

  // Filter which tabs to show based on analysisSettings.selectedFeedbackTypes
  const activeTabsConfig = [
    { id: 'email', trigger: '📧 Email Responses', default: true },
    { id: 'meeting_notes', trigger: '📅 Meeting Notes', default: false },
    { id: 'slide_feedback', trigger: '📊 Slide Feedback', default: false },
    { id: 'consensus_report', trigger: '🧩 Consensus Report', default: false },
  ];
  
  const activeTabs = activeTabsConfig.filter(tab => analysisSettings.selectedFeedbackTypes.includes(tab.id));
  
  const defaultActiveTab = activeTabs.find(tab => tab.default)?.id || (activeTabs.length > 0 ? activeTabs[0].id : 'email');

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

          {activeTabs.find(t => t.id === 'email') && (
            <TabsContent value="email" className="p-4 border border-border rounded-md mt-2">
              <h3 className="text-xl font-semibold mb-3">Email Response</h3>
              <p className="text-base whitespace-pre-line">{dataToDisplay.emailResponses}</p>
            </TabsContent>
          )}

          {activeTabs.find(t => t.id === 'meeting_notes') && (
            <TabsContent value="meeting_notes" className="p-4 border border-border rounded-md mt-2 space-y-3">
              <h3 className="text-xl font-semibold mb-3">Meeting Notes</h3>
              <div>
                <h4 className="font-medium text-base">Strengths:</h4>
                <p className="text-base whitespace-pre-line">{dataToDisplay.meetingNotes.strengths}</p>
              </div>
              <div>
                <h4 className="font-medium text-base">Concerns:</h4>
                <p className="text-base whitespace-pre-line">{dataToDisplay.meetingNotes.concerns}</p>
              </div>
            </TabsContent>
          )}

          {activeTabs.find(t => t.id === 'slide_feedback') && (
            <TabsContent value="slide_feedback" className="p-4 border border-border rounded-md mt-2">
              <h3 className="text-xl font-semibold mb-3">Slide-by-Slide Feedback</h3>
              <ul className="space-y-3">
                {dataToDisplay.slideFeedback.map((item, index) => (
                  <li key={index} className="text-base">
                    <span className="font-medium">{item.slide}:</span> {item.feedback}
                  </li>
                ))}
              </ul>
            </TabsContent>
          )}

          {activeTabs.find(t => t.id === 'consensus_report') && (
            <TabsContent value="consensus_report" className="p-4 border border-border rounded-md mt-2 space-y-3">
              <h3 className="text-xl font-semibold mb-3">Consensus Report</h3>
              <div>
                <h4 className="font-medium text-base">Likelihood to Invest:</h4>
                <p className="text-base">{dataToDisplay.consensusReport.likelihoodToInvest}</p>
              </div>
              <div>
                <h4 className="font-medium text-base">Overall Feedback:</h4>
                <p className="text-base whitespace-pre-line">{dataToDisplay.consensusReport.overallFeedback}</p>
              </div>
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