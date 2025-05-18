# Legacy Code

This directory contains code that was part of earlier versions or experimental features of the Synthetic Research MVP and is currently not part of the main application flow.

## Contents

- **synthetic_persona_engine/**: Contains an earlier, rule-based engine for generating investor feedback. The main application now uses an LLM-based approach via the `/api/generate-feedback` endpoint.

## Purpose of this Directory

This code is kept for historical reference, potential future reuse of specific logic, or comparative analysis. It should not be considered part of the active, deployed application.

If you are looking for the current core logic for persona definitions and feedback generation, please refer to:
- `personas/investorPersonas.ts`
- `pages/api/generate-feedback.ts`
- `utils/persona.ts` 