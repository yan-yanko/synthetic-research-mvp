import { FeedbackResponse } from '../generateInvestorFeedback';

interface SummarySentiment {
  positive: number;
  neutral: number;
  negative: number;
}

export interface InvestorSummary {
  consensusStatement: string;
  sentimentSummary: SummarySentiment;
  topConcerns: string[];
  topStrengths: string[];
  investmentLikelihood: number; // 0-100 scale
  recommendedNextSteps: string[];
}

/**
 * Summarizes feedback from multiple investor personas into a consolidated view
 * @param feedbackResponses - Array of feedback responses from different personas
 * @returns Consolidated summary of all feedback
 */
export function summarizeInvestorPanel(feedbackResponses: FeedbackResponse[]): InvestorSummary {
  if (!feedbackResponses || feedbackResponses.length === 0) {
    return {
      consensusStatement: "No feedback available to summarize.",
      sentimentSummary: { positive: 0, neutral: 0, negative: 0 },
      topConcerns: [],
      topStrengths: [],
      investmentLikelihood: 0,
      recommendedNextSteps: []
    };
  }

  // Count sentiments
  const sentimentSummary: SummarySentiment = {
    positive: 0,
    neutral: 0,
    negative: 0
  };
  
  feedbackResponses.forEach(response => {
    sentimentSummary[response.sentiment]++;
  });
  
  // Collect all concerns and strengths
  const allConcerns = feedbackResponses.flatMap(response => 
    response.keyTakeaways
      .filter(item => item.type === 'concern')
      .map(item => item.text)
  );
  
  const allStrengths = feedbackResponses.flatMap(response => 
    response.keyTakeaways
      .filter(item => item.type === 'strength')
      .map(item => item.text)
  );
  
  // Find the most common concerns and strengths
  const topConcerns = findMostCommonItems(allConcerns, 3);
  const topStrengths = findMostCommonItems(allStrengths, 3);
  
  // Calculate investment likelihood
  const investmentDecisions = feedbackResponses.map(response => {
    const decision = response.decision.decision;
    const confidence = response.decision.confidence;
    
    // Convert decision to numeric score
    let score = 0;
    if (decision.includes('WOULD INVEST')) {
      score = 100;
    } else if (decision.includes('NEED MORE INFORMATION')) {
      score = 50;
    } else if (decision.includes('WOULD NOT INVEST')) {
      score = 0;
    }
    
    // Adjust by confidence
    if (confidence === 'LOW') {
      score = Math.abs(score - 50) * 0.5 + 50;
    } else if (confidence === 'MEDIUM') {
      score = Math.abs(score - 50) * 0.75 + 50;
    }
    
    return score;
  });
  
  const averageInvestmentLikelihood = Math.round(
    investmentDecisions.reduce((sum, score) => sum + score, 0) / investmentDecisions.length
  );
  
  // Generate consensus statement
  const consensusStatement = generateConsensusStatement(
    sentimentSummary, 
    topStrengths, 
    topConcerns, 
    averageInvestmentLikelihood,
    feedbackResponses
  );
  
  // Generate recommended next steps
  const recommendedNextSteps = generateNextSteps(
    feedbackResponses, 
    averageInvestmentLikelihood
  );
  
  return {
    consensusStatement,
    sentimentSummary,
    topConcerns,
    topStrengths,
    investmentLikelihood: averageInvestmentLikelihood,
    recommendedNextSteps
  };
}

/**
 * Finds the most common items in an array
 * @param items - Array of items to analyze
 * @param limit - Maximum number of items to return
 * @returns Array of most common items
 */
function findMostCommonItems(items: string[], limit: number): string[] {
  const counts = new Map<string, number>();
  
  // Count occurrences of each item
  items.forEach(item => {
    const normalized = item.toLowerCase().trim();
    counts.set(normalized, (counts.get(normalized) || 0) + 1);
  });
  
  // Create array of [item, count] pairs
  const pairs = Array.from(counts.entries());
  
  // Sort by count (descending)
  pairs.sort((a, b) => b[1] - a[1]);
  
  // Find the original case version for each top item
  return pairs.slice(0, limit).map(([normalized]) => {
    // Find the first original item that matches this normalized version
    return items.find(item => item.toLowerCase().trim() === normalized) || normalized;
  });
}

/**
 * Generates a consensus statement based on the summary data
 */
function generateConsensusStatement(
  sentimentSummary: SummarySentiment,
  topStrengths: string[],
  topConcerns: string[],
  investmentLikelihood: number,
  feedbackResponses: FeedbackResponse[]
): string {
  // Determine overall sentiment
  const totalResponses = sentimentSummary.positive + sentimentSummary.neutral + sentimentSummary.negative;
  let overallSentiment: string;
  
  if (sentimentSummary.positive > totalResponses / 2) {
    overallSentiment = 'positive';
  } else if (sentimentSummary.negative > totalResponses / 2) {
    overallSentiment = 'negative';
  } else {
    overallSentiment = 'mixed';
  }
  
  // Generate investment stance
  let investmentStance: string;
  if (investmentLikelihood >= 80) {
    investmentStance = 'strongly interested in investing';
  } else if (investmentLikelihood >= 60) {
    investmentStance = 'cautiously interested in investing';
  } else if (investmentLikelihood >= 40) {
    investmentStance = 'undecided about investing';
  } else if (investmentLikelihood >= 20) {
    investmentStance = 'leaning against investing';
  } else {
    investmentStance = 'not interested in investing';
  }
  
  // Get persona types for context
  const personaTypes = feedbackResponses.map(r => r.personaType);
  const uniquePersonaTypes = Array.from(new Set(personaTypes));
  
  // Construct the consensus statement
  let statement = `The investor panel of ${feedbackResponses.length} personas (${uniquePersonaTypes.join(', ')}) has a ${overallSentiment} outlook and is ${investmentStance}. `;
  
  // Add strength highlight
  if (topStrengths.length > 0) {
    statement += `They agree that the strongest aspect is "${topStrengths[0]}". `;
  }
  
  // Add concern highlight
  if (topConcerns.length > 0) {
    statement += `The most common concern is "${topConcerns[0]}". `;
  }
  
  return statement;
}

/**
 * Generates recommended next steps based on feedback and investment likelihood
 */
function generateNextSteps(
  feedbackResponses: FeedbackResponse[],
  investmentLikelihood: number
): string[] {
  const allQuestions = feedbackResponses.flatMap(response => 
    response.keyTakeaways
      .filter(item => item.type === 'question')
      .map(item => item.text)
  );
  
  const topQuestions = findMostCommonItems(allQuestions, 2);
  
  const nextSteps: string[] = [];
  
  // Always good to address top questions
  topQuestions.forEach(question => {
    nextSteps.push(`Prepare answers for: "${question}"`);
  });
  
  // Add steps based on investment likelihood
  if (investmentLikelihood >= 70) {
    nextSteps.push('Prepare for due diligence and follow-up meetings');
  } else if (investmentLikelihood >= 40) {
    nextSteps.push('Strengthen pitch by addressing the top concerns');
    nextSteps.push('Gather more data to support key claims');
  } else {
    nextSteps.push('Consider pivoting or substantially revising your business model');
    nextSteps.push('Gather market validation before approaching investors again');
  }
  
  return nextSteps;
} 