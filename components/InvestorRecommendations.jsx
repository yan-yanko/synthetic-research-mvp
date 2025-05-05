export default function InvestorRecommendations({ investors }) {
  if (!investors || investors.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Recommended Real Investors</h2>
      <ul className="space-y-4">
        {investors.map((inv, i) => (
          <li key={i} className="border p-4 rounded shadow">
            <h3 className="text-lg font-bold">{inv.name}</h3>
            <p className="text-sm text-gray-600 italic">{inv.thesis}</p>
            <a
              href={inv.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-blue-600 underline"
            >
              Visit fund
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
} 