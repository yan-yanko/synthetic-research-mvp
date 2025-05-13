/**
 * Utility functions for processing LLM-generated investor feedback responses
 */

type Sentiment = 'positive' | 'neutral' | 'negative';

interface Highlight {
  type: 'strength' | 'concern' | 'question';
  text: string;
}

/**
 * Extracts the overall sentiment from an investor response
 * @param response - The full LLM-generated investor feedback
 * @returns The overall sentiment classification
 */
export function extractSentiment(response: string): Sentiment {
  // Basic sentiment analysis based on keyword frequency
  const positiveKeywords = [
    'would invest', 'impressed', 'strong', 'excellent', 'compelling', 
    'promising', 'interested', 'excited', 'potential', 'opportunity'
  ];
  
  const negativeKeywords = [
    'would not invest', 'concerned', 'weak', 'unclear', 'problematic', 
    'unconvincing', 'skeptical', 'risky', 'insufficient', 'lacking'
  ];
  
  // Count occurrences of keywords
  const positiveCount = positiveKeywords.reduce((count, keyword) => {
    return count + (response.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
  }, 0);
  
  const negativeCount = negativeKeywords.reduce((count, keyword) => {
    return count + (response.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
  }, 0);
  
  // Determine sentiment based on keyword counts
  if (positiveCount > negativeCount * 1.5) {
    return 'positive';
  } else if (negativeCount > positiveCount * 1.5) {
    return 'negative';
  } else {
    return 'neutral';
  }
}

/**
 * Extracts key highlights (strengths, concerns, questions) from the investor response
 * @param response - The full LLM-generated investor feedback
 * @returns Array of structured highlights
 */
export function extractHighlights(response: string): Highlight[] {
  const highlights: Highlight[] = [];
  
  // Extract strengths
  const strengthsSection = response.match(/Key Strengths:\s*\[([\s\S]*?)\]/);
  if (strengthsSection && strengthsSection[1]) {
    const strengths = strengthsSection[1].split(',').map(s => s.trim());
    strengths.forEach(strength => {
      if (strength) {
        highlights.push({
          type: 'strength',
          text: strength
        });
      }
    });
  }
  
  // Extract concerns
  const concernsSection = response.match(/Key Concerns:\s*\[([\s\S]*?)\]/);
  if (concernsSection && concernsSection[1]) {
    const concerns = concernsSection[1].split(',').map(s => s.trim());
    concerns.forEach(concern => {
      if (concern) {
        highlights.push({
          type: 'concern',
          text: concern
        });
      }
    });
  }
  
  // Extract questions
  const questionsSection = response.match(/Questions I Would Ask:\s*\[([\s\S]*?)\]/);
  if (questionsSection && questionsSection[1]) {
    const questions = questionsSection[1].split(',').map(s => s.trim());
    questions.forEach(question => {
      if (question) {
        highlights.push({
          type: 'question',
          text: question
        });
      }
    });
  }
  
  return highlights;
}

/**
 * Extracts the investment decision from the response
 * @param response - The full LLM-generated investor feedback
 * @returns The investment decision and confidence level
 */
export function extractDecision(response: string): { decision: string; confidence: string } {
  const decisionMatch = response.match(/Decision:\s*\[(.*?)\]/);
  const confidenceMatch = response.match(/Confidence:\s*\[(.*?)\]/);
  
  return {
    decision: decisionMatch?.[1] || 'NEED MORE INFORMATION',
    confidence: confidenceMatch?.[1] || 'MEDIUM'
  };
}

/**
 * Parses the slide-by-slide analysis into a structured format
 * @param response - The full LLM-generated investor feedback
 * @returns Map of slide numbers to feedback text
 */
export function parseSlideAnalysis(response: string): Map<number, string> {
  const slideAnalysis = new Map<number, string>();
  
  // Match all slide sections - manually process instead of using regex with /s flag
  const sections = response.split('### Slide ');
  
  // Skip the first split result as it's the text before "### Slide 1"
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    // Extract slide number from the beginning of the section
    const slideNumberMatch = section.match(/^(\d+)/);
    
    if (slideNumberMatch) {
      const slideNumber = parseInt(slideNumberMatch[1], 10);
      
      // Get text until the next section marker or end
      const feedbackEndIndex = section.indexOf('###') > -1 ? 
                                section.indexOf('###') : 
                                section.indexOf('## ') > -1 ? 
                                section.indexOf('## ') : 
                                section.length;
      
      // Extract feedback text after slide number
      const restOfSection = section.substring(slideNumberMatch[0].length).trim();
      const feedback = restOfSection.substring(0, feedbackEndIndex > -1 ? 
                                              feedbackEndIndex - slideNumberMatch[0].length : 
                                              undefined).trim();
      
      if (!isNaN(slideNumber) && feedback) {
        slideAnalysis.set(slideNumber, feedback);
      }
    }
  }
  
  return slideAnalysis;
}

/**
 * Extracts the initial impression from the investor response
 * @param response - The full LLM-generated investor feedback
 * @returns The initial impression text
 */
export function extractInitialImpression(response: string): string {
  const sectionStart = response.indexOf('## Initial Impression');
  if (sectionStart === -1) return '';
  
  const sectionEnd = response.indexOf('##', sectionStart + 1);
  const impressionText = sectionEnd > -1 ?
                        response.substring(sectionStart + '## Initial Impression'.length, sectionEnd) :
                        response.substring(sectionStart + '## Initial Impression'.length);
  
  return impressionText.trim();
}

/**
 * Types related to processing LLM-generated investor feedback responses.
 * Assumes the LLM provides a response parsable as JSON conforming to the FeedbackResponseStructure.
 */

// Types are now primarily defined in ../types/feedback.ts
// This file can be removed or used for future validation logic if needed.

// Example type (matching expected JSON structure - ensure this aligns with ../types/feedback.ts FeedbackResponse)

export interface FeedbackResponseStructure {
  sentiment: 'positive' | 'neutral' | 'negative';
  initialImpression: string;
  slideAnalysis: { slideNumber: number; feedback: string }[];
  decision: {
    decision: string;
    confidence: string;
  };
  keyTakeaways: {
    type: 'strength' | 'concern' | 'question';
    text: string;
  }[];
}

// Parsing is now done directly in generateInvestorFeedback.ts using JSON.parse
// Exporting the structure type might still be useful. 