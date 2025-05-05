import { useState } from 'react';

export default function PersonaConfigurator({ onChange }) {
  const [geography, setGeography] = useState('US');
  
  const updateConfig = (geo) => {
    setGeography(geo);
    onChange({ geography: geo });
  };
  
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h2 className="text-lg font-medium mb-3">Audience Configuration</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Geography</label>
        <select 
          className="block w-full border border-gray-300 rounded-md p-2" 
          value={geography}
          onChange={(e) => updateConfig(e.target.value)}
        >
          <option value="US">United States</option>
          <option value="UK">United Kingdom</option>
          <option value="Canada">Canada</option>
          <option value="Germany">Germany</option>
        </select>
      </div>
    </div>
  );
} 