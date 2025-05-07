import { FeedbackItem } from '../components/FeedbackViewer';

/**
 * Analyzes the sentiment of investor feedback
 * @param feedback The feedback item to analyze
 * @returns Sentiment classification as 'Positive', 'Neutral', or 'Negative'
 */
export function summarizeSentiment(feedback: FeedbackItem): 'Positive' | 'Neutral' | 'Negative' {
  // Simple heuristic: compare strengths vs concerns
  if (!feedback) return 'Neutral';
  
  const strengths = feedback.strengths?.length || 0;
  const concerns = feedback.concerns?.length || 0;
  
  // Check recommendation text for sentiment words
  const recommendation = feedback.recommendation?.toLowerCase() || '';
  const positiveWords = ['yes', 'would', 'interested', 'excited', 'compelling', 'strong'];
  const negativeWords = ['no', 'wouldn\'t', 'pass', 'concern', 'risk', 'weak', 'insufficient'];
  
  let positiveScore = strengths;
  let negativeScore = concerns;
  
  // Add weight from the recommendation text
  positiveWords.forEach(word => {
    if (recommendation.includes(word)) positiveScore += 1;
  });
  
  negativeWords.forEach(word => {
    if (recommendation.includes(word)) negativeScore += 1;
  });
  
  // Determine final sentiment
  if (positiveScore > negativeScore + 1) {
    return 'Positive';
  } else if (negativeScore > positiveScore + 1) {
    return 'Negative';
  } else {
    return 'Neutral';
  }
}

/**
 * Extracts key highlights from feedback
 * @param feedback The feedback item to extract from
 * @returns Object containing the most compelling slide and main concern
 */
export function extractHighlights(feedback: FeedbackItem): {
  compellingSlide: string;
  concern: string;
} {
  if (!feedback) {
    return { compellingSlide: '', concern: '' };
  }
  
  // Find the most compelling slide based on relevance scores
  let topSlide = '';
  let topScore = 0;
  
  if (feedback.slides) {
    for (const [slideName, data] of Object.entries(feedback.slides)) {
      if (data.relevance > topScore) {
        topScore = data.relevance;
        topSlide = slideName;
      }
    }
  }
  
  // Get the first strength as the compelling point if no slides data
  if (!topSlide && feedback.strengths && feedback.strengths.length > 0) {
    topSlide = feedback.strengths[0];
  }
  
  // Get the first concern as the main issue
  const mainConcern = feedback.concerns && feedback.concerns.length > 0 
    ? feedback.concerns[0] 
    : '';
  
  return {
    compellingSlide: topSlide,
    concern: mainConcern
  };
}

/**
 * Formats the feedback data for display
 * @param rawFeedback Raw feedback data from API
 * @returns Formatted feedback items
 */
export function formatFeedbackData(rawFeedback: any): FeedbackItem[] {
  if (!rawFeedback || !Array.isArray(rawFeedback)) {
    return [];
  }
  
  return rawFeedback.map((item, index) => {
    // Ensure the item has a proper structure
    return {
      id: item.id || `feedback-${index}`,
      persona: item.persona || 'Anonymous Investor',
      feedback: item.feedback || '',
      strengths: Array.isArray(item.strengths) ? item.strengths : [],
      concerns: Array.isArray(item.concerns) ? item.concerns : [],
      recommendation: item.recommendation || '',
      slides: item.slides || {}
    };
  });
} 