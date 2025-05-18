console.log('[API /generate-feedback] File execution started - ABSOLUTE TOP OF FILE V3');
import type { NextApiRequest, NextApiResponse } from 'next';
// Removed getInvestorFeedbackFromAI and mockData imports as they are no longer used by the new handler
import type { InvestorFeedbackResponse } from '../../types/feedback'; 
import OpenAI from 'openai';
import pdf from 'pdf-parse'; // Added pdf-parse import
// THIS FILE SHOULD HAVE NO OTHER IMPORT STATEMENTS (COMMENTED OR OTHERWISE)
// ESPECIALLY NO IMPORTS FROM '../../generateInvestorFeedback'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Persona = 'Angel Investor' | 'Analytical VC' | 'Impact Investor' | 'Institutional LP' | 'Growth Investor';

const personaConfigs: Record<Persona, any> = {
  'Angel Investor': {
    riskAppetite: 'High',
    biases: 'FOMO, Overconfidence',
    concerns: 'Founder Vision, Market Potential',
    decisionMakingStyle: 'Founder-First',
    behavioralInconsistencies: 'Often influenced by market hype despite claiming founder-first approach.',
    biasActivationChance: 0.3,
    weight: 0.2,
  },
  'Analytical VC': {
    riskAppetite: 'Moderate',
    biases: 'Status Quo Bias, Loss Aversion',
    concerns: 'Market Size, Data-Driven Proof',
    decisionMakingStyle: 'Data-Driven',
    behavioralInconsistencies: 'May over-analyze and miss opportunities if data is not perfect.',
    biasActivationChance: 0.15,
    weight: 0.3,
  },
  'Impact Investor': {
    riskAppetite: 'Moderate',
    biases: 'Ethical Bias, FOMO (for impact trends)',
    concerns: 'Social/Environmental Impact, Measurable Outcomes',
    decisionMakingStyle: 'Mission-Aligned',
    behavioralInconsistencies: 'May prioritize impact over financial returns more than stated.',
    biasActivationChance: 0.2,
    weight: 0.1,
  },
  'Institutional LP': {
    riskAppetite: 'Low',
    biases: 'Loss Aversion, Status Quo Bias, Herd Mentality (following other LPs)',
    concerns: 'Scalability, Risk Mitigation, Fund Manager Track Record',
    decisionMakingStyle: 'Risk-Averse Portfolio Strategy',
    behavioralInconsistencies: 'Claims long-term view but can be swayed by short-term market sentiment.',
    biasActivationChance: 0.1,
    weight: 0.2,
  },
  'Growth Investor': {
    riskAppetite: 'High',
    biases: 'FOMO, Herd Mentality, Confirmation Bias (on growth metrics)',
    concerns: 'Revenue Growth, Market Leadership, Scalable Sales Model',
    decisionMakingStyle: 'Metrics-Driven Growth Focus',
    behavioralInconsistencies: 'Can sometimes ignore underlying profitability issues if top-line growth is exceptional.',
    biasActivationChance: 0.25,
    weight: 0.2,
  },
};

type Data = {
  // feedback?: (FeedbackResponse | FeedbackError)[];
  message?: string; // Changed for test
  error?: string;
};

// console.log('[API /generate-feedback] File execution started - TOP OF FILE'); // REMOVE THIS LINE IF PRESENT

export default async function handler(req: NextApiRequest, res: NextApiResponse<InvestorFeedbackResponse | { error: string; details?: string; message?: string }>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed', error: 'Method Not Allowed' });
  }

  // Renamed deckUrl to deckBase64Content for clarity as it contains Base64 PDF data
  const { deckUrl: deckBase64Content, selectedPersonas = Object.keys(personaConfigs), ...pitchDetailsFromClient } = req.body;

  // Log the received Base64 content (or a snippet if too long)
  console.log("[API /generate-feedback] Received deckBase64Content (first 100 chars):", typeof deckBase64Content === 'string' ? deckBase64Content.substring(0, 100) + '...' : 'Not a string or not provided');

  if (!deckBase64Content) {
    return res.status(400).json({ error: 'deckBase64Content is required.' });
  }

  let deckText = 'No content extracted from PDF.';
  let generatedExecutiveSummary = pitchDetailsFromClient.executiveSummary || 'Executive summary could not be generated.';

  try {
    // Decode Base64 and parse PDF
    if (typeof deckBase64Content === 'string' && deckBase64Content.startsWith('data:application/pdf;base64,')) {
        const base64Data = deckBase64Content.replace(/^data:application\/pdf;base64,/, '');
        const pdfBuffer = Buffer.from(base64Data, 'base64');
        const data = await pdf(pdfBuffer);
        deckText = data.text;
        console.log('[API /generate-feedback] PDF content extracted successfully.');
    } else {
        console.warn('[API /generate-feedback] deckBase64Content is not in the expected format or is missing. Using placeholder deckText.');
        // Potentially use a less critical fallback or error if PDF content is essential
    }

    // Generate Executive Summary from deckText
    if (deckText && deckText !== 'No content extracted from PDF.') {
        try {
            const summaryResponse = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: `Based on this pitch content, write a compelling Executive Summary (max 200 words):

${deckText}` }],
                max_tokens: 300, // Adjusted for summary length
                temperature: 0.5,
            });
            generatedExecutiveSummary = summaryResponse.choices[0]?.message?.content || generatedExecutiveSummary;
            console.log('[API /generate-feedback] Executive summary generated successfully.');
        } catch (summaryError: any) {
            console.error('[API /generate-feedback] Failed to generate executive summary:', summaryError.message);
            // Keep the user-provided or default summary
        }
    }
    
    // Prepare pitch details for persona prompts, using the newly generated executive summary
    const finalPitchDetails = {
        ...pitchDetailsFromClient,
        executiveSummary: generatedExecutiveSummary 
    };

    const personaFeedbacks = await Promise.all(
      (selectedPersonas as Persona[]).map(async (persona: Persona) => {
        const personaData = personaConfigs[persona];
        if (!personaData) {
          console.warn(`Configuration for persona ${persona} not found. Skipping.`);
          return { persona, biasApplied: false, ...parseLLMResponse(persona, '{}') }; 
        }
        const applyBias = Math.random() < personaData.biasActivationChance;
        console.log(`[${persona}] Bias Applied: ${applyBias}`); 

        // Pass deckText and finalPitchDetails (with AI summary) to buildPersonaPrompt
        const prompt = buildPersonaPrompt(persona, personaData, finalPitchDetails, applyBias, deckText);
        console.log(`[API /generate-feedback] Prompt for ${persona}:\n${prompt}`);

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800,
          temperature: 0.4,
        });

        const content = response.choices[0]?.message?.content || '';
        const parsedLLMData = parseLLMResponse(persona, content);
        return { ...parsedLLMData, biasApplied: applyBias };
      })
    );
    
    const validFeedbacks = personaFeedbacks.filter(fb => fb && fb.persona && typeof fb.biasApplied === 'boolean');
    const likelihood = calculateConsensusLikelihood(validFeedbacks);

    return res.status(200).json({
      personaFeedbacks: validFeedbacks,
      consensusReport: {
        likelihoodToInvest: likelihood,
        summary: generateConsensusSummary(likelihood),
      },
      generatedExecutiveSummary: generatedExecutiveSummary, // Return AI-generated summary
      parsedDeckText: deckText, // Return parsed PDF text for debugging
    });

  } catch (error: any) {
    console.error('[API /generate-feedback] Feedback generation failed:', error);
    // Ensure the response type matches the generic parameter for NextApiResponse
    const errorResponse: { error: string; details?: string } = { 
        error: 'Internal Server Error', 
        details: error.message 
    };
    return res.status(500).json(errorResponse);
  }
}

// --- Helper Functions ---

// Updated buildPersonaPrompt to include deckContent and use the (potentially AI-generated) executiveSummary
function buildPersonaPrompt(
    persona: Persona, 
    data: any, 
    pitchDetails: any, // This now contains the AI-generated executive summary
    applyBias: boolean,
    deckContent: string // Added deckContent
): string {
  const pd = {
    fundingStage: pitchDetails.fundingStage || 'Seed',
    industry: pitchDetails.industry || 'Not specified',
    seekingAmount: pitchDetails.seekingAmount ? formatAmount(pitchDetails.seekingAmount) : 'Not specified',
    primaryRegion: pitchDetails.primaryRegion || 'Not specified',
    executiveSummary: pitchDetails.executiveSummary || 'Not provided' // This will be the AI-generated one
  };

  const biasInstruction = applyBias 
    ? `IMPORTANT: Despite logical analysis, your cognitive biases (${data.biases}) are strongly influencing you. Let these biases significantly shape your response, potentially leading to a less rational, more emotionally-driven feedback and verdict. Emphasize aspects that trigger these biases.`
    : "Provide a balanced and rational analysis based on your investor profile.";

  // Updated prompt to include Pitch Deck Content
  return `
You are simulating a venture capital investor named ${persona}.

Investor Profile:
- Investment Stage Focus: ${pd.fundingStage}
- Risk Appetite: ${data.riskAppetite}
- Decision-Making Style: ${data.decisionMakingStyle}
- Behavioral Inconsistencies: ${data.behavioralInconsistencies}
- Cognitive Biases: ${data.biases}

${biasInstruction}

Pitch Details (Provided by User & AI Refined Summary):
- Industry: ${pd.industry}
- Funding Stage: ${pd.fundingStage}
- Seeking Amount: $${pd.seekingAmount}
- Primary Region: ${pd.primaryRegion}
- Executive Summary: ${pd.executiveSummary}

Full Pitch Deck Content:
--- START OF PITCH DECK CONTENT ---
${deckContent}
--- END OF PITCH DECK CONTENT ---

Based on ALL the information above (Investor Profile, Pitch Details, and especially the Full Pitch Deck Content), provide your realistic investor analysis.
Focus your feedback on the substance of the pitch deck.

Respond *ONLY* with a valid JSON object in the following format (no other text, no markdown):
{
  "wouldTakeMeeting": "Yes/No",
  "strengths": ["strength 1 based on deck content", "strength 2 based on deck content", "strength 3 based on deck content"],
  "concerns": ["concern 1 based on deck content", "concern 2 based on deck content", "concern 3 based on deck content"],
  "emotionalTriggers": ["trigger 1", "trigger 2"],
  "verdict": "Invest / Pass / Monitor and Revisit Later"
}
`;
}

function parseLLMResponse(persona: Persona, content: string) {
  try {
    // Improved regex to catch JSON block that might not be perfectly formatted with triple backticks
    const jsonMatch = content.match(/\{([\s\S]*?)\}/);
    let jsonToParse = content;
    if (jsonMatch && jsonMatch[0]) {
        jsonToParse = jsonMatch[0];
    } else {
        // Fallback for cases where even the relaxed regex doesn't find a clear JSON object
        // This often happens if the LLM doesn't return valid JSON at all.
        if (!content.trim().startsWith('{') || !content.trim().endsWith('}')) {
            console.warn(`Content for ${persona} does not appear to be a JSON object: "${content}"`);
             // Attempt to find a JSON-like structure if it's embedded
            const relaxedJsonMatch = content.match(/\{[\s\S]*\}/m);
            if (relaxedJsonMatch && relaxedJsonMatch[0]) {
                jsonToParse = relaxedJsonMatch[0];
                console.log(`Relaxed JSON match found for ${persona}: "${jsonToParse}"`);
            } else {
                throw new Error("No clear JSON object found in response.");
            }
        }
    }
    
    const parsed = JSON.parse(jsonToParse);
    return { persona, ...parsed };
  } catch (e: any) { // Added type for e
    console.warn(`Failed to parse JSON response for ${persona}. Content: "${content}". Error: ${e.message}`);
    return {
      persona,
      biasApplied: false, // Ensure biasApplied is part of the fallback
      wouldTakeMeeting: 'No',
      strengths: ["Error parsing AI response from LLM."],
      concerns: ["Could not interpret AI output for this persona. The response might not have been valid JSON or was incomplete."],
      emotionalTriggers: [],
      verdict: 'Pass',
    };
  }
}

function calculateConsensusLikelihood(feedbacks: any[]) {
  let totalScore = 0;
  let totalWeight = 0;

  feedbacks.forEach((fb) => {
    const personaConfig = personaConfigs[fb.persona as Persona];
    if (personaConfig) {
      const weight = personaConfig.weight;
      const verdictScore = getVerdictScore(fb.verdict);
      totalScore += weight * verdictScore;
      totalWeight += weight; 
    }
  });

  if (totalWeight === 0) return 0; 
  return Math.round((totalScore / totalWeight) * 100);
}

function getVerdictScore(verdict?: string) {
  if (!verdict) return 0;
  if (verdict.includes('Invest')) return 1;
  if (verdict.includes('Monitor')) return 0.5;
  return 0;
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