"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { getAllFeedback } from "@/app/actions/feedback.actions";

export default function ExportFeedbackButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await getAllFeedback();
      if (res.success && res.data) {
        const jsonString = JSON.stringify(res.data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Silo-feedback-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        alert("Gagal export: " + (res.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error saat export data.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md dark:shadow-none hover:shadow-lg  disabled:opacity-70"
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {isExporting ? "Exporting..." : "Export to JSON"}
    </button>
  );
}
