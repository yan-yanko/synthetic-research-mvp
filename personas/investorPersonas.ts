import { SyntheticInvestor } from '../types/personas';

export const investorPersonas: SyntheticInvestor[] = [
  {
    id: 'operator-traction',
    name: 'Jordan (Traction-Driven Operator)',
    type: 'Operator',
    investmentThesis: 'Backs products with signs of activation and scalable GTM.',
    behavioralTraits: ['traction-first', 'monetization-focused', 'early GTM execution'],
    quoteStyle: 'blunt',
    publicDataAnchors: [],
    behaviorProfile: {
      riskTolerance: 0.6,
      temperature: 0.7,
      industryBias: ["e-commerce", "marketplaces"],
      verbosityPreference: 'default',
      riskAppetite: 'Medium',
    },
  },
  {
    id: 'saas-analyst',
    name: 'Alex (SaaS Category Expert)',
    type: 'SaaS VC',
    investmentThesis: 'Invests in SaaS solving vertical B2B problems with defensible wedges.',
    behavioralTraits: ['category-aware', 'integration-sensitive', 'pricing-skeptical'],
    quoteStyle: 'polished',
    publicDataAnchors: [],
    behaviorProfile: {
      riskTolerance: 0.4,
      temperature: 0.5,
      industryBias: ["B2B SaaS", "Fintech"],
      verbosityPreference: 'default',
      riskAppetite: 'Medium',
    },
  },
  {
    id: 'ai-methodologist',
    name: 'Ravi (AI Skeptic)',
    type: 'AI Skeptic',
    investmentThesis: 'Backs AI tools only if technically rigorous and auditable.',
    behavioralTraits: ['bias-conscious', 'proof-demanding', 'explainability-focused'],
    quoteStyle: 'visionary',
    publicDataAnchors: [],
    behaviorProfile: {
      riskTolerance: 0.2,
      temperature: 0.3,
      industryBias: ["AI Ethics", "Explainable AI", "Healthcare AI"],
      verbosityPreference: 'verbose',
      riskAppetite: 'Low',
    },
  }
]; 