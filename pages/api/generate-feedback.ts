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
          // Include biasApplied: false (or a default) for consistency if needed, though it will be filtered by validFeedbacks
          return { persona, biasApplied: false, ...parseLLMResponse(persona, '{}') }; 
        }
        // Pass the rest of req.body (pitchDetails) to buildPersonaPrompt
        const applyBias = Math.random() < personaData.biasActivationChance;
        console.log(`[${persona}] Bias Applied: ${applyBias}`); 

        const prompt = buildPersonaPrompt(persona, personaData, pitchDetails, applyBias);
        console.log(`[API /generate-feedback] Prompt for ${persona}:\n${prompt}`);

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800,
          temperature: 0.4,
        });

        const content = response.choices[0]?.message?.content || '';
        const parsedLLMData = parseLLMResponse(persona, content);
        // Combine parsed LLM data with the biasApplied flag
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
    });

  } catch (error: any) {
    console.error('Feedback generation failed:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

// --- Helper Functions ---

function buildPersonaPrompt(persona: Persona, data: any, pitchDetails: any, applyBias: boolean): string {
  const pd = {
    fundingStage: pitchDetails.fundingStage || 'Seed',
    industry: pitchDetails.industry || 'Not specified',
    seekingAmount: pitchDetails.seekingAmount ? formatAmount(pitchDetails.seekingAmount) : 'Not specified',
    primaryRegion: pitchDetails.primaryRegion || 'Not specified',
    executiveSummary: pitchDetails.executiveSummary || 'Not provided'
  };

  const biasInstruction = applyBias 
    ? `IMPORTANT: Despite logical analysis, your cognitive biases (${data.biases}) are strongly influencing you. Let these biases significantly shape your response, potentially leading to a less rational, more emotionally-driven feedback and verdict. Emphasize aspects that trigger these biases.`
    : "Provide a balanced and rational analysis based on your investor profile.";

  return `
You are simulating a venture capital investor named ${persona}.

Investor Profile:
- Investment Stage Focus: ${pd.fundingStage}
- Risk Appetite: ${data.riskAppetite}
- Decision-Making Style: ${data.decisionMakingStyle}
- Behavioral Inconsistencies: ${data.behavioralInconsistencies}
- Cognitive Biases: ${data.biases}

${biasInstruction}

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
  "emotionalTriggers": ["trigger 1", "trigger 2"], // List specific emotions or biases activated
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
      strengths: ["Error parsing AI response from LLM."],
      concerns: ["Could not interpret AI output for this persona. The response might not have been valid JSON."],
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