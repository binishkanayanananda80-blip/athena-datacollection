import { getCurrentFurnitureUser, getMasterDataForEntry } from "@/lib/furniture-actions";
import { redirect } from "next/navigation";
import DataEntryClient from "./DataEntryClient";

export default async function FurnitureDataEntryPage() {
  const { user, status, registration } = await getCurrentFurnitureUser() || {};
  
  if (!user) {
    redirect("/furniture-requirements");
  }

  if (user && !registration) {
    redirect("/admin/furniture");
  }

  const masterData = await getMasterDataForEntry();

  if (!masterData.currentYear) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">
        No active academic year found for furniture data collection.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Data Entry: Furniture Requirements</h1>
        <p className="text-slate-500 mt-1">
          Branch: {registration.branches?.branch_name} | Academic Year: {masterData.currentYear.name}
        </p>
      </div>
      
      <DataEntryClient 
        branchId={registration.branch_id}
        academicYearId={masterData.currentYear.id}
        masterData={masterData} 
      />
    </div>
  );
}
