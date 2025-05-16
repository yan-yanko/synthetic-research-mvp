// import { SyntheticInvestor } from '../../../../types/personas';

export const SyntheticInvestorSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
      description: "Unique identifier for the investor persona"
    },
    name: {
      type: "string",
      description: "Name of the synthetic investor"
    },
    type: {
      type: "string",
      enum: ["Angel", "Seed VC", "Series A VC", "Corporate VC"],
      description: "Type of investor"
    },
    investmentThesis: {
      type: "string",
      description: "The investor's core philosophy and investment criteria"
    },
    behavioralTraits: {
      type: "array",
      items: {
        type: "string"
      },
      description: "List of behavioral characteristics that define the investor's decision-making style"
    },
    quoteStyle: {
      type: "string",
      enum: ["blunt", "polished", "visionary"],
      description: "Communication style of the investor"
    },
    publicDataAnchors: {
      type: "array",
      items: {
        type: "string"
      },
      description: "Sources that inform the investor\'s knowledge and perspective"
    },
    behaviorProfile: {
      type: "object",
      properties: {
        riskTolerance: {
          type: "number",
          minimum: 0,
          maximum: 1,
          description: "Investor\'s tolerance for risk, from 0 (risk-averse) to 1 (risk-seeking)"
        },
        temperature: {
          type: "number",
          minimum: 0,
          maximum: 2,
          description: "Controls randomness in LLM responses. Lower is more deterministic, higher is more creative."
        },
        industryBias: {
          type: "array",
          items: { "type": "string" },
          description: "List of industries the investor has a bias towards or against (can be used in prompt weighting)"
        },
        verbosityPreference: {
          type: "string",
          enum: ["concise", "default", "verbose"],
          description: "Preference for response length, influencing max_tokens. Optional."
        },
        riskAppetite: {
          type: "string",
          enum: ["Low", "Medium", "High"],
          description: "Qualitative risk appetite. Optional."
        }
      },
      required: ["riskTolerance", "temperature"],
      description: "Defines the behavioral profile for LLM interaction and prompt tuning."
    }
  },
  required: ["id", "name", "type", "investmentThesis", "behavioralTraits", "quoteStyle", "behaviorProfile"],
  additionalProperties: false
}; 