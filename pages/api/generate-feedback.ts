console.log('[API /generate-feedback] File execution started - ABSOLUTE TOP OF FILE V3');
import type { NextApiRequest, NextApiResponse } from 'next';
// Removed getInvestorFeedbackFromAI and mockData imports as they are no longer used by the new handler
import type { InvestorFeedbackResponse } from '../../types/feedback'; 
import OpenAI from 'openai';
// THIS FILE SHOULD HAVE NO OTHER IMPORT STATEMENTS (COMMENTED OR OTHERWISE)
// ESPECIALLY NO IMPORTS FROM '../../generateInvestorFeedback'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Persona = 'Angel Investor' | 'Analytical VC' | 'Impact Investor' | 'Institutional LP' | 'Growth Investor';

const personaConfigs: Record<Persona, any> = {
  'Angel Investor': { riskAppetite: 'High', biases: 'FOMO, Overconfidence', concerns: 'Founder Vision, Market Potential', weight: 0.2 },
  'Analytical VC': { riskAppetite: 'Moderate', biases: 'Status Quo Bias, Loss Aversion', concerns: 'Market Size, Data-Driven Proof', weight: 0.3 },
  'Impact Investor': { riskAppetite: 'Moderate', biases: 'Ethical Bias, FOMO', concerns: 'Social/Environmental Impact', weight: 0.1 },
  'Institutional LP': { riskAppetite: 'Low', biases: 'Loss Aversion, Status Quo Bias', concerns: 'Scalability, Risk Mitigation', weight: 0.2 },
  'Growth Investor': { riskAppetite: 'High', biases: 'FOMO, Herd Mentality', concerns: 'Revenue Growth, Market Leadership', weight: 0.2 },
};

type Data = {
  // feedback?: (FeedbackResponse | FeedbackError)[];
  message?: string; // Changed for test
  error?: string;
};

// console.log('[API /generate-feedback] File execution started - TOP OF FILE'); // REMOVE THIS LINE IF PRESENT

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Extract selectedPersonas and pitchDetails (everything else) from req.body
  const { deckUrl, selectedPersonas = Object.keys(personaConfigs), ...pitchDetails } = req.body;

  if (!deckUrl) {
    return res.status(400).json({ error: 'deckUrl is required.' });
  }

  try {
    const personaFeedbacks = await Promise.all(
      (selectedPersonas as Persona[]).map(async (persona: Persona) => {
        const personaData = personaConfigs[persona];
        if (!personaData) {
          console.warn(`Configuration for persona ${persona} not found. Skipping.`);
          // Return a value that can be filtered out or handled by parseLLMResponse
          return parseLLMResponse(persona, '{}'); // Effectively a fallback for this persona
        }
        // Pass the rest of req.body (pitchDetails) to buildPersonaPrompt
        const prompt = buildPersonaPrompt(persona, personaData, pitchDetails);

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800,
          temperature: 0.4,
        });

        const content = response.choices[0]?.message?.content || '';
        return parseLLMResponse(persona, content);
      })
    );
    
    const validFeedbacks = personaFeedbacks.filter(fb => fb && fb.persona);

    const likelihood = calculateConsensusLikelihood(validFeedbacks);

    return res.status(200).json({
      personaFeedbacks: validFeedbacks,
      consensusReport: {
        likelihoodToInvest: likelihood,
        summary: generateConsensusSummary(likelihood),
      },
    });

  } catch (error: any) {
    console.error('Feedback generation failed:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

// --- Helper Functions ---

function buildPersonaPrompt(persona: Persona, data: any, pitchDetails: any): string {
  const pd = {
    fundingStage: pitchDetails.fundingStage || 'Seed',
    industry: pitchDetails.industry || 'Not specified',
    seekingAmount: pitchDetails.seekingAmount ? formatAmount(pitchDetails.seekingAmount) : 'Not specified',
    primaryRegion: pitchDetails.primaryRegion || 'Not specified',
    executiveSummary: pitchDetails.executiveSummary || 'Not provided'
  };

  return `
You are simulating a venture capital investor named ${persona}.

Investor Profile:
- Investment Stage Focus: ${pd.fundingStage}
- Risk Appetite: ${data.riskAppetite}
- Cognitive Biases: ${data.biases}
- Primary Concerns: ${data.concerns}

Pitch Details:
- Industry: ${pd.industry}
- Funding Stage: ${pd.fundingStage}
- Seeking Amount: $${pd.seekingAmount}
- Primary Region: ${pd.primaryRegion}
- Executive Summary: ${pd.executiveSummary}

Respond *ONLY* with a valid JSON object in the following format (no other text, no markdown):
{
  "wouldTakeMeeting": "Yes/No",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "concerns": ["concern 1", "concern 2", "concern 3"],
  "emotionalTriggers": ["trigger 1", "trigger 2"],
  "verdict": "Invest / Pass / Monitor and Revisit Later"
}
`;
}

function parseLLMResponse(persona: Persona, content: string) {
  try {
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    const jsonToParse = jsonMatch ? jsonMatch[1] : content;
    const parsed = JSON.parse(jsonToParse);
    return { persona, ...parsed };
  } catch (e) {
    console.warn(`Failed to parse JSON response for ${persona}. Content: "${content}". Error: ${e}`);
    return {
      persona,
      wouldTakeMeeting: 'No',
      strengths: ["Error parsing AI response"],
      concerns: ["Could not interpret AI output for this persona."],
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