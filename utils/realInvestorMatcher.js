/**
 * matchRealInvestors
 * 
 * Purpose: Matches startup description to a filtered list of real-world VCs or angels.
 * 
 * Input: {
 *   vertical: string,
 *   stage: string,
 *   model: string
 * }
 */

const INVESTOR_DB = [
  {
    name: "First Round Capital",
    focus: ["b2b", "marketplaces"],
    stage: "seed",
    model: "b2b",
    thesis: "We back product-focused founders building platform-shifting companies.",
    link: "https://firstround.com/"
  },
  {
    name: "Initialized Capital",
    focus: ["ai", "developer tools"],
    stage: "pre-seed",
    model: "b2b",
    thesis: "We invest early in technical founders building industry-defining software.",
    link: "https://initialized.com/"
  },
  {
    name: "Floodgate",
    focus: ["consumer", "marketplaces"],
    stage: "seed",
    model: "b2c",
    thesis: "We believe in unreasonably ambitious founders disrupting saturated markets.",
    link: "https://floodgate.com/"
  }
];

export function matchRealInvestors({ vertical, stage, model }) {
  return INVESTOR_DB.filter((inv) => {
    return (
      inv.focus.includes(vertical.toLowerCase()) &&
      inv.stage === stage.toLowerCase() &&
      inv.model === model.toLowerCase()
    );
  });
} 