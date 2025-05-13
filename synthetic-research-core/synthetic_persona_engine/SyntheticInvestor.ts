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
      description: "Sources that inform the investor's knowledge and perspective"
    }
  },
  required: ["id", "name", "type", "investmentThesis", "behavioralTraits", "quoteStyle"],
  additionalProperties: false
}; 