import { investorPersonas, SyntheticInvestor } from './personas/investorPersonas';
import { buildPrompt, buildEnhancedPrompt } from './utils/buildPrompt';
import { createLLMClient, LLMClientConfig } from './utils/llmClient';
import { 
  extractSentiment, 
  extractHighlights, 
  extractDecision,
  parseSlideAnalysis,
  extractInitialImpression
} from './utils/responseProcessing';

export interface FeedbackResponse {
  personaId: string;
  personaName: string;
  personaType: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  initialImpression: string;
  slideAnalysis: Map<number, string>;
  decision: {
    decision: string;
    confidence: string;
  };
  keyTakeaways: {
    type: 'strength' | 'concern' | 'question';
    text: string;
  }[];
  fullResponse: string;
}

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
 * Processes the raw LLM response into a structured feedback object
 * @param response - The raw text response from the LLM
 * @param persona - The investor persona used to generate the response
 * @returns Structured feedback response
 */
function processResponse(response: string, persona: SyntheticInvestor): FeedbackResponse {
  return {
    personaId: persona.id,
    personaName: persona.name,
    personaType: persona.type,
    sentiment: extractSentiment(response),
    initialImpression: extractInitialImpression(response),
    slideAnalysis: parseSlideAnalysis(response),
    decision: extractDecision(response),
    keyTakeaways: extractHighlights(response),
    fullResponse: response
  };
} 