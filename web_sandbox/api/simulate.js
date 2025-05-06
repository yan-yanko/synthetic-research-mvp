export async function simulate(prompt, audienceConfig) {
  const res = await fetch('/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, audienceConfig }),
  });

  if (!res.ok) throw new Error('Simulation failed');
  return res.json();
} 