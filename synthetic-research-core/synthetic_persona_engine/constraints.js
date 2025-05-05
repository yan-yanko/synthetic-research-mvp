/**
 * constraints.js
 *
 * Defines and manages constraints for persona generation, such as demographic, behavioral, and psychographic limits.
 * Ensures generated personas fit research requirements and real-world distributions.
 */

// Implementation goes here 

/**
 * Ensures logical consistency in persona attributes.
 */
export function enforceConstraints(persona) {
  if (persona.age < 22 && persona.jobRole === 'VP') {
    persona.jobRole = 'Intern';
  }

  if (persona.incomeBracket === 'High' && persona.education === 'None') {
    persona.education = 'High School or Equivalent';
  }

  return persona;
} 