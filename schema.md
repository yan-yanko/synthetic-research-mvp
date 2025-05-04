# Synthetic Research MVP - Data Models

This document outlines the core data models used in the Synthetic Research MVP. These models define the structure of data flowing through the application, from user input to AI-generated responses.

## 1. Persona Object

```typescript
{
  id: string,          // Unique identifier for the persona
  name: string,        // Display name of the persona
  promptPrefix: string // Context-setting prefix for GPT prompts
}
```

**Example:**
```typescript
{
  id: 'cmo_b2b',
  name: 'CMO at B2B Tech Company',
  promptPrefix: 'You are a Chief Marketing Officer at a fast-growing B2B SaaS company...'
}
```

## 2. Research Input

```typescript
{
  mode: 'text' | 'url',                    // Input method (direct text or URL)
  content: string,                         // The actual content to analyze
  audience: Persona[],                     // Selected personas for analysis
  type: 'value_prop' | 'campaign' | 'product_page'  // Type of content being analyzed
}
```

**Example:**
```typescript
{
  mode: 'url',
  content: 'https://example.com/product',
  audience: [persona1, persona2],
  type: 'product_page'
}
```

## 3. Persona Response

```typescript
{
  personaId: string,    // ID of the responding persona
  personaName: string,  // Name of the responding persona
  response: string      // AI-generated response from the persona
}
```

**Example:**
```typescript
{
  personaId: 'genz_consumer',
  personaName: 'Gen Z Consumer',
  response: 'As a Gen Z consumer, I value authenticity...'
}
```

## 4. Summary

```typescript
{
  combinedInsights: string  // AI-generated summary of all persona responses
}
```

**Example:**
```typescript
{
  combinedInsights: 'The analysis reveals three key themes...'
}
```

## Notes

- This schema is subject to extension as the product evolves
- New fields may be added to support additional features
- Existing fields may be modified to accommodate new requirements
- All changes to the schema should be documented here

## Future Considerations

- Adding sentiment analysis scores
- Including confidence levels for AI responses
- Supporting multiple languages
- Adding metadata for response timing and context
- Including user feedback metrics

## API Response Schemas

### /api/generate
**Input:**
```typescript
interface GenerateRequest {
  prompt: string;      // The complete prompt to send to GPT
}
```

**Output:**
```typescript
interface GenerateResponse {
  result: string;      // The generated response from GPT
}
```

### /api/fetch-url-content
**Input:**
```typescript
interface FetchUrlRequest {
  url: string;         // The URL to fetch content from
}
```

**Output:**
```typescript
interface FetchUrlResponse {
  content: string;     // The extracted readable content from the URL
}
```

## State Management

### App State
```typescript
interface AppState {
  input: string;       // Current input (text or URL)
  loading: boolean;    // Loading state indicator
  responses: Record<string, string>; // Map of persona IDs to their responses
  inputType: 'text' | 'url'; // Type of input currently selected
}
``` 