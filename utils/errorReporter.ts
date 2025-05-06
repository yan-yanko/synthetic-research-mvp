/**
 * Utility function to report errors to the backend
 */

interface ErrorReportOptions {
  error: Error | unknown;
  action: string;
  url?: string;
  userInput?: Record<string, any>;
}

export async function reportError({ error, action, url, userInput }: ErrorReportOptions): Promise<void> {
  try {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    const payload = {
      message: errorObj.message,
      stack: errorObj.stack,
      url: url || (typeof window !== 'undefined' ? window.location.href : 'server-side'),
      timestamp: new Date().toISOString(),
      action,
      userInput
    };

    // Silently log errors to the backend
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/log-error`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    // Continue logging to console for local debugging
    console.error(`[Error in ${action}]:`, error);
  } catch (logError) {
    // Never throw from the error reporter
    console.error('Failed to report error:', logError);
  }
} 