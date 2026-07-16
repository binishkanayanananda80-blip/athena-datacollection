"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function ExportButton({ data }: { data: any[] }) {
  const handleExport = () => {
    if (!data || data.length === 0) return alert("No data to export");

    // CSV Headers
    const headers = [
      "Branch",
      "Academic Year",
      "Entry Type",
      "Section",
      "Grade",
      "Class",
      "Location",
      "Category",
      "Existing Quantity",
      "New Requirement",
      "Remarks",
      "Created At"
    ];

    // CSV Rows
    const rows = data.map((row) => [
      row.branches?.branch_name || "",
      row.furniture_academic_years?.name || "",
      row.entry_type === "academic_class" ? "Academic Class" : "Non-Academic Location",
      row.furniture_classes?.furniture_grades?.furniture_sections?.name || "N/A",
      row.furniture_classes?.furniture_grades?.name || "N/A",
      row.furniture_classes?.name || "N/A",
      row.furniture_locations?.name || "N/A",
      row.furniture_categories?.name || "",
      row.existing_furniture_quantity || "0",
      row.new_furniture_requirement || "0",
      `"${(row.remarks || "").replace(/"/g, '""')}"`, // escape quotes for CSV
      new Date(row.created_at).toLocaleDateString()
    ]);

    // Combine
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `furniture_requirements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button onClick={handleExport} className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
}
