// import { SyntheticInvestor } from '../../../../types/personas';
import { FeedbackObject, SlideReaction, OverallFeedback } from './FeedbackTypes';

interface ParsedSlide {
  number: number;
  title?: string;
  content: string;
}

/**
 * Parses a pitch deck text into individual slides
 * @param pitchDeck - The text content of the pitch deck
 * @returns Array of parsed slides
 */
function parsePitchDeckIntoSlides(pitchDeck: string): ParsedSlide[] {
  if (!pitchDeck || pitchDeck.trim() === '') {
    return [];
  }

  // Simple slide parsing based on page breaks or slide markers
  // This is a basic implementation - real parsing would be more sophisticated
  const slideMarkers = pitchDeck.split(/(?:---|\n\s*\n\s*#|\n\s*Page\s+\d+\s*:\s*|\[Slide\s+\d+\])/gi);
  
  return slideMarkers
    .map((content, index) => {
      const trimmedContent = content.trim();
      if (!trimmedContent) return null;
      
      // Try to extract a title from the first line
      const lines = trimmedContent.split('\n');
      const possibleTitle = lines[0].trim();
      const slideContent = lines.length > 1 ? lines.slice(1).join('\n').trim() : trimmedContent;
      
      return {
        number: index + 1,
        title: possibleTitle.length < 100 ? possibleTitle : undefined,
        content: trimmedContent
      };
    })
    .filter((slide): slide is NonNullable<typeof slide> => slide !== null);
}

/**
 * Generates feedback for a specific slide based on the investor persona
 * @param slide - The parsed slide content
 * @param persona - The synthetic investor persona
 * @param elevatorPitch - Optional elevator pitch for context
 * @returns Feedback reaction for the slide
 */
function generateSlideReaction(
  slide: ParsedSlide, 
  persona: any, 
  elevatorPitch?: string
): SlideReaction {
  // Analysis would typically be performed by an LLM in a real implementation
  // This is a simplified version that creates feedback based on persona traits
  
  const isTitleSlide = slide.number === 1;
  const isFinancialSlide = slide.content.toLowerCase().includes('financial') || 
                          slide.content.toLowerCase().includes('revenue') ||
                          slide.content.toLowerCase().includes('funding');
  
  const isTeamSlide = slide.content.toLowerCase().includes('team') || 
                      slide.content.toLowerCase().includes('founder') ||
                      slide.content.toLowerCase().includes('experience');
  
  const isProductSlide = slide.content.toLowerCase().includes('product') || 
                         slide.content.toLowerCase().includes('solution') ||
                         slide.content.toLowerCase().includes('technology');
  
  const isMarketSlide = slide.content.toLowerCase().includes('market') || 
                        slide.content.toLowerCase().includes('tam') ||
                        slide.content.toLowerCase().includes('competition');
  
  // Generate sentiment based on investor traits and slide content
  let sentiment: 'positive' | 'neutral' | 'negative' | 'critical' = 'neutral';
  let feedback = '';
  let improvements: string[] = [];
  
  // Example logic for determining sentiment and feedback based on persona traits
  if (persona.behavioralTraits.includes('risk-averse') && isFinancialSlide) {
    sentiment = 'critical';
    feedback = `As ${persona.name}, I need to see more concrete financial projections with clear assumptions.`;
    improvements.push('Include detailed unit economics');
    improvements.push('Add sensitivity analysis for key assumptions');
  } else if (persona.behavioralTraits.includes('traction-focused') && slide.number > 1) {
    if (slide.content.toLowerCase().includes('traction') || 
        slide.content.toLowerCase().includes('customer') ||
        slide.content.toLowerCase().includes('growth')) {
      sentiment = 'positive';
      feedback = `The traction metrics here are compelling to me as ${persona.name}.`;
    } else {
      sentiment = 'neutral';
      feedback = `As ${persona.name}, I'm primarily interested in concrete traction metrics.`;
    }
  } else if (persona.type === 'Angel' && isTeamSlide) {
    sentiment = 'positive';
    feedback = `I value founder-market fit highly in my angel investments.`;
  } else if (persona.type === 'Series A VC' && isMarketSlide) {
    if (slide.content.toLowerCase().includes('billion')) {
      sentiment = 'critical';
      feedback = `Market size claims need more substantiation. As a Series A investor, I need to see a realistic path to significant market share.`;
      improvements.push('Break down TAM/SAM/SOM with clearer assumptions');
    }
  }
  
  // Default feedback if none of the specific conditions were met
  if (!feedback) {
    feedback = `Looking at this through my investment lens as ${persona.name}, ${
      persona.quoteStyle === 'blunt' ? 'I need more concrete evidence.' :
      persona.quoteStyle === 'polished' ? 'I would recommend refining this section with additional supporting data.' :
      'I can envision potential here, but want to see how this connects to the broader vision.'
    }`;
  }
  
  return {
    slideNumber: slide.number,
    slideTitle: slide.title,
    slideContent: slide.content,
    feedback,
    sentiment,
    suggestedImprovements: improvements.length > 0 ? improvements : undefined
  };
}

/**
 * Generates overall feedback based on the investor persona and all slide reactions
 * @param slideReactions - Array of slide-specific reactions
 * @param persona - The synthetic investor persona
 * @param elevatorPitch - Optional elevator pitch text
 * @returns Overall feedback and investment decision
 */
function generateOverallFeedback(
  slideReactions: SlideReaction[],
  persona: any,
  elevatorPitch?: string
): OverallFeedback {
  // Count sentiment distribution
  const sentimentCounts = {
    positive: slideReactions.filter(r => r.sentiment === 'positive').length,
    neutral: slideReactions.filter(r => r.sentiment === 'neutral').length,
    negative: slideReactions.filter(r => r.sentiment === 'negative').length,
    critical: slideReactions.filter(r => r.sentiment === 'critical').length,
  };
  
  // Extract all improvement suggestions
  const allImprovements = slideReactions
    .flatMap(r => r.suggestedImprovements || []);
  
  // Determine investment decision
  let investmentDecision: 'Highly Interested' | 'Interested with concerns' | 'Requires major changes' | 'Not interested';
  
  if (sentimentCounts.positive > (slideReactions.length / 2) && sentimentCounts.critical === 0) {
    investmentDecision = 'Highly Interested';
  } else if (sentimentCounts.positive + sentimentCounts.neutral > sentimentCounts.negative + sentimentCounts.critical) {
    investmentDecision = 'Interested with concerns';
  } else if (sentimentCounts.critical > (slideReactions.length / 3)) {
    investmentDecision = 'Not interested';
  } else {
    investmentDecision = 'Requires major changes';
  }
  
  // Analyze traits alignment with pitch content
  const alignsWithThesis = Math.random() > 0.5; // In a real implementation, this would be a real analysis
  
  // Generate strengths and concerns
  const strengthPoints: string[] = [];
  const concernPoints: string[] = [];
  
  // Add thesis alignment as either strength or concern
  if (alignsWithThesis) {
    strengthPoints.push(`Aligns with my investment thesis on ${persona.investmentThesis}`);
  } else {
    concernPoints.push(`Does not fully align with my focus on ${persona.investmentThesis}`);
  }
  
  // Add other strength/concerns based on slide reactions
  slideReactions.forEach(reaction => {
    if (reaction.sentiment === 'positive') {
      strengthPoints.push(`Strong ${reaction.slideTitle || `slide ${reaction.slideNumber}`}`);
    } else if (reaction.sentiment === 'critical') {
      concernPoints.push(`Issues with ${reaction.slideTitle || `slide ${reaction.slideNumber}`}: ${
        reaction.suggestedImprovements?.[0] || 'needs revision'}`);
    }
  });
  
  // Generate follow-up questions
  const followupQuestions: string[] = [
    `Can you elaborate on how you arrived at your ${Math.random() > 0.5 ? 'market size' : 'revenue'} estimates?`,
    `What is your biggest challenge in the next ${Math.random() > 0.5 ? '6' : '12'} months?`,
    `How do you plan to use the investment specifically?`
  ];
  
  // Add behavioral trait-specific questions
  if (persona.behavioralTraits.includes('risk-averse')) {
    followupQuestions.push('What are the biggest risks to your business model?');
  }
  if (persona.behavioralTraits.includes('traction-focused')) {
    followupQuestions.push('Can you share more detailed customer acquisition metrics?');
  }
  
  return {
    investmentDecision,
    decisionRationale: `As ${persona.name}, a ${persona.type} investor with focus on ${persona.investmentThesis}, ${
      investmentDecision === 'Highly Interested' 
        ? 'I find this pitch compelling and aligned with my investment criteria.' 
        : investmentDecision === 'Interested with concerns'
        ? 'I see potential but have some concerns that need to be addressed.'
        : investmentDecision === 'Requires major changes'
        ? 'I see fundamental issues that need to be addressed before I could consider investing.'
        : 'I don\'t see this as a fit for my investment profile.'
    }`,
    strengthPoints,
    concernPoints,
    followupQuestions
  };
}

/**
 * Generates comprehensive feedback from a synthetic investor persona based on pitch materials
 * @param pitchDeck - The text content of the pitch deck
 * @param elevatorPitch - Optional elevator pitch text
 * @param persona - The synthetic investor persona
 * @returns Complete feedback object with per-slide feedback and overall assessment
 */
export function generateFeedbackFromPersona(
  pitchDeck: string, 
  elevatorPitch: string, 
  persona: any
): FeedbackObject {
  const startTime = Date.now();
  
  // Parse pitch deck into slides
  const slides = parsePitchDeckIntoSlides(pitchDeck);
  
  // Generate reactions for each slide
  const slideReactions = slides.map(slide => 
    generateSlideReaction(slide, persona, elevatorPitch)
  );
  
  // Generate overall feedback
  const overall = generateOverallFeedback(slideReactions, persona, elevatorPitch);
  
  // Calculate processing time
  const processingTime = Date.now() - startTime;
  
  return {
    investorId: persona.id,
    investorName: persona.name,
    investorType: persona.type,
    timestamp: new Date().toISOString(),
    slideFeedback: slideReactions,
    overallFeedback: overall,
    processingMetadata: {
      totalSlides: slides.length,
      processingTimeMs: processingTime,
      elevatorPitchIncluded: !!elevatorPitch && elevatorPitch.trim() !== ''
    }
  };
} 