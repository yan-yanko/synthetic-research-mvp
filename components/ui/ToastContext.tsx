import React, { createContext, useContext, useState, ReactNode } from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning" | "info"; // Expanded types slightly
}

interface ToastContextType {
  addToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = "success") => {
    const id = Date.now() + Math.random(); // Added Math.random for better uniqueness
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000); // Default 3s, can be made dynamic
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.addToast; // Return only the addToast function as per user's ExportPDFButton example
}

function ToastContainer({ toasts = [] }: { toasts: Toast[] }) {
  return (
    <div className="fixed top-6 right-6 space-y-3 z-50 w-auto max-w-sm">
      {toasts.map(({ id, message, type }) => {
        let bgColor = "bg-primary"; // Default to primary, update based on type
        if (type === "success") bgColor = "bg-success";
        else if (type === "error") bgColor = "bg-danger";
        else if (type === "warning") bgColor = "bg-warning";
        // else if (type === "info") bgColor = "bg-primary"; // Or another color for info

        return (
          <div
            key={id}
            // Added animation classes for entry/exit (requires framer-motion or similar CSS)
            // For simplicity, using basic transition here. Framer motion could be added.
            className={`px-4 py-3 rounded-lg shadow-xl text-white text-sm transition-all duration-300 ease-in-out ${bgColor}`}
          >
            {message}
          </div>
        );
      })}
    </div>
  );
} 