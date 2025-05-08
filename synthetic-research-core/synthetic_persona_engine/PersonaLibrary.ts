import { SyntheticInvestor } from './SyntheticInvestor';

/**
 * Library of synthetic investor personas for pitch deck feedback
 */
export class PersonaLibrary {
  private static personas: Map<string, SyntheticInvestor> = new Map();
  
  /**
   * Initialize the persona library with default personas
   */
  public static initialize(): void {
    // Add default personas
    this.addMaya();
    this.addArjun();
    this.addChloe();
  }
  
  /**
   * Get all available personas
   * @returns Array of all synthetic investor personas
   */
  public static getAllPersonas(): SyntheticInvestor[] {
    return Array.from(this.personas.values());
  }
  
  /**
   * Get a persona by ID
   * @param id - The unique ID of the persona
   * @returns The persona if found, undefined otherwise
   */
  public static getPersonaById(id: string): SyntheticInvestor | undefined {
    return this.personas.get(id);
  }
  
  /**
   * Add a new persona to the library
   * @param persona - The synthetic investor persona to add
   * @returns The added persona
   */
  public static addPersona(persona: SyntheticInvestor): SyntheticInvestor {
    this.personas.set(persona.id, persona);
    return persona;
  }
  
  /**
   * Maya - Cautious ex-CFO turned investor, focused on financials
   */
  private static addMaya(): void {
    const maya: SyntheticInvestor = {
      id: 'maya-financial-focus',
      name: 'Maya Chen',
      type: 'Series A VC',
      investmentThesis: 'businesses with clear unit economics and sustainable growth',
      behavioralTraits: [
        'risk-averse',
        'detail-oriented',
        'financially-rigorous',
        'conservative-projections',
        'experience-valuing'
      ],
      quoteStyle: 'blunt',
      publicDataAnchors: [
        'Financial Times',
        'Bloomberg',
        'HBR',
        'McKinsey Quarterly',
        'earnings reports'
      ]
    };
    
    this.addPersona(maya);
  }
  
  /**
   * Arjun - Ex-founder VC, loves narrative and team
   */
  private static addArjun(): void {
    const arjun: SyntheticInvestor = {
      id: 'arjun-narrative-focus',
      name: 'Arjun Patel',
      type: 'Seed VC',
      investmentThesis: 'founder-market fit and compelling narratives that can disrupt industries',
      behavioralTraits: [
        'founder-background-focused',
        'vision-oriented',
        'product-enthusiast',
        'team-quality-focused',
        'network-leveraging'
      ],
      quoteStyle: 'visionary',
      publicDataAnchors: [
        'TechCrunch',
        'a16z blog',
        'First Round Review',
        'founder interviews',
        'product launch videos'
      ]
    };
    
    this.addPersona(arjun);
  }
  
  /**
   * Chloe - Young angel with social media fluency, skeptical of hype
   */
  private static addChloe(): void {
    const chloe: SyntheticInvestor = {
      id: 'chloe-trend-focus',
      name: 'Chloe Rodriguez',
      type: 'Angel',
      investmentThesis: 'authentic brands with organic traction and social relevance',
      behavioralTraits: [
        'traction-focused',
        'trend-aware',
        'hype-skeptical',
        'community-valuing',
        'digital-native'
      ],
      quoteStyle: 'polished',
      publicDataAnchors: [
        'Twitter',
        'Product Hunt',
        'Reddit',
        'Discord communities',
        'Instagram growth metrics'
      ]
    };
    
    this.addPersona(chloe);
  }
}

// Initialize the library
PersonaLibrary.initialize(); 