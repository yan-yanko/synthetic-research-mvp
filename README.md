# Synthetic Research MVP

A platform for analyzing startup pitch decks and providing synthetic investor feedback.

## Overview

This MVP provides tools to analyze startup pitch decks and elevator pitches using synthetic investor personas. The system simulates the feedback different types of investors might provide, based on their investment preferences, behavioral traits, and communication styles. It also includes a follow-up simulation layer that enables a conversational experience with the synthetic investors.

## Key Features

- **PDF Pitch Deck Analysis**: Upload PDF pitch decks for detailed analysis
- **Elevator Pitch Text Analysis**: Provide text-based elevator pitches for quick feedback
- **Synthetic Investor Personas**: Multiple investor archetypes with different investment theses:
  - **Jordan**: Traction-Driven Operator focused on activation metrics and GTM execution
  - **Alex**: SaaS Category Expert concerned with vertical B2B problems and defensibility
  - **Ravi**: AI Skeptic who demands technical rigor and auditability
- **Detailed Feedback**: Per-slide analysis with sentiment and improvement suggestions
- **Investment Decision Simulation**: Get realistic assessment of investment potential
- **AI Panel Summary**: Aggregated feedback with consensus analysis across all personas
- **Follow-Up Simulations**: Respond to investor concerns and see how their stance changes

## Architecture

- **Frontend**: React components for displaying investor feedback
- **Core Engine**: TypeScript-based synthetic persona engine for feedback generation
- **LLM Integration**: Modular design for connecting to different LLM providers
- **Feedback Analysis**: Tools for extracting insights from investor feedback

## Components

### Core Files

- `personas/investorPersonas.ts` - Defines investor personas and their characteristics
- `generateInvestorFeedback.ts` - Main entry point for generating feedback
- `utils/buildPrompt.ts` - Constructs LLM prompts based on persona traits
- `utils/responseProcessing.ts` - Parses and structures LLM responses
- `utils/llmClient.ts` - Client for making API calls to language models
- `utils/summarizeInvestorPanel.ts` - Aggregates multi-persona feedback into consensus insights
- `utils/simulateFollowUp.ts` - Simulates investor responses to follow-up explanations

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
   ```
4. Start the development server: `npm run dev`

## Development

To extend with new investor personas, edit `personas/investorPersonas.ts` and add new persona objects with appropriate traits and investment theses.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Current Features

- Upload a **pitch deck (PDF)** and **elevator pitch (text)**
- Parse and analyze pitch materials
- Match to the most relevant **synthetic investor persona**
- Generate realistic feedback via GPT-4:
  - Strengths
  - Risks
  - Would they take the next meeting?

## Coming Soon

- Real-world VC and angel recommendations (via OpenVC / Crunchbase)
- Notion-style feedback export
- User authentication + saved feedback history
- Pricing plans (pay-per-feedback or credit system)

## Running the App Locally

### Prerequisites
- Node.js 18+
- `.env.local` file with:
```
OPENAI_API_KEY=sk-...
```

### Installation
```bash
npm install
```

### Start Backend
```bash
node server/index.js
```

### Start Frontend (Dev)
```bash
npm run dev
```

App runs at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:5001

## File Structure Overview

```
/server
  /routes
    upload.js          → Handles deck + pitch upload, GPT call
    simulate.js        → Early testing route (raw GPT queries)
  /utils
    investorSelector.js → Matches pitch content to investor profile

/interface_api (planned)
  audienceBuilder.js
  responseSimulator.js

/public
  /uploads             → Temporary file storage

.env.local             → Your OpenAI API key
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