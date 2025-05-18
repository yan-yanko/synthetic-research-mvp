// console.log('[API /generate-feedback] File execution started - ABSOLUTE TOP OF FILE V3'); // Keep this for the very first line test
import type { NextApiRequest, NextApiResponse } from 'next';
// Removed getInvestorFeedbackFromAI and mockData imports as they are no longer used by the new handler
import type { InvestorFeedbackResponse } from '../../types/feedback'; 
import OpenAI from 'openai';
import { PDFExtract, PDFExtractPage, PDFExtractText } from 'pdf.js-extract'; // Added for PDF parsing
import { investorPersonas, InvestorPersona } from '../../utils/persona'; // Updated import
// THIS FILE SHOULD HAVE NO OTHER IMPORT STATEMENTS (COMMENTED OR OTHERWISE)
// ESPECIALLY NO IMPORTS FROM '../../generateInvestorFeedback'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// REMOVE type Persona and personaConfigs
// type Persona = 'Angel Investor' | 'Analytical VC' | 'Impact Investor' | 'Institutional LP' | 'Growth Investor';
// const personaConfigs: Record<Persona, any> = { ... };

type Data = {
  // feedback?: (FeedbackResponse | FeedbackError)[];
  message?: string; // Changed for test
  error?: string;
};

// console.log('[API /generate-feedback] File execution started - TOP OF FILE'); // REMOVE THIS LINE IF PRESENT

export default async function handler(req: NextApiRequest, res: NextApiResponse<InvestorFeedbackResponse | { error: string; details?: string; message?: string }>) {
  console.log('[API /generate-feedback] Handler invoked, preparing to use InvestorPersona objects.');

  if (req.method !== 'POST') {
    console.log('[API /generate-feedback] Method not POST, returning 405.');
    return res.status(405).json({ message: 'Method Not Allowed', error: 'Method Not Allowed' });
  }

  // Step 1.1: Expect selectedPersonas as string[] (IDs)
  const { deckUrl: deckBase64Content, selectedPersonas: selectedPersonaIDs, ...pitchDetailsFromClient }: { selectedPersonas?: string[] } & any = req.body;
  
  console.log("[API /generate-feedback] Received deckBase64Content (first 100 chars):", typeof deckBase64Content === 'string' ? deckBase64Content.substring(0, 100) + '...' : 'Not a string or not provided');
  console.log("[API /generate-feedback] Received selectedPersonaIDs:", selectedPersonaIDs);

  if (!deckBase64Content) {
    console.log('[API /generate-feedback] deckBase64Content is missing, returning 400.');
    return res.status(400).json({ error: 'deckBase64Content is required.' });
  }

  // Step 1.1: Map IDs to InvestorPersona objects
  let personaObjs: InvestorPersona[] = [];
  if (selectedPersonaIDs && selectedPersonaIDs.length > 0) {
    personaObjs = selectedPersonaIDs
      .map((id: string) => investorPersonas.find(p => p.id === id))
      .filter(Boolean) as InvestorPersona[];
  } else {
    // If no personas selected, perhaps default to all, or handle as an error.
    // For now, defaulting to all available personas if none are specified.
    console.log('[API /generate-feedback] No selectedPersonaIDs provided, defaulting to all personas.');
    personaObjs = [...investorPersonas];
  }

  if (personaObjs.length === 0) {
    console.log('[API /generate-feedback] No valid personas found for the given IDs or no IDs provided and no defaults set. Selected IDs:', selectedPersonaIDs);
    return res.status(400).json({ error: 'No valid investor personas selected or found.' });
  }
  console.log(`[API /generate-feedback] Using ${personaObjs.length} persona objects for feedback.`);


  let deckText = '';
  let generatedExecutiveSummary = pitchDetailsFromClient.executiveSummary || '';

  try {
    if (typeof deckBase64Content === 'string' && deckBase64Content.startsWith('data:application/pdf;base64,')) {
        console.log('[API /generate-feedback] Attempting to parse PDF from Base64 string.');
        const base64Data = deckBase64Content.replace(/^data:application\/pdf;base64,/, '');
        const pdfBuffer = Buffer.from(base64Data, 'base64');
        console.log(`[API /generate-feedback] PDF Buffer length: ${pdfBuffer.length}`);

        if (pdfBuffer.length === 0) {
            console.warn('[API /generate-feedback] PDF Buffer is empty after Base64 decoding. Cannot parse.');
            deckText = 'Error: PDF Buffer empty after decoding.';
        } else {
            try {
                const pdfExtract = new PDFExtract();
                const data = await pdfExtract.extractBuffer(pdfBuffer, {});
                deckText = data.pages.map((page: PDFExtractPage) => 
                    page.content.filter((item: PDFExtractText) => item.str.trim() !== '').map((item: PDFExtractText) => item.str).join('\n')
                ).join('\n\n--- Page Break ---\n\n');
                console.log(`[API /generate-feedback] PDF content extracted successfully. Text length: ${deckText.length}. Pages: ${data.pdfInfo?.numPages || data.pages.length}.`);
                if (deckText.trim().length === 0) {
                    console.warn('[API /generate-feedback] PDF parsing resulted in empty text. The PDF might be image-based or have no extractable text.');
                    deckText = 'Warning: PDF parsing resulted in empty text. The PDF might be image-based or have no extractable text.';
                }
            } catch (parseError: any) {
                console.error('[API /generate-feedback] Error during PDF extraction:', parseError.message, parseError.stack);
                deckText = `Error parsing PDF content: ${parseError.message}`;
            }
        }
    } else {
        console.warn('[API /generate-feedback] deckBase64Content is not in the expected format or is missing. Cannot extract text.');
        deckText = 'Error: Invalid or missing PDF data format for extraction.';
    }

    if (!generatedExecutiveSummary && deckText && !deckText.startsWith('Error:') && !deckText.startsWith('Warning:')) {
        try {
            console.log('[API /generate-feedback] Attempting to generate executive summary with OpenAI.');
            const summaryResponse = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: `Based on this pitch content, write a compelling Executive Summary (max 200 words):\n\n${deckText}` }],
                max_tokens: 300, // Adjusted max_tokens for summary
                temperature: 0.5,
            });
            generatedExecutiveSummary = summaryResponse.choices[0]?.message?.content || 'Could not generate executive summary.';
            console.log('[API /generate-feedback] Executive summary generated successfully.');
        } catch (summaryError: any) {
            console.error('[API /generate-feedback] Failed to generate executive summary:', summaryError.message, summaryError.stack);
            generatedExecutiveSummary = 'Error generating executive summary.';
        }
    } else if (!generatedExecutiveSummary) {
      generatedExecutiveSummary = 'Executive summary could not be generated due to issues with PDF content.';
    }
    
    const finalPitchDetails = { // This is passed to buildPersonaPrompt through its parameters now
        ...pitchDetailsFromClient,
        // executiveSummary: generatedExecutiveSummary // This is now passed directly
    };
    console.log('[API /generate-feedback] Final pitch details (client part):', finalPitchDetails);

    const personaFeedbacks = await Promise.all(
      personaObjs.map(async (personaInstance: InvestorPersona) => { // personaInstance is InvestorPersona
        // applyBias logic removed as per refactor plan. Prompt will instruct LLM to embody persona.
        console.log(`[${personaInstance.name}] Generating feedback.`); 

        const prompt = buildPersonaPrompt(personaInstance, deckText, generatedExecutiveSummary);
        console.log(`[API /generate-feedback] Prompt for ${personaInstance.name}:\n${prompt}`);

        console.log(`[API /generate-feedback] Calling OpenAI for persona: ${personaInstance.name}`);
        const response = await openai.chat.completions.create({
          model: 'gpt-4o', // Consider making this configurable
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800, // Consider adjusting based on expected feedback length
          temperature: personaInstance.behaviorProfile.temperature || 0.4, // Use persona's temperature
        });
        console.log(`[API /generate-feedback] OpenAI response received for ${personaInstance.name}`);

        const content = response.choices[0]?.message?.content || '';
        // Pass personaInstance.name to parseLLMResponse
        const parsedLLMData = parseLLMResponse(personaInstance.name, content);
        // Removed biasApplied from the return object
        return { ...parsedLLMData, persona: personaInstance.name, id: personaInstance.id }; // Ensure 'persona' (name) and 'id' are in the response
      })
    );
    
    console.log('[API /generate-feedback] All persona feedback generated.');
    // Filter for feedbacks that have at least a persona name.
    const validFeedbacks = personaFeedbacks.filter(fb => fb && fb.persona);
    const likelihood = calculateConsensusLikelihood(validFeedbacks, investorPersonas); // Pass full investorPersonas for lookup

    const responseJson: InvestorFeedbackResponse = {
      personaFeedbacks: validFeedbacks,
      consensusReport: {
        likelihoodToInvest: likelihood,
        summary: generateConsensusSummary(likelihood),
      },
      generatedExecutiveSummary: generatedExecutiveSummary,
      parsedDeckText: deckText,
    };
    console.log('[API /generate-feedback] Sending 200 response.');
    return res.status(200).json(responseJson);

  } catch (error: any) {
    console.error('[API /generate-feedback] Overall catch block error:', error.message, error.stack);
    const errorResponse: { error: string; details?: string } = { 
        error: 'Internal Server Error', 
        details: error.message 
    };
    return res.status(500).json(errorResponse);
  }
}

// --- Helper Functions ---

// Step 1.3: Update buildPersonaPrompt signature and logic
function buildPersonaPrompt(
    persona: InvestorPersona,
    deckContent: string, // Added deckContent from user's previous notes, matches my plan
    executiveSummary: string // Added executiveSummary
): string {
  // pitchDetails are now sourced from request body and executiveSummary argument
  // We'll use what's available in `persona` (InvestorPersona type) and `finalPitchDetails` from handler scope
  // For this refactor, `finalPitchDetails` is not directly passed. We should use `executiveSummary` and other details from `persona` or request if needed.
  // The original `pitchDetails` for prompt was: fundingStage, industry, seekingAmount, primaryRegion, executiveSummary.
  // These are not part of InvestorPersona. They come from `pitchDetailsFromClient` in the handler.
  // This function needs access to those client-provided details.
  // For now, let's assume they are implicitly available or we focus on persona and deck.
  // A better refactor would pass `pitchDetailsFromClient` into this function.
  // For now, to match the signature strictly, I'll use placeholders if not in persona.

  const profile = persona.behaviorProfile;
  const decisionStyle = persona.type ? `${persona.type} type investor` : (persona.behavioralTraits.join(', ') || 'default decision style');
  // Cognitive biases will be represented by behavioral traits
  const cognitiveBiases = persona.behavioralTraits.join(', ') || 'standard professional judgment';
  // Behavioral inconsistencies are not in InvestorPersona, use a generic or omit.
  const behavioralInconsistencies = "Strives for rational analysis but may be influenced by core traits.";


  // Bias instruction is now implicitly part of asking the LLM to embody the persona.
  const instruction = `You are simulating a venture capital investor: ${persona.name}.
Embody this persona accurately based on all provided details. Your feedback should reflect deep analysis of the pitch deck content.`;

  return `
${instruction}

Investor Profile:
- Name: ${persona.name}
- Type/Focus: ${persona.type}
- Investment Thesis: ${persona.investmentThesis}
- Key Behavioral Traits (these should heavily influence your feedback): ${cognitiveBiases}
- Stated Risk Appetite: ${profile.riskAppetite || 'Not specified'}
- Typical Decision-Making Style: ${decisionStyle}
- Known Behavioral Inconsistencies (reminder): ${behavioralInconsistencies}
- Industry Bias: ${profile.industryBias?.join(', ') || 'None specified'}
- Investment Stage Focus: (User to provide, e.g., Seed, Series A)
- Seeking Amount: (User to provide)
- Primary Region: (User to provide)

Executive Summary (AI Generated from Deck):
--- START OF EXECUTIVE SUMMARY ---
${executiveSummary}
--- END OF EXECUTIVE SUMMARY ---

Full Pitch Deck Content:
--- START OF PITCH DECK CONTENT ---
${deckContent}
--- END OF PITCH DECK CONTENT ---

Based on ALL the information above (your detailed Investor Profile, the Executive Summary, and especially the Full Pitch Deck Content), provide your realistic investor analysis.
Focus your feedback on the substance of the pitch deck.

Respond *ONLY* with a valid JSON object in the following format (no other text, no markdown):
{
  "wouldTakeMeeting": "Yes/No", // Based on your persona's typical bar
  "strengths": ["Specific strength 1 from deck content related to your persona's focus", "Specific strength 2 from deck content", "..."],
  "concerns": ["Specific concern 1 from deck content related to your persona's focus", "Specific concern 2 from deck content", "..."],
  "keyQuestions": ["Question 1 directly related to deck content and your persona", "Question 2", "..."], // Renamed from emotionalTriggers to be more actionable
  "verdict": "Invest / Pass / Monitor and Revisit Later" // Your overall judgment
}
`;
}

// Updated to take personaName (string)
function parseLLMResponse(personaName: string, content: string) {
  try {
    const jsonMatch = content.match(/\{([\s\S]*?)\}/);
    let jsonToParse = content;
    if (jsonMatch && jsonMatch[0]) {
        jsonToParse = jsonMatch[0];
    } else {
        if (!content.trim().startsWith('{') || !content.trim().endsWith('}')) {
            console.warn(`Content for ${personaName} does not appear to be a JSON object: "${content}"`);
            const relaxedJsonMatch = content.match(/\{[\s\S]*\}/m);
            if (relaxedJsonMatch && relaxedJsonMatch[0]) {
                jsonToParse = relaxedJsonMatch[0];
                console.log(`Relaxed JSON match found for ${personaName}: "${jsonToParse}"`);
            } else {
                throw new Error("No clear JSON object found in response.");
            }
        }
    }
    
    const parsed = JSON.parse(jsonToParse);
    // persona name is already known, just return parsed data
    return parsed; // The calling map adds the persona name and id
  } catch (e: any) {
    console.warn(`Failed to parse JSON response for ${personaName}. Content: "${content}". Error: ${e.message}`);
    return { // Fallback structure, persona name/id will be added by caller
      wouldTakeMeeting: 'No',
      strengths: ["Error parsing AI response from LLM."],
      concerns: ["Could not interpret AI output for this persona. The response might not have been valid JSON or was incomplete."],
      keyQuestions: [],
      verdict: 'Pass',
    };
  }
}

// Updated to use InvestorPersona and assume equal weights for now
function calculateConsensusLikelihood(feedbacks: any[], allPersonas: InvestorPersona[]) {
  if (!feedbacks || feedbacks.length === 0) return 0;

  let totalScore = 0;
  let validFeedbacksCount = 0;

  feedbacks.forEach((fb) => {
    // const personaDetails = allPersonas.find(p => p.id === fb.id || p.name === fb.persona); // fb should have id
    // For now, we assume fb has a verdict. Weight is not in InvestorPersona. Assume equal weight.
    // if (personaDetails) { // This check isn't strictly necessary if feedbacks are pre-filtered
      const verdictScore = getVerdictScore(fb.verdict);
      totalScore += verdictScore;
      validFeedbacksCount++;
    // }
  });

  if (validFeedbacksCount === 0) return 0; 
  return Math.round((totalScore / validFeedbacksCount) * 100); // Average score as likelihood
}

function getVerdictScore(verdict?: string) {
  if (!verdict) return 0;
  if (verdict.toLowerCase().includes('invest')) return 1;
  if (verdict.toLowerCase().includes('monitor')) return 0.5;
  // "Yes" for wouldTakeMeeting could also be a factor, but sticking to verdict for now.
  if (verdict.toLowerCase().includes('pass')) return 0; 
  return 0; // Default for unrecognized verdicts
}

function generateConsensusSummary(likelihood: number) {
  if (likelihood >= 70) return 'High interest. Likely to secure meetings with multiple investors.';
  if (likelihood >= 40) return 'Moderate interest. Some investors may take a meeting, but concerns exist.';
  return 'Low interest. Unlikely to secure investor meetings at this stage.';
}

function formatAmount(amount: string | number) {
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
  if (isNaN(num)) return 'Not specified';
  return num.toLocaleString('en-US');
}

// console.log('[API /generate-feedback] File execution started - BOTTOM OF FILE'); // REMOVE THIS LINE IF PRESENT 