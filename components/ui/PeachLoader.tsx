import React from 'react';
import { motion } from 'framer-motion';

export function PeachLoader({ message = "Analyzing your deck... Hang tight!" }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center h-full py-12"
    >
      <img
        src="/assets/peach-loader.gif" // Make sure this GIF exists in public/assets/
        alt="Loading..."
        className="h-24 w-24 animate-bounce" // Tailwind's built-in bounce animation
      />
      <p className="text-textSecondary mt-4 text-lg">{message}</p>
    </motion.div>
  );
} 