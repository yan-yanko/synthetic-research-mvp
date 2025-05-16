import React, { useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { ExportPDFButton } from '@/components/ui/ExportPDFButton';

// Define a more specific type for the data if possible, e.g.:
export interface ChartDataItem {
  label: string; // Example: Persona Name or Sentiment Category
  value: number; // Example: Score or Count
  // Potentially other fields if your chart needs them
}

interface ConsensusSummaryProps {
  data: ChartDataItem[];
  title?: string;
}

export function ConsensusSummary({ data, title = "Consensus Summary" }: ConsensusSummaryProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const getElementToExport = () => chartContainerRef.current;

  return (
    <div className="bg-card p-6 rounded-2xl shadow-md text-textPrimary" ref={chartContainerRef}>
      <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2E2E3E" /> {/* Use border color for grid */}
          <XAxis dataKey="label" stroke="#A0AEC0" tick={{ fill: '#A0AEC0' }} />
          <YAxis stroke="#A0AEC0" tick={{ fill: '#A0AEC0' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1E1E2F', border: '1px solid #2E2E3E', borderRadius: '0.5rem' }} 
            labelStyle={{ color: '#FFFFFF' }} 
            itemStyle={{ color: '#3B82F6' }}
          />
          <Legend wrapperStyle={{ color: '#A0AEC0' }} />
          <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Score" /> {/* Added name for Legend/Tooltip */}
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-6 flex justify-center">
        <ExportPDFButton getElementToExport={getElementToExport} fileNamePrefix={title.replace(/\s+/g, '_')} />
      </div>
    </div>
  );
} 