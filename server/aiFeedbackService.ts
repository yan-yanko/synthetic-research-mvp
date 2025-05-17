import { llmClient } from './llmClient';
import type { InvestorFeedbackResponse } from '../types/feedback';

// Placeholder for actual deck content fetching/parsing if needed beyond just a URL
async function getDeckContentForAnalysis(deckUrl: string): Promise<string> {
  // For now, we'll just use the URL itself or a placeholder string.
  // In a real scenario, this might involve fetching the PDF, parsing text, or extracting images.
  console.log(`[aiFeedbackService] TODO: Implement actual content fetching for ${deckUrl}`);
  return `Content of the pitch deck at ${deckUrl}. Key slides include: Title, Problem, Solution, Market, Team.`;
}

async function generateEmailResponse(deckContent: string): Promise<string> {
  const systemPrompt = "You are an investor reviewing a pitch deck. Generate a concise email response.";
  const userPrompt = `Based on the following deck content, write an email response (either interest or rejection):

Deck Content Summary:
${deckContent}

Email Response:`;
  try {
    const completion = await llmClient.callLLM(systemPrompt, userPrompt, { maxTokens: 300 });
    return completion.choices[0].message.content || "Error: Could not generate email response.";
  } catch (error: any) {
    console.error("[aiFeedbackService] Error generating email response:", error.message);
    return "AI Error: Could not generate email response."; // Fallback for this specific part
  }
}

async function generateMeetingNotes(deckContent: string): Promise<{ strengths: string; concerns: string }> {
  const systemPrompt = "You are an investor analyzing a pitch deck. Generate structured meeting notes with strengths and concerns.";
  const userPrompt = `Based on the following deck content, provide meeting notes with clear strengths and concerns:

Deck Content Summary:
${deckContent}

Strengths: [List strengths here]
Concerns: [List concerns here]`;
  try {
    const completion = await llmClient.callLLM(systemPrompt, userPrompt, { maxTokens: 500 });
    const content = completion.choices[0].message.content || "Error: Could not generate meeting notes.";
    // Basic parsing (highly dependent on LLM output format - to be refined with user's schema)
    const strengthsMatch = content.match(/Strengths: (.*)Concerns:/is);
    const concernsMatch = content.match(/Concerns: (.*)/is);
    return {
      strengths: strengthsMatch ? strengthsMatch[1].trim() : "AI could not determine strengths.",
      concerns: concernsMatch ? concernsMatch[1].trim() : "AI could not determine concerns.",
    };
  } catch (error: any) {
    console.error("[aiFeedbackService] Error generating meeting notes:", error.message);
    return { strengths: "AI Error", concerns: "AI Error" };
  }
}

async function generateSlideFeedback(deckContent: string): Promise<Array<{ slide: string; feedback: string }>> {
  const systemPrompt = "You are an investor providing slide-by-slide feedback on a pitch deck.";
  // For now, simulate based on deck content summary. Later, this could involve processing actual slides.
  const userPrompt = `Based on the following deck content summary, provide brief feedback for 3 key conceptual slides (e.g., Problem, Solution, Team):

Deck Content Summary:
${deckContent}

Example Format:
Slide: Problem - Feedback: [Your feedback]
Slide: Solution - Feedback: [Your feedback]
Slide: Team - Feedback: [Your feedback]`;
  try {
    const completion = await llmClient.callLLM(systemPrompt, userPrompt, { maxTokens: 600 });
    const content = completion.choices[0].message.content || "Error: Could not generate slide feedback.";
    // Basic parsing (highly dependent on LLM output format)
    const slideFeedbacks: Array<{ slide: string; feedback: string }> = [];
    const lines = content.split('\n');
    lines.forEach(line => {
      const match = line.match(/Slide: (.*) - Feedback: (.*)/i);
      if (match) {
        slideFeedbacks.push({ slide: match[1].trim(), feedback: match[2].trim() });
      }
    });
    return slideFeedbacks.length > 0 ? slideFeedbacks : [{ slide: "General", feedback: "AI could not parse slide-specific feedback. General impression: " + content }];
  } catch (error: any) {
    console.error("[aiFeedbackService] Error generating slide feedback:", error.message);
    return [{ slide: "Error", feedback: "AI Error generating slide feedback." }];
  }
}

async function generateConsensusReport(deckContent: string): Promise<{ likelihoodToInvest: string; overallFeedback: string }> {
  const systemPrompt = "You are an AI investment committee lead, summarizing feedback and providing an overall consensus.";
  const userPrompt = `Based on the following deck content summary, provide an overall consensus report including a likelihood to invest percentage:

Deck Content Summary:
${deckContent}

Likelihood to Invest: [X%]
Overall Feedback: [Your summary]`;
  try {
    const completion = await llmClient.callLLM(systemPrompt, userPrompt, { maxTokens: 400 });
    const content = completion.choices[0].message.content || "Error: Could not generate consensus report.";
    const likelihoodMatch = content.match(/Likelihood to Invest: (\d+%)/i);
    const feedbackMatch = content.match(/Overall Feedback: (.*)/is);
    return {
      likelihoodToInvest: likelihoodMatch ? likelihoodMatch[1] : "Pending AI Analysis",
      overallFeedback: feedbackMatch ? feedbackMatch[1].trim() : "AI could not determine overall feedback. Full content: " + content,
    };
  } catch (error: any) {
    console.error("[aiFeedbackService] Error generating consensus report:", error.message);
    return { likelihoodToInvest: "Error", overallFeedback: "AI Error" };
  }
}

export async function getInvestorFeedbackFromAI(deckUrl: string): Promise<InvestorFeedbackResponse> {
  console.log(`[aiFeedbackService] Starting AI feedback generation for deck: ${deckUrl}`);
  
  // In a real app, deckUrl (a public URL) would be used to fetch and parse the PDF content.
  // For now, we pass a summary or the URL itself to the LLM prompts.
  const deckContentSummary = await getDeckContentForAnalysis(deckUrl);

  // Perform calls in parallel
  const [emailResponses, meetingNotes, slideFeedback, consensusReport] = await Promise.all([
    generateEmailResponse(deckContentSummary),
    generateMeetingNotes(deckContentSummary),
    generateSlideFeedback(deckContentSummary),
    generateConsensusReport(deckContentSummary),
  ]);

  console.log("[aiFeedbackService] AI feedback generation completed.");
  return {
    emailResponses,
    meetingNotes,
    slideFeedback,
    consensusReport,
  };
} 