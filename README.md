# Synthetic Research MVP

A platform for analyzing startup pitch decks and providing synthetic investor feedback.

## Overview

This MVP provides tools to analyze startup pitch decks and elevator pitches using synthetic investor personas. The system simulates the feedback different types of investors might provide, based on their investment preferences, behavioral traits, and communication styles. It also includes a follow-up simulation layer that enables a conversational experience with the synthetic investors.

## Key Features

- **PDF Pitch Deck Analysis**: Upload PDF pitch decks for detailed analysis (Note: PDF parsing is currently bypassed in the main API endpoint for debugging, using placeholder content instead).
- **Elevator Pitch Text Analysis**: Provide text-based elevator pitches for quick feedback
- **Synthetic Investor Personas**: Multiple investor archetypes with different investment theses:
  - **Jordan**: Traction-Driven Operator focused on activation metrics and GTM execution
  - **Alex**: SaaS Category Expert concerned with vertical B2B problems and defensibility
  - **Ravi**: AI Skeptic who demands technical rigor and auditability
- **Detailed Feedback**: Per-slide analysis with sentiment and improvement suggestions
- **Investment Decision Simulation**: Get realistic assessment of investment potential
- **AI Panel Summary**: Aggregated feedback with consensus analysis across all personas
- **Follow-Up Simulations**: Respond to investor concerns and see how their stance changes
- **LLM Integration**: Primarily uses OpenAI's gpt-4o via the `/api/generate-feedback` endpoint. Modular design for connecting to different LLM providers is a goal.
- **Feedback Analysis**: Tools for extracting insights from investor feedback.

## Architecture

- **Frontend**: React components for displaying investor feedback
- **Core Engine**: TypeScript-based synthetic persona engine for feedback generation
- **LLM Integration**: Modular design for connecting to different LLM providers
- **Feedback Analysis**: Tools for extracting insights from investor feedback

## Components

### Core Logic & API

- `pages/api/generate-feedback.ts`: Main Next.js API endpoint for receiving pitch data (deck content and elevator pitch), interacting with OpenAI for feedback generation based on selected personas, and returning structured feedback. Contains internal logic for prompt building and response parsing.
- `personas/investorPersonas.ts`: Defines detailed investor personas and their characteristics. (Note: The `/api/generate-feedback` endpoint currently uses an internal, simplified persona configuration that should be consolidated with this file).
- `synthetic-research-core/`: Contains foundational elements, including:
  - `synthetic_persona_engine/FeedbackGenerator.ts`: A rule-based feedback generation engine (currently separate from the primary LLM-based API flow).
  - `synthetic_persona_engine/PersonaLibrary.ts`: Utilities related to personas.
  - `FeedbackTypes.ts`: Defines data structures for feedback.
- `generateInvestorFeedback.ts` (root level): Currently a simplified placeholder and not integrated into the main API flow.

### UI Components

- `components/InvestorPanel.tsx` - Main component for displaying all investor feedback
- `components/FeedbackViewer.tsx` - Component for detailed feedback display
- `components/InvestorSummaryPanel.tsx` - Displays aggregated investor panel insights
- `components/FollowUpPanel.tsx` - Interface for responding to individual investor feedback

## Usage

### Basic Usage

```jsx
import { InvestorPanel } from '../components/InvestorPanel';

// Your pitch deck slides as an array of strings (one per slide)
const deckSlides = [
  'Introduction to Our Company',
  'The Problem We Solve',
  // ... more slides
];

// Your elevator pitch as a string
const elevatorPitch = "Our company transforms...";

// Render the panel
function PitchAnalysisPage() {
  return (
    <div>
      <h1>Investor Feedback</h1>
      <InvestorPanel 
        deckSlides={deckSlides} 
        elevatorPitch={elevatorPitch} 
      />
    </div>
  );
}
```

### Feedback Flow

1. **Initial Analysis**: Upload pitch deck and elevator pitch to get feedback from multiple investor personas
2. **Review Summary**: See aggregated insights across all personas in the AI Panel Summary
3. **Deep Dive**: Expand individual investor feedback to see detailed, slide-by-slide analysis
4. **Follow-Up**: Respond to specific investor concerns and see how their assessment changes
5. **Iterate**: Use insights to improve pitch materials and try again

### Customizing LLM Configuration

```jsx
import { generateInvestorFeedback } from '../generateInvestorFeedback';

// Custom configuration
const customConfig = {
  model: 'gpt-4-turbo',
  temperature: 0.8,
  apiKey: 'your-api-key'
};

// Generate feedback with custom config
const feedback = await generateInvestorFeedback(deckSlides, elevatorPitch, customConfig);
```

## Getting Started

### Prerequisites

- Node.js (14.x or higher)
- npm or yarn
- OpenAI API key (or other LLM provider)

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create an `.env.local` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your-api-key-here
   # NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api (if running frontend and backend separately and need to proxy)
   ```
4. Start the development server (Next.js): `npm run dev` (This typically runs both frontend and API routes on http://localhost:3000 or a similar port)

### Starting the Application (Alternative if running backend separately)

The main application is a Next.js app. `npm run dev` should suffice.
If you intend to run a separate Node.js backend (as mentioned in some older parts of this README), ensure it's configured correctly. The primary API is now served via Next.js API routes.

**Previous Backend Start Instructions (Review if needed):**
```bash
# node server/index.js # This might be for an older or separate backend.
```

### Start Frontend (Dev)
```bash
npm run dev
```

App runs at:
- Frontend & API: http://localhost:3000 (or as specified by `npm run dev`)
- (If separate backend): Backend API: http://localhost:5001 (ensure this is still relevant)

## File Structure Overview (Simplified for Next.js context)

```
/pages
  /api                       → Next.js API routes (e.g., generate-feedback.ts)
    generate-feedback.ts     → Main API endpoint for feedback generation
  _app.tsx                   → Main Next.js app component
  index.tsx                  → Landing page / main UI
/components                  → React components for UI
/personas                    → Investor persona definitions
  investorPersonas.ts
/synthetic-research-core     → Core TypeScript engine (partially integrated)
  /synthetic_persona_engine
/public                      → Static assets
/styles                      → Global styles
/lib                         → Client-side helper functions or libraries
/utils                       → General utility functions (consider for API helpers)
.env.local                   → Your OpenAI API key & other environment variables
next.config.js               → Next.js configuration
tsconfig.json                → TypeScript configuration
```

## Development Philosophy

- Keep core prompt structures modular
- Match to realistic personas (seed, angel, growth)
- Build general-purpose synthetic engine under a focused use case
- Avoid overfitting — every system component is adaptable to future verticals (e.g., buyer simulation, onboarding testing, product research)

## Status

- 🟢 Functional MVP complete: Upload + simulate investor response
- 🟡 Integration in progress: investor recommendation
- 🔴 Not started: user auth, export, pricing

## Contact

Built by Yan Yanko
https://www.yanyanko.com 

## Development Notes

### Error Logging

Frontend errors are logged via POST to `/api/log-error`:
- Captures message, stack, route, and input
- Stored in backend logs (console for now)

This helps debug production issues (like fetch failures or missing endpoints). 