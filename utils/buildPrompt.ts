import { SyntheticInvestor } from '../personas/investorPersonas';

/**
 * Builds a structured prompt for the LLM based on pitch deck slides, elevator pitch, and investor persona
 * @param slides - Array of slide contents from the pitch deck
 * @param pitch - The elevator pitch text
 * @param persona - The synthetic investor persona to simulate
 * @returns Formatted prompt string for the LLM
 */
export function buildPrompt(slides: string[], pitch: string, persona: SyntheticInvestor): string {
  return `
You are ${persona.name}, a ${persona.type}-type investor.

Your investment thesis: ${persona.investmentThesis}.
Your tone: ${persona.tone}. Your traits: ${persona.behavioralTraits.join(', ')}.

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
 * Enhanced version of the prompt builder with additional context and structured output format
 * @param slides - Array of slide contents from the pitch deck
 * @param pitch - The elevator pitch text
 * @param persona - The synthetic investor persona to simulate
 * @returns Formatted prompt string for the LLM with structured output instructions
 */
export function buildEnhancedPrompt(slides: string[], pitch: string, persona: SyntheticInvestor): string {
  // Add more detailed instructions for persona behavior based on traits
  const traitGuidance = getTraitGuidance(persona.behavioralTraits);
  
  // Add tone guidance based on persona's tone preference
  const toneGuidance = getToneGuidance(persona.tone);
  
  return `
You are ${persona.name}, a ${persona.type}-type investor with the following investment thesis:
"${persona.investmentThesis}"

${traitGuidance}

${toneGuidance}

You are evaluating a startup pitch. Your task is to provide authentic feedback as if you were really this investor.

FORMAT YOUR RESPONSE IN THIS EXACT STRUCTURE:
----------------------------------------------

## Initial Impression
[Your first impression based on the elevator pitch]

## Slide-by-Slide Analysis
${slides.map((_, i) => `### Slide ${i + 1}\n[Your reaction to this slide, highlighting strengths or concerns aligned with your investment thesis and traits]`).join('\n\n')}

## Investment Decision
- Decision: [WOULD INVEST | WOULD NOT INVEST | NEED MORE INFORMATION]
- Confidence: [HIGH | MEDIUM | LOW]
- Key Strengths: [List 2-3 key strengths]
- Key Concerns: [List 2-3 key concerns]
- Questions I Would Ask: [List 3 follow-up questions]

----------------------------------------------

ELEVATOR PITCH:
${pitch}

PITCH DECK SLIDES:
${slides.map((s, i) => `SLIDE ${i + 1}:\n${s}`).join('\n\n')}
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
 * @param tone - The investor's preferred tone
 * @returns Formatted string with tone-specific guidance
 */
function getToneGuidance(tone: 'blunt' | 'polished' | 'intellectual'): string {
  switch (tone) {
    case 'blunt':
      return 'Use a direct, no-nonsense communication style. Be straightforward in your critique without sugar-coating. Use shorter sentences and practical language. Occasional use of casual expressions is fine if it emphasizes a point.';
    case 'polished':
      return 'Maintain a professional, diplomatic tone throughout your analysis. Even when critical, frame feedback constructively. Use refined language and well-structured sentences. Your communication should reflect the polish expected in high-level business discussions.';
    case 'intellectual':
      return 'Approach the analysis with academic rigor and depth. Reference relevant frameworks, research, or theoretical concepts where appropriate. Use precise terminology and sophisticated reasoning. Your analysis should demonstrate deep domain expertise and systematic thinking.';
    default:
      return 'Maintain a balanced, professional tone throughout your analysis.';
  }
} 