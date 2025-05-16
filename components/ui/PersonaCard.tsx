import React from 'react';
import { Badge } from "@/components/ui/badge"; // Assuming shadcn/ui setup for badge
import { cn } from "@/lib/utils"; // Assuming shadcn/ui setup for cn
import { Check } from "lucide-react";
import { SyntheticInvestor } from '@/types/personas'; // Adjust path if necessary

interface PersonaCardProps {
  persona: SyntheticInvestor;
  selected: boolean;
  onSelect: (persona: SyntheticInvestor) => void;
}

export function PersonaCard({ persona, selected, onSelect }: PersonaCardProps) {
  return (
    <div
      onClick={() => onSelect(persona)}
      className={cn(
        "transition-all p-4 rounded-2xl bg-card border border-border shadow-md cursor-pointer",
        selected ? "ring-2 ring-primary" : "hover:border-primary"
      )}
    >
      <div className="flex justify-between items-center mb-2">
        <Badge>{persona.type}</Badge>
        {selected && <Check className="text-primary w-5 h-5" />}
      </div>
      <h3 className="text-xl font-bold">{persona.name}</h3>
      <p className="text-textSecondary">{persona.investmentThesis}</p>
      {persona.behaviorProfile.riskAppetite && (
        <div className="mt-3">
          <Badge variant="secondary">{persona.behaviorProfile.riskAppetite}</Badge>
        </div>
      )}
    </div>
  );
} 