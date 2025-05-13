import { investorPersonas } from './personas/investorPersonas';
import { SyntheticInvestor } from './types/personas';
import { buildPrompt, buildEnhancedPrompt } from './utils/buildPrompt';
import { createLLMClient } from './utils/llmClient';
import { LLMClientConfig } from './types/api';
import { 
  extractSentiment, 
  extractHighlights, 
  extractDecision,
  parseSlideAnalysis,
  extractInitialImpression
} from './utils/responseProcessing';
import { FeedbackResponse } from './types/feedback';
import { LOG_RAW_LLM_RESPONSE } from './constants';

/**
 * Generates investor feedback from all available personas for a pitch deck
 * @param deckSlides - Array of slides from the pitch deck
 * @param elevatorPitch - The elevator pitch text
 * @param llmConfig - Optional configuration for the LLM client
 * @returns Promise resolving to array of feedback responses from each persona
 */
export async function generateInvestorFeedback(
  deckSlides: string[], 
  elevatorPitch: string,
  llmConfig?: LLMClientConfig
): Promise<FeedbackResponse[]> {
  // Create LLM client
  const llmClient = createLLMClient(llmConfig);
  
  // Generate feedback for each persona in parallel
  return await Promise.all(
    investorPersonas.map(async (persona) => {
      // Build the prompt using the enhanced version for better structure
      const prompt = buildEnhancedPrompt(deckSlides, elevatorPitch, persona);
      
      // Call the LLM with the prompt
      const response = await llmClient.callLLM(prompt);
      
      // Process the response
      return processResponse(response, persona);
    })
  );
}

/**
 * Generates investor feedback from a specific persona for a pitch deck
 * @param deckSlides - Array of slides from the pitch deck
 * @param elevatorPitch - The elevator pitch text
 * @param personaId - ID of the specific investor persona to use
 * @param llmConfig - Optional configuration for the LLM client
 * @returns Promise resolving to feedback response from the specified persona
 * @throws Error if persona ID is not found
 */
export async function generateFeedbackFromPersona(
  deckSlides: string[],
  elevatorPitch: string,
  personaId: string,
  llmConfig?: LLMClientConfig
): Promise<FeedbackResponse> {
  // Find the specified persona
  const persona = investorPersonas.find(p => p.id === personaId);
  if (!persona) {
    throw new Error(`Persona with ID ${personaId} not found`);
  }
  
  // Create LLM client
  const llmClient = createLLMClient(llmConfig);
  
  // Build the prompt
  const prompt = buildEnhancedPrompt(deckSlides, elevatorPitch, persona);
  
  // Call the LLM with the prompt
  const response = await llmClient.callLLM(prompt);
  
  // Process the response
  return processResponse(response, persona);
}

/**
 * Processes the raw LLM response (expected to be JSON) into a structured feedback object
 * @param rawJsonResponse - The raw JSON string response from the LLM
 * @param persona - The investor persona used to generate the response
 * @returns Structured feedback response conforming to types/feedback.ts
 * @throws Error if the response is not valid JSON or missing expected fields
 */
function processResponse(rawJsonResponse: string, persona: SyntheticInvestor): FeedbackResponse {
  // Optionally log raw response for debugging
  if (LOG_RAW_LLM_RESPONSE) {
    console.log(`[DEBUG] Raw LLM Response for ${persona.name}:\n`, rawJsonResponse);
  }

  try {
    // Attempt to parse the JSON response
    const parsedData = JSON.parse(rawJsonResponse);

    // Basic validation (add more checks as needed)
    if (!parsedData.sentiment || !parsedData.initialImpression || !parsedData.slideAnalysis || !parsedData.decision || !parsedData.keyTakeaways) {
      throw new Error('LLM response is missing required fields.');
    }

    // Convert slideAnalysis array to Map
    const slideAnalysisMap = new Map<number, string>();
    if (Array.isArray(parsedData.slideAnalysis)) {
      parsedData.slideAnalysis.forEach((item: { slideNumber: number; feedback: string }) => {
        if (typeof item.slideNumber === 'number' && typeof item.feedback === 'string') {
          slideAnalysisMap.set(item.slideNumber, item.feedback);
        }
      });
    } else {
      // Handle case where slideAnalysis might not be an array, though prompt requests it
      console.warn(`Persona ${persona.name}: LLM did not return slideAnalysis as an array.`);
    }

    // Construct the FeedbackResponse object using the imported type
    return {
      personaId: persona.id,
      personaName: persona.name,
      personaType: persona.type,
      sentiment: parsedData.sentiment,
      initialImpression: parsedData.initialImpression,
      slideAnalysis: slideAnalysisMap, // Use the converted Map
      decision: parsedData.decision, 
      keyTakeaways: parsedData.keyTakeaways,
      fullResponse: rawJsonResponse 
    };
  } catch (error) {
    console.error('Error parsing LLM JSON response:', error);
    // Log the raw response on error regardless of the flag
    console.error("Raw LLM Response (on error):", rawJsonResponse);
    throw new Error(`Failed to parse LLM response for persona ${persona.name}: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
  }
} 