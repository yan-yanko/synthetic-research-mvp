import InvestorRecommendations from './InvestorRecommendations';

export default function PitchResults({ feedback, investorMatches }) {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-bold">Simulated Investor Feedback</h2>
        <pre className="bg-gray-100 p-4 whitespace-pre-wrap rounded">{feedback}</pre>
      </section>

      <InvestorRecommendations investors={investorMatches} />
    </div>
  );
} 