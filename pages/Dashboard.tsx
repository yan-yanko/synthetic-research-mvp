import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { PersonaCard } from "@/components/ui/PersonaCard";
import { Layout } from "@/components/ui/Layout";
import { investorPersonas } from "@/personas/investorPersonas";
import { SyntheticInvestor } from '@/types/personas';
import { PeachLoader } from '@/components/ui/PeachLoader';

function DashboardGridDisplay({ personas, onSelect, selectedId, loading }: {
  personas: SyntheticInvestor[];
  onSelect: (persona: SyntheticInvestor) => void;
  selectedId: string | null;
  loading: boolean;
}) {
  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div key="loader">
          <PeachLoader message="Loading personas..." />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, staggerChildren: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {personas.map((persona) => (
            <motion.div
                key={persona.id}
                initial={{ opacity: 0, scale: 0.95, y: 10}}
                animate={{ opacity: 1, scale: 1, y: 0}}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
              <PersonaCard
                persona={persona}
                selected={selectedId === persona.id}
                onSelect={onSelect}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface DashboardPageProps {
  personasData?: SyntheticInvestor[];
}

export default function DashboardPage({ personasData = investorPersonas }: DashboardPageProps) {
  const [selectedPersona, setSelectedPersona] = useState<SyntheticInvestor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectPersona = (persona: SyntheticInvestor) => {
    setSelectedPersona(persona.id === selectedPersona?.id ? null : persona);
  };

  return (
    <Layout>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-textPrimary">Select an Investor Persona</h1>
        <p className="text-textSecondary mt-2">Choose an investor profile to get tailored feedback on your pitch.</p>
      </div>
      
      <DashboardGridDisplay 
        personas={personasData}
        onSelect={handleSelectPersona}
        selectedId={selectedPersona?.id || null}
        loading={isLoading}
      />

      <AnimatePresence>
        {selectedPersona && !isLoading && (
          <motion.div 
            key="selectedPersonaDetails"
            className="mt-12 p-6 bg-card border border-border rounded-2xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-primary mb-3">Selected: {selectedPersona.name}</h2>
            <p className="text-textSecondary whitespace-pre-line">
              <span className="font-semibold text-textPrimary">Investment Thesis:</span> {selectedPersona.investmentThesis}
              \n<span className="font-semibold text-textPrimary">Risk Appetite:</span> {selectedPersona.behaviorProfile.riskAppetite}
              \n<span className="font-semibold text-textPrimary">Key Traits:</span> {selectedPersona.behavioralTraits.join(', ')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
} 