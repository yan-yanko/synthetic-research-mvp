/**
 * Synthetic Persona Engine Module
 * 
 * This module provides tools for creating synthetic investor personas
 * and generating pitch deck feedback from their perspective.
 */

// Export core types
// export type { SyntheticInvestor } from './SyntheticInvestor';
export type { FeedbackObject, SlideReaction, OverallFeedback } from './FeedbackTypes';

// Export main functionality
import { generateFeedbackFromPersona } from './FeedbackGenerator';
import { PersonaLibrary } from './PersonaLibrary';

export { generateFeedbackFromPersona };
export { PersonaLibrary };

// Convenience function to get all available personas
export function getAllAvailablePersonas() {
  return PersonaLibrary.getAllPersonas();
}

// Convenience function to get a specific persona by ID
export function getPersonaById(id: string) {
  return PersonaLibrary.getPersonaById(id);
}

// Function to generate feedback using a persona ID
export function generateFeedbackWithPersonaId(
  pitchDeck: string,
  elevatorPitch: string,
  personaId: string
) {
  const persona = PersonaLibrary.getPersonaById(personaId);
  if (!persona) {
    throw new Error(`Persona with ID ${personaId} not found`);
  }
  
  return generateFeedbackFromPersona(pitchDeck, elevatorPitch, persona);
} 