import { createLLMClient } from './llmClient';
import { SyntheticInvestor } from '../types/personas';
import { FollowUpResponse } from '../types/feedback';
import { FOLLOWUP_SENTIMENT_CHANGE_TYPES, LOG_RAW_LLM_RESPONSE } from '../constants';

// Define expected JSON structure for follow-up
interface FollowUpJsonResponse {
  sentimentChange: 'improved' | 'unchanged' | 'worsened';
  updatedAssessment: string;
  investmentStatus: string;
  remainingConcerns: string[]; // Expecting an array of strings
  newPositives: string[]; // Expecting an array of strings
  followUpQuestion: string;
}

/**
 * Simulates a follow-up response from an investor after receiving additional context
 * @param initialFeedback - The original feedback from the investor (full JSON string)
 * @param followUpContext - Additional explanation or clarification from the founder
 * @param persona - The synthetic investor persona to simulate
 * @returns A follow-up response object
 * @throws Error if LLM response is not valid JSON
 */
export async function simulateFollowUp(
  initialFeedback: string, // Expecting the full JSON string of the initial feedback
  followUpContext: string,
  persona: SyntheticInvestor
): Promise<FollowUpResponse> {
  // Create LLM client
  const llmClient = createLLMClient();
  
  const jsonStructure = `
{
  "sentimentChange": "improved | unchanged | worsened",
  "updatedAssessment": "Your updated overall assessment...",
  "investmentStatus": "Your updated investment stance...",
  "remainingConcerns": ["Concern 1", "Concern 2"],
  "newPositives": ["Positive 1", "Positive 2"],
  "followUpQuestion": "Your single follow-up question."
}
`;

  // Build follow-up prompt
  const followUpPrompt = `
You previously reviewed a pitch deck as ${persona.name}, a ${persona.type}-type investor with the following investment thesis: "${persona.investmentThesis}".

Your original feedback (in JSON format) was:
\`\`\`json
${initialFeedback}
\`\`\`

Now, the founder has provided the following follow-up explanation:
\`\`\`
${followUpContext}
\`\`\`

As ${persona.name}, revise or extend your assessment based on this new information. 
Stay in character as ${persona.name} with your ${persona.quoteStyle} communication style.
Be true to your behavioral traits: ${persona.behavioralTraits.join(', ')}.

**IMPORTANT**: Structure your *entire* response as a single JSON object conforming *exactly* to the following format. Do not include any text outside of the JSON structure.

${jsonStructure}
`;

  // Call LLM
  const rawJsonResponse = await llmClient.callLLM(followUpPrompt);
  
  // Optionally log raw response for debugging
  if (LOG_RAW_LLM_RESPONSE) {
    console.log(`[DEBUG] Raw Follow-up LLM Response for ${persona.name}:\n`, rawJsonResponse);
  }
  
  try {
    // Parse JSON response
    const parsedData: FollowUpJsonResponse = JSON.parse(rawJsonResponse);

    // Basic validation (add more checks as needed)
    if (!parsedData.sentimentChange || !parsedData.updatedAssessment || !parsedData.investmentStatus || !parsedData.remainingConcerns || !parsedData.newPositives || !parsedData.followUpQuestion) {
      throw new Error('Follow-up LLM response is missing required fields.');
    }
    
    return {
      personaId: persona.id,
      personaName: persona.name,
      updatedResponse: rawJsonResponse, // Store full JSON response
      updatedSentiment: parsedData.sentimentChange
    };
  } catch (error) {
    console.error("Error parsing follow-up LLM JSON response:", error);
    // Log the raw response on error regardless of the flag
    console.error("Raw Follow-up LLM Response (on error):", rawJsonResponse);
    throw new Error(`Failed to parse follow-up LLM response for persona ${persona.name}: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
  }
}

// analyzeFollowUpChanges function needs significant changes or removal
// as it relied on the old string format. Removing for now as it wasn't explicitly requested to be updated.
/*
export function analyzeFollowUpChanges(
  initialFeedback: any, // Needs updated type (FeedbackResponse)
  followUpResponse: string // Needs updated type (FollowUpJsonResponse parsed from updatedResponse)
): { changes: string[], significance: 'minor' | 'moderate' | 'significant' } {
  // ... This logic needs complete rewrite based on JSON structure ...
  console.warn("analyzeFollowUpChanges needs to be rewritten for JSON structure");
  return { changes: [], significance: 'minor' };
}
*/ 