import React from 'react';
import html2pdf from "html2pdf.js";
import { useToast } from "@/components/ui/ToastContext"; // Corrected import path

export function ExportPDFButton({ getElementToExport, fileNamePrefix = "Export" }: {
  getElementToExport: () => HTMLElement | null;
  fileNamePrefix?: string;
}) {
  const addToast = useToast(); // useToast returns addToast function directly

  const handleExport = async () => {
    const elementToExport = getElementToExport();
    if (!elementToExport) {
      addToast("⚠️ Export failed: No content to export.", "error");
      return;
    }

    addToast("📄 Generating PDF...", "info"); // Info toast for initiation

    try {
      const fileName = `${fileNamePrefix}_${new Date().toISOString().split('T')[0]}.pdf`;
      await html2pdf().set({
        margin: 0.5, // Adjusted margin from 1 to 0.5 to match InvestorPanel
        filename: fileName,
        image: { type: 'jpeg', quality: 0.95 }, // Added image settings like in InvestorPanel
        html2canvas: { scale: 2, useCORS: true }, // Added html2canvas settings
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
      }).from(elementToExport).save();
      addToast("📄 PDF Exported Successfully!", "success");
    } catch (error: any) {
      console.error("PDF Export Error:", error);
      addToast("⚠️ Export Failed. Please Try Again.", "error");
    }
  };

  return (
    <button
      onClick={handleExport}
      className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-80 transition disabled:opacity-50"
      // Add a disabled state if needed, e.g., when elementToExport is null initially
    >
      Export as PDF
    </button>
  );
} 