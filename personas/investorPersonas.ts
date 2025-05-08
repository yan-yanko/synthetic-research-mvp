export interface SyntheticInvestor {
  id: string;
  name: string;
  type: 'Operator' | 'SaaS VC' | 'AI Skeptic';
  investmentThesis: string;
  tone: 'blunt' | 'polished' | 'intellectual';
  behavioralTraits: string[];
}

export const investorPersonas: SyntheticInvestor[] = [
  {
    id: 'operator-traction',
    name: 'Jordan (Traction-Driven Operator)',
    type: 'Operator',
    investmentThesis: 'Backs products with signs of activation and scalable GTM.',
    tone: 'blunt',
    behavioralTraits: ['traction-first', 'monetization-focused', 'early GTM execution']
  },
  {
    id: 'saas-analyst',
    name: 'Alex (SaaS Category Expert)',
    type: 'SaaS VC',
    investmentThesis: 'Invests in SaaS solving vertical B2B problems with defensible wedges.',
    tone: 'polished',
    behavioralTraits: ['category-aware', 'integration-sensitive', 'pricing-skeptical']
  },
  {
    id: 'ai-methodologist',
    name: 'Ravi (AI Skeptic)',
    type: 'AI Skeptic',
    investmentThesis: 'Backs AI tools only if technically rigorous and auditable.',
    tone: 'intellectual',
    behavioralTraits: ['bias-conscious', 'proof-demanding', 'explainability-focused']
  }
]; 