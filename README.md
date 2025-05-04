# Synthetic Research MVP

A Next.js application that simulates audience research using AI-powered personas. This MVP allows you to test marketing messages and content with different audience segments, powered by OpenAI's GPT-4o model.

## Features

- **Multiple Personas**: Test your message with different audience segments:
  - CMO at B2B Tech Company
  - Founder of SMB
  - Gen Z Consumer
- **Flexible Input**: Choose between:
  - Direct text input
  - URL-based content analysis
- **AI-Powered Analysis**: Get detailed, persona-specific feedback
- **Automated Summaries**: Receive AI-generated insights from all personas
- **PDF Reports**: Download comprehensive research reports

## How It Works

1. **Input Your Content**:
   - Enter your marketing message directly as text
   - Or provide a URL to analyze webpage content
   - The system will automatically clean and process the content

2. **Persona Analysis**:
   - Each persona provides their unique perspective
   - Responses are generated using GPT-4o
   - Feedback includes concerns, appeals, and suggestions

3. **Insight Generation**:
   - AI analyzes all persona responses
   - Identifies key themes and patterns
   - Highlights common concerns and opportunities

4. **Report Generation**:
   - Download a professional PDF report
   - Includes all persona responses and key insights
   - Ready for sharing with stakeholders

## Project Structure

```
/pages
  /api
    /generate.ts         # OpenAI API integration endpoint
    /fetch-url-content.ts # URL content extraction endpoint
    /summarize.ts        # Response summarization endpoint
  /index.tsx            # Main UI component
```

### API Endpoints

1. **/api/generate**
   - Purpose: Generates persona-specific responses using GPT-4o
   - Method: POST
   - Input: `{ prompt: string }`
   - Output: `{ result: string }`

2. **/api/fetch-url-content**
   - Purpose: Extracts and cleans content from a webpage
   - Method: POST
   - Input: `{ url: string }`
   - Output: `{ content: string }`

3. **/api/summarize**
   - Purpose: Generates insights from multiple persona responses
   - Method: POST
   - Input: `{ responses: Array<{ personaId: string, personaName: string, response: string }> }`
   - Output: `{ summary: string }`

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   OPENAI_API_KEY=your_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Next Milestones

- [x] Basic persona response generation
- [x] URL-based content analysis
- [x] Automated response summarization
- [x] PDF report generation
- [ ] Add more diverse personas
- [ ] Implement response comparison charts
- [ ] Add sentiment analysis
- [ ] Support for multiple languages

## Documentation

All code includes comprehensive inline documentation:
- File-level documentation explaining purpose and functionality
- Function-level documentation detailing parameters and return values
- Clear error handling and type definitions
- Consistent code style and formatting

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT 