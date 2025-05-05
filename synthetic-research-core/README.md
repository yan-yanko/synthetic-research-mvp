# Synthetic Research Core

A modular system for generating synthetic audience research at scale.

## Modules

### 1. Synthetic Persona Engine
- Generates demographically and psychographically coherent personas.
- Uses real-world data distributions (e.g., census, industry panels).
- Adds behavioral logic via Big Five and Jobs To Be Done frameworks.

### 2. LLM-Based Response Generator
- Simulates responses to research questions or ads.
- Controlled variation ensures realism across tone, sentiment, and verbosity.
- Fine-tuning hooks for future improvement.

### 3. Validation and Confidence Layer
- Compares synthetic vs. real data distributions.
- Includes benchmark accuracy on real-world classification tasks.
- Fidelity scoring blends statistical and machine learning metrics.

### 4. Interface and API Layer
- Audience configuration and generation.
- Input surveys or interview prompts to simulate responses.
- Export results in CSV, JSON, or natural transcript format.
- Bias rebalancing and structured tabular generation included.

## Getting Started

1. Build personas with `buildAudience()`
2. Simulate responses using `simulateResponsesForAudience()`
3. Export, validate, or visualize

## Future Work

- Integrate real survey fine-tuning pipeline
- Add UI and dashboarding layer
- Plug into OpenAI function calling for real-time interviews
- Replace Tabular mock with real TabDDPM integration

## Structure & Responsibilities

### 1. synthetic_persona_engine/
- **generatePersona.js**: Generates synthetic personas based on constraints and psychographics.
- **constraints.js**: Defines and manages constraints for persona generation.
- **psychographics.js**: Handles psychographic segmentation and logic.
- **dataSources/**: Contains data files for census distributions and industry panels.

### 2. llm_response_generator/
- **promptTemplates.js**: Templates for LLM prompts.
- **simulateResponse.js**: Simulates persona responses using LLMs.
- **variationControl.js**: Controls variation in generated responses.
- **realDataFineTuningNotes.md**: Notes and guidelines for fine-tuning with real data.

### 3. validation_layer/
- **compareDistributions.js**: Compares synthetic and real data distributions.
- **benchmarkRealVsSynthetic.js**: Benchmarks synthetic personas against real-world data.
- **fidelityScoring.js**: Scores the fidelity of synthetic personas and responses.

### 4. interface_api/
- **audienceBuilder.js**: API for building and customizing audiences.
- **responseSimulator.js**: API for simulating responses.
- **exportManager.js**: Handles export of results and data.
- **diffusionSurveyModule.js**: Module for running diffusion surveys.
- **biasControls.js**: Tools for controlling and measuring bias.

### Shared utils/
- **tokenizer.js**: Shared text tokenization utilities.
- **randomSampler.js**: Random sampling utilities.
- **logger.js**: Logging utilities for all modules.

---
Each file begins with a docblock summarizing its role and usage. 