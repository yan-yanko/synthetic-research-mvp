# Project Overview: Synthetic Research MVP

## 1. Project Goal & Vision

The Synthetic Research MVP is a platform designed to provide startup founders with realistic, actionable feedback on their pitch decks and elevator pitches. It simulates how different investor personas might react to a pitch, helping founders refine their materials and strategy before engaging with actual investors.

The vision is to create a comprehensive toolkit that empowers entrepreneurs with AI-driven insights, improving their pitching skills and increasing their chances of securing funding.

## 2. Target Audience

- Startup founders and entrepreneurs preparing to raise capital.
- Incubators and accelerators looking to provide value-added services to their cohorts.

## 3. Key Features & Functionalities

- **Pitch Material Upload**: Users can upload their pitch deck (currently expecting PDF, though parsing is temporarily bypassed in the API) and input their elevator pitch text.
- **Synthetic Investor Personas**: The system utilizes multiple, distinct investor archetypes (e.g., Traction-Driven Operator, SaaS Category Expert, AI Skeptic). Each persona has defined investment theses, behavioral traits, and communication styles.
- **AI-Generated Feedback**: Leveraging Large Language Models (currently OpenAI's gpt-4o via a Next.js API endpoint at `/api/generate-feedback`), the platform generates:
    - Per-slide analysis (intended, pending full PDF parsing integration).
    - Overall strengths and weaknesses of the pitch.
    - Potential questions the investor might ask.
    - An assessment of investment interest (e.g., likelihood to take the next meeting).
- **Consensus Reporting**: Aggregated feedback and a consensus view from the panel of synthetic investors.
- **Executive Summary Generation**: AI-generated executive summary of the pitch (currently dependent on PDF parsing).
- **(Planned/Future)**: Follow-up interaction simulations, integration with real-world VC data, feedback export, user accounts.

## 4. Technology Stack (Current & Key Components)

- **Frontend**: Next.js/React (TypeScript/TSX) for UI components and displaying feedback.
- **Backend/API**: Next.js API Routes (TypeScript) handle requests, interact with LLMs, and process data.
    - Main Endpoint: `/api/generate-feedback`
- **LLM**: OpenAI API (gpt-4o is currently used).
- **Core Logic**: TypeScript for persona definitions (`personas/investorPersonas.ts`) and underlying simulation logic (partially in `synthetic-research-core/`).
- **Environment**: Node.js.

## 5. High-Level Architecture

1.  **Client (Browser)**: User uploads pitch deck (as base64) and elevator pitch text via a web interface.
2.  **Next.js API (`/api/generate-feedback`)**: 
    - Receives the pitch materials and selected personas.
    - (Intended) Parses PDF deck content to text (currently bypassed).
    - (Intended) Generates an executive summary from deck content (currently bypassed).
    - For each selected persona:
        - Constructs a detailed prompt incorporating pitch materials and persona characteristics.
        - Sends the prompt to the OpenAI API.
        - Receives and parses the LLM's response.
    - Aggregates feedback from all personas and generates a consensus report.
    - Returns the structured feedback to the client.
3.  **Client (Browser)**: Displays the detailed feedback, per-persona insights, and overall summary.

## 6. Current Project Status

- MVP version with core feedback generation via OpenAI implemented in the `/api/generate-feedback` endpoint.
- UI components for displaying feedback exist (details in `README.md`).
- Persona definitions are available in `personas/investorPersonas.ts`, though the API currently uses a simpler internal configuration that needs to be reconciled.
- **Key Area for Immediate Development**: The PDF parsing functionality in `/api/generate-feedback.ts` is currently bypassed for debugging and uses placeholder text. Re-enabling and ensuring robust PDF-to-text extraction is a high priority.
- The root-level `generateInvestorFeedback.ts` file is a non-functional placeholder.
- A rule-based feedback engine exists in `synthetic-research-core/synthetic_persona_engine/FeedbackGenerator.ts` but is not integrated with the primary API flow.

## 7. Expectations from a Development Company

We are looking for a development partner to help refine, enhance, and scale the Synthetic Research MVP. Key areas of focus would include:

- **Robust PDF Processing**: Implementing reliable and accurate PDF parsing (fixing the current bypass) and slide segmentation.
- **Full Feature Implementation**: Ensuring all described features (like per-slide analysis, executive summary) are fully functional and integrated.
- **Codebase Refinement & Best Practices**: 
    - Addressing items from the initial code review (e.g., consolidating persona configurations, improving error handling, modularizing the API endpoint logic, enhancing type safety).
    - Ensuring code quality, maintainability, and scalability.
- **Frontend Enhancements**: Improving UI/UX based on user feedback.
- **Backend Development**: Expanding API capabilities, potentially integrating a database for user accounts and saved feedback.
- **Testing**: Implementing comprehensive unit, integration, and end-to-end tests.
- **New Feature Development**: Building out features from the "Coming Soon" list (e.g., follow-up simulations, Notion export, authentication).
- **DevOps & Deployment**: Assisting with setting up CI/CD pipelines and robust deployment strategies.

We are looking for a team that is proficient in Next.js, TypeScript, Node.js, and experienced with LLM integrations. Strong communication and a proactive approach to problem-solving are highly valued. 