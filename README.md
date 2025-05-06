# Synthetic Investor Feedback Platform

## Purpose

This platform helps startup founders simulate high-quality investor feedback on their pitch materials. Founders can upload their elevator pitch and pitch deck, and the system returns structured, role-specific responses from synthetic VC personas.

This is not a toy. It's a fundraising decision-support engine built on top of LLMs, driven by real investor patterns, and designed to help founders clarify their pitch before stepping into real meetings.

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