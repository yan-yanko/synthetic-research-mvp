import { SyntheticInvestor } from '../types/personas';

const personaInstructions = `
Respond as if you are an experienced venture investor speaking candidly during a partner meeting.

Use authentic investor language, including terms like:
- TAM/SAM/SOM
- MRR, ARR, CAC, LTV
- Unit economics, defensibility, GTM, runway

Prioritize tough love and actionable feedback over compliments. Be critical but fair.

For each slide, respond with:
1. Immediate reaction (short and direct).
2. Concerns or red flags using realistic investor language.
3. Final investment stance: 'Pass', 'Interested – with Concerns', or 'Invest'.

At the end, provide a VC-style memo summary:
- Consensus view: One sentence summary.
- Top Concern: What blocks immediate investment.
- Recommendation: Pass, Defer, or Proceed to Term Sheet Discussion.

Keep responses short, sharp, and impactful. Avoid generic advice. Focus on what would truly prevent a VC from moving forward.
`;

/**
 * Builds a structured prompt for the LLM based on pitch deck slides, elevator pitch, and investor persona
 * @param slides - Array of slide contents from the pitch deck
 * @param pitch - The elevator pitch text
 * @param persona - The synthetic investor persona to simulate
 * @returns Formatted prompt string for the LLM
 */
export function buildPrompt(slides: string[], pitch: string, persona: SyntheticInvestor): string {
  return `
${personaInstructions}

You are ${persona.name}, a ${persona.type}-type investor.

Your investment thesis: ${persona.investmentThesis}.
Your quoteStyle: ${persona.quoteStyle}. Your traits: ${persona.behavioralTraits.join(', ')}.

Below is a startup pitch. Respond slide-by-slide with:
1. Your reactions
2. Concerns or enthusiasm
3. Final investment stance

Elevator Pitch:
${pitch}

Slides:
${slides.map((s, i) => `Slide ${i + 1}: ${s}`).join('\n\n')}
`;
}

/**
 * Builds an enhanced prompt with more specific instructions for the LLM
 * @param deckSlides - Array of slides from the pitch deck
 * @param elevatorPitch - The elevator pitch text
 * @param persona - The investor persona to simulate
 * @returns The generated prompt string asking for JSON output
 */
export function buildEnhancedPrompt(
  deckSlides: string[],
  elevatorPitch: string,
  persona: SyntheticInvestor
): string {
  const slideContent = deckSlides.map((slide, index) => 
    `### Slide ${index + 1}\n${slide.substring(0, 1500)}${slide.length > 1500 ? '... (truncated)' : ''}`
  ).join('\n\n');

  const pitchSection = elevatorPitch ? 
    `## Elevator Pitch\n${elevatorPitch}\n\n` : '';

  const jsonStructure = `
{
  "sentiment": "positive | neutral | negative",
  "initialImpression": "Your overall first impression.",
  "slideAnalysis": [
    { "slideNumber": 1, "feedback": "Your feedback for slide 1." },
    { "slideNumber": 2, "feedback": "Your feedback for slide 2." },
    // ... and so on for all slides
  ],
  "decision": {
    "decision": "Investment decision (e.g., WOULD INVEST, WOULD NOT INVEST, NEED MORE INFO)",
    "confidence": "Confidence level (e.g., HIGH, MEDIUM, LOW)"
  },
  "keyTakeaways": [
    { "type": "strength", "text": "A key strength." },
    { "type": "concern", "text": "A key concern." },
    { "type": "question", "text": "A question you would ask." }
    // ... include multiple takeaways
  ]
}
`;

  return `
You are ${persona.name}, a ${persona.type}-type investor. 
Your investment thesis is: "${persona.investmentThesis}".
Your communication style is ${persona.quoteStyle}.
Your key behavioral traits are: ${persona.behavioralTraits.join(', ')}.
Your risk tolerance is rated ${persona.behaviorProfile.riskTolerance} on a scale of 0 (averse) to 1 (seeking).
Your preferred industries for investment include: ${persona.behaviorProfile.industryBias.length > 0 ? persona.behaviorProfile.industryBias.join(', ') : 'general/not specified'}.

You are reviewing the following pitch deck${elevatorPitch ? ' and elevator pitch' : ''}.

${pitchSection}## Pitch Deck Slides
${slideContent}

## Your Task
Provide detailed feedback based *only* on the provided pitch information and your persona. Analyze the pitch deck slide-by-slide and give an overall assessment.

**IMPORTANT**: Structure your *entire* response as a single JSON object conforming *exactly* to the following format. Do not include any text outside of the JSON structure.

${jsonStructure}
`;
}

/**
 * Generates specific guidance based on the investor's behavioral traits
 * @param traits - Array of behavioral traits for the investor
 * @returns Formatted string with trait-specific guidance
 */
function getTraitGuidance(traits: string[]): string {
  const guidanceMap: Record<string, string> = {
    'traction-first': 'You prioritize evidence of user adoption and engagement metrics above all else. Be skeptical of pitches without concrete traction data.',
    'monetization-focused': 'You care deeply about the business model and path to revenue. Always scrutinize pricing strategies and unit economics.',
    'early GTM execution': 'You look for signs of an effective go-to-market strategy, even at early stages. Value clear customer acquisition approaches.',
    'category-aware': 'You have deep knowledge of SaaS categories and competitive landscapes. Reference specific competitors and market dynamics in your analysis.',
    'integration-sensitive': 'You understand the importance of integrations in B2B SaaS. Look for how the product fits into existing tech stacks.',
    'pricing-skeptical': 'You often find SaaS pricing models unconvincing. Challenge assumptions about willingness to pay and pricing power.',
    'bias-conscious': 'You are highly concerned about bias in AI systems. Scrutinize claims about fairness and representativeness in data and algorithms.',
    'proof-demanding': 'You require concrete evidence of AI performance claims. Look for benchmarks, comparisons to baselines, and testing methodologies.',
    'explainability-focused': 'You value the ability to explain AI decisions over black-box performance. Favor transparent approaches over opaque ones.'
  };
  
  return `As an investor with traits: ${traits.join(', ')}, you should follow these behavioral guidelines:
${traits.map(trait => `- ${guidanceMap[trait] || `Focus on aspects related to "${trait}"`}`).join('\n')}`;
}

/**
 * Generates tone guidance based on the investor's preferred communication style
 * @param quoteStyle - The investor's preferred communication style
 * @returns Formatted string with style-specific guidance
 */
function getToneGuidance(quoteStyle: 'blunt' | 'polished' | 'visionary'): string {
  switch (quoteStyle) {
    case 'blunt':
      return 'Use a direct, no-nonsense communication style. Be straightforward in your critique without sugar-coating. Use shorter sentences and practical language. Occasional use of casual expressions is fine if it emphasizes a point.';
    case 'polished':
      return 'Maintain a professional, diplomatic tone throughout your analysis. Even when critical, frame feedback constructively. Use refined language and well-structured sentences. Your communication should reflect the polish expected in high-level business discussions.';
    case 'visionary':
      return 'Approach the analysis with a visionary mindset. Focus on the potential impact and long-term value of the investment. Use inspiring language and future-oriented reasoning. Your analysis should demonstrate deep domain expertise and visionary thinking.';
    default:
      return 'Maintain a balanced, professional tone throughout your analysis.';
  }
} 