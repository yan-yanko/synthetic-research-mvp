import { investorPersonas } from './personas/investorPersonas';
import { SyntheticInvestor } from './types/personas';
import { buildEnhancedPrompt } from './utils/buildPrompt';
import { llmClient } from './server/llmClient';
import { sanitizeInput } from './utils/sanitize';
import { FeedbackResponse, FeedbackError } from './types/feedback';
import { LOG_RAW_LLM_RESPONSE } from './constants';
import { OpenAI } from 'openai';

console.log('[generateInvestorFeedback] Module loading...');

/**
 * Generates investor feedback from all available personas for a pitch deck
 * @param deckSlides - Array of slides from the pitch deck
 * @param elevatorPitch - The elevator pitch text
 * @returns Promise resolving to array of feedback responses from each persona
 */
export async function generateInvestorFeedback(
  deckSlidesInput: string[],
  elevatorPitchInput: string
): Promise<(FeedbackResponse | FeedbackError)[]> {
  const sanitizedElevatorPitch = sanitizeInput(elevatorPitchInput);
  const sanitizedDeckSlides = deckSlidesInput.map(slide => sanitizeInput(slide));

  const feedbackPromises = investorPersonas.map(async (persona) => {
    try {
      const effectiveUserPromptFromBuilder = buildEnhancedPrompt(
        sanitizedDeckSlides,
        sanitizedElevatorPitch,
        persona // Pass the full persona, buildEnhancedPrompt will use its new behaviorProfile fields
      );
      // The system prompt in llmClient is generic. If buildEnhancedPrompt itself contains full persona context,
      // we might simplify this further. For now, this provides persona specifics to the system side too.
      const personaSystemPrompt = `You are ${persona.name}, a ${persona.type} investor with specific traits. Your investment thesis: "${persona.investmentThesis}". Communication style: ${persona.quoteStyle}. Behavioral traits: ${persona.behavioralTraits.join(', ')}. Risk tolerance: ${persona.behaviorProfile.riskTolerance} (0=low, 1=high). Industry preferences: ${persona.behaviorProfile.industryBias.join(', ') || 'none specific'}. You MUST respond in the JSON format specified in the user prompt.`;

      let maxTokensForPersona;
      switch (persona.behaviorProfile.verbosityPreference) {
        case 'concise':
          maxTokensForPersona = 800; // Example value for concise
          break;
        case 'verbose':
          maxTokensForPersona = 2500; // Example value for verbose
          break;
        case 'default':
        default:
          maxTokensForPersona = 1500; // Default value, matches llmClient default
          break;
      }

      // Prepend the token budget instruction to the user prompt
      const tokenBudgetInstruction = `IMPORTANT: Keep the total response under ${maxTokensForPersona} tokens. Prioritize critical feedback.\n\n`;
      const effectiveUserPrompt = tokenBudgetInstruction + effectiveUserPromptFromBuilder;

      const llmApiResponse = await llmClient.callLLM(
        personaSystemPrompt, 
        effectiveUserPrompt, 
        {
          temperature: persona.behaviorProfile.temperature,
          maxTokens: maxTokensForPersona,
          // baseURL and timeoutMs could also be passed here if they were persona-specific
          // For example: baseURL: persona.behaviorProfile.customEndpointIfAny
          // timeoutMs: persona.behaviorProfile.customTimeoutIfAny
        }
      );

      if (!llmApiResponse.choices[0]?.message?.content) {
        throw new Error('LLM response content is missing.');
      }
      
      return processLLMOutput(llmApiResponse.choices[0].message.content, persona);

    } catch (error: any) {
      console.error(`Failed to generate feedback for persona ${persona.name}:`, error);
      return {
        personaId: persona.id,
        personaName: persona.name,
        error: `Failed to get feedback: ${error.message || 'Unknown error'}`,
      } as FeedbackError;
    }
  });

  return Promise.allSettled(feedbackPromises).then(results =>
    results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        // result.reason should be the FeedbackError object we constructed in the catch block or an Error
        if (result.reason && typeof result.reason.personaId === 'string') {
             return result.reason as FeedbackError; // Already formatted FeedbackError
        }
        // If it's a generic Error, try to format it. This might happen if the error is outside the try/catch for a specific persona.
        const personaFromReason = investorPersonas.find(p => result.reason?.message?.includes(p.name));
        return {
            personaId: personaFromReason?.id || 'unknown',
            personaName: personaFromReason?.name || 'Unknown Persona',
            error: `An unexpected error occurred: ${result.reason?.message || result.reason || 'Unknown rejection'}`,
        } as FeedbackError;
      }
    })
  );
}

/**
 * Processes the raw LLM response (expected to be JSON) into a structured feedback object
 * @param rawJsonResponse - The raw JSON string response from the LLM
 * @param persona - The investor persona used to generate the response
 * @returns Structured feedback response conforming to types/feedback.ts
 * @throws Error if the response is not valid JSON or missing expected fields
 */
function processLLMOutput(rawOutput: string, persona: SyntheticInvestor): FeedbackResponse {
  if (LOG_RAW_LLM_RESPONSE) {
    console.log(`[DEBUG] Raw LLM Response for ${persona.name}:\n`, rawOutput);
  }
  try {
    const parsedData = JSON.parse(rawOutput);

    // Basic validation from original processResponse
    if (!parsedData.sentiment || !parsedData.initialImpression || !parsedData.slideAnalysis || !parsedData.decision || !parsedData.keyTakeaways) {
      throw new Error('LLM response is missing required fields.');
    }
    
    const slideAnalysisMap = new Map<number, string>();
    if (Array.isArray(parsedData.slideAnalysis)) {
      parsedData.slideAnalysis.forEach((item: { slideNumber: number; feedback: string }) => {
        if (typeof item.slideNumber === 'number' && typeof item.feedback === 'string') {
          slideAnalysisMap.set(item.slideNumber, item.feedback);
        }
      });
    } else {
      console.warn(`Persona ${persona.name}: LLM did not return slideAnalysis as an array.`);
    }

    return {
      personaId: persona.id,
      personaName: persona.name,
      personaType: persona.type,
      sentiment: parsedData.sentiment,
      initialImpression: parsedData.initialImpression,
      slideAnalysis: slideAnalysisMap,
      decision: parsedData.decision,
      keyTakeaways: parsedData.keyTakeaways,
      fullResponse: rawOutput, // Keep the raw response
    };
  } catch (error) {
    console.error(`Error parsing LLM JSON response for ${persona.name}:`, error);
    console.error("Raw LLM Response (on error):", rawOutput); // Log raw response on error
    // Re-throw a more specific error or an error that processResponse would have thrown
    throw new Error(`Failed to parse LLM response for persona ${persona.name}: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
  }
} 