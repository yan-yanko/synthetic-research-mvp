import { createLLMClient } from './llmClient';
import { SyntheticInvestor } from '../personas/investorPersonas';

interface FollowUpResponse {
  personaId: string;
  personaName: string;
  updatedResponse: string;
  updatedSentiment: 'improved' | 'unchanged' | 'worsened';
}

/**
 * Simulates a follow-up response from an investor after receiving additional context
 * @param initialFeedback - The original feedback from the investor
 * @param followUpContext - Additional explanation or clarification from the founder
 * @param persona - The synthetic investor persona to simulate
 * @returns A follow-up response with updated assessment
 */
export async function simulateFollowUp(
  initialFeedback: string,
  followUpContext: string,
  persona: SyntheticInvestor
): Promise<FollowUpResponse> {
  // Create LLM client
  const llmClient = createLLMClient();
  
  // Build follow-up prompt
  const followUpPrompt = `
You previously reviewed a pitch deck as ${persona.name}, a ${persona.type}-type investor with the following investment thesis: "${persona.investmentThesis}".

Here was your original feedback:
"""
${initialFeedback.substring(0, 2000)}${initialFeedback.length > 2000 ? '...' : ''}
"""

Now, the founder has provided the following follow-up explanation:
"""
${followUpContext}
"""

As ${persona.name}, revise or extend your assessment based on this new information. 
Stay in character as ${persona.name} with your ${persona.tone} communication style.
Be true to your behavioral traits: ${persona.behavioralTraits.join(', ')}.

FORMAT YOUR RESPONSE AS FOLLOWS:

## Sentiment Change
[IMPROVED | UNCHANGED | WORSENED]

## Updated Assessment
[Your updated overall assessment of the pitch with this new information]

## Investment Status
[Your updated investment stance - whether this changes your original view, and if so, how]

## Remaining Concerns
[List 1-3 concerns that still remain, if any]

## New Positives
[List any new positive aspects based on the clarification]

## Follow-up Question
[One specific follow-up question you still have]
`;

  // Call LLM
  const updatedResponse = await llmClient.callLLM(followUpPrompt);
  
  // Extract sentiment change
  let updatedSentiment: 'improved' | 'unchanged' | 'worsened' = 'unchanged';
  const sentimentMatch = updatedResponse.match(/## Sentiment Change\s*\n([A-Z]+)/i);
  if (sentimentMatch) {
    const sentiment = sentimentMatch[1].trim().toUpperCase();
    if (sentiment === 'IMPROVED') {
      updatedSentiment = 'improved';
    } else if (sentiment === 'WORSENED') {
      updatedSentiment = 'worsened';
    }
  }
  
  return {
    personaId: persona.id,
    personaName: persona.name,
    updatedResponse,
    updatedSentiment
  };
}

/**
 * Analyzes key differences between initial and follow-up responses
 * @param initialFeedback - The original feedback object
 * @param followUpResponse - The follow-up response
 * @returns Analysis of changes between responses
 */
export function analyzeFollowUpChanges(
  initialFeedback: any,
  followUpResponse: string
): { changes: string[], significance: 'minor' | 'moderate' | 'significant' } {
  const changes: string[] = [];
  
  // Extract sections from follow-up response
  const updatedAssessmentMatch = followUpResponse.match(/## Updated Assessment\s*\n([\s\S]*?)(?=##|$)/i);
  const updatedAssessment = updatedAssessmentMatch ? updatedAssessmentMatch[1].trim() : '';
  
  const investmentStatusMatch = followUpResponse.match(/## Investment Status\s*\n([\s\S]*?)(?=##|$)/i);
  const investmentStatus = investmentStatusMatch ? investmentStatusMatch[1].trim() : '';
  
  const remainingConcernsMatch = followUpResponse.match(/## Remaining Concerns\s*\n([\s\S]*?)(?=##|$)/i);
  const remainingConcerns = remainingConcernsMatch ? remainingConcernsMatch[1].trim() : '';
  
  const newPositivesMatch = followUpResponse.match(/## New Positives\s*\n([\s\S]*?)(?=##|$)/i);
  const newPositives = newPositivesMatch ? newPositivesMatch[1].trim() : '';
  
  // Check for investment decision change
  if (initialFeedback.decision && investmentStatus) {
    const originalDecision = initialFeedback.decision.decision;
    
    if (
      (originalDecision.includes('NOT INVEST') && investmentStatus.includes('WOULD INVEST')) ||
      (originalDecision.includes('WOULD INVEST') && investmentStatus.includes('NOT INVEST'))
    ) {
      changes.push('Completely reversed investment decision');
    } else if (
      (originalDecision.includes('NEED MORE INFORMATION') && 
       (investmentStatus.includes('WOULD INVEST') || investmentStatus.includes('NOT INVEST')))
    ) {
      changes.push('Made a definitive investment decision');
    }
  }
  
  // Add other notable changes
  if (newPositives && newPositives.split('\n').filter(line => line.trim()).length > 0) {
    changes.push('Identified new positive aspects');
  }
  
  if (remainingConcerns) {
    const concernCount = remainingConcerns.split('\n').filter(line => line.trim()).length;
    if (concernCount === 0) {
      changes.push('All previous concerns have been addressed');
    } else if (initialFeedback.keyTakeaways) {
      const originalConcernCount = initialFeedback.keyTakeaways.filter(
        (item: any) => item.type === 'concern'
      ).length;
      
      if (concernCount < originalConcernCount) {
        changes.push(`Addressed ${originalConcernCount - concernCount} concerns`);
      }
    }
  }
  
  // Determine significance of changes
  let significance: 'minor' | 'moderate' | 'significant' = 'minor';
  if (changes.length >= 3 || changes.some(c => c.includes('reversed investment decision'))) {
    significance = 'significant';
  } else if (changes.length >= 1) {
    significance = 'moderate';
  }
  
  return { changes, significance };
} 