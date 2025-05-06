import { reportError } from '../../utils/errorReporter';

export async function simulate(prompt, audienceConfig) {
  try {
    const res = await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, audienceConfig }),
    });
  
    if (!res.ok) throw new Error('Simulation failed');
    return res.json();
  } catch (error) {
    // Report error to our backend
    await reportError({
      error,
      action: 'web_sandbox_simulate',
      userInput: {
        promptLength: prompt?.length || 0,
        hasAudienceConfig: !!audienceConfig
      }
    });
    
    throw error; // Re-throw to allow calling code to handle it
  }
} 