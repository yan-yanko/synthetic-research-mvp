import { investorPersonas as allPersonas } from '../personas/investorPersonas';
import type { SyntheticInvestor } from '../types/personas'; // Assuming SyntheticInvestor is the type in investorPersonas.ts

// Exporting the array directly
export const investorPersonas: SyntheticInvestor[] = allPersonas;

// Exporting the type. We need to ensure SyntheticInvestor is the correct type.
// If investorPersonas from the import is already correctly typed, we can infer.
// export type InvestorPersona = typeof allPersonas[number];
// Or more directly if SyntheticInvestor is the specific type used in the array:
export type InvestorPersona = SyntheticInvestor; 