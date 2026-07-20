import { getCurrentFurnitureUser, getMasterDataForEntry } from "@/lib/furniture-actions";
import { redirect } from "next/navigation";
import DataEntryClient from "./DataEntryClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FurnitureDataEntryPage() {
  const { user, status, registration } = await getCurrentFurnitureUser() || {};
  
  if (!user) {
    console.log("Entry page: !user is true! Redirecting to login.")
    redirect("/furniture-requirements");
  }

  if (user && !registration) {
    if (user.user_metadata?.module === 'furniture') {
      return (
        <div className="max-w-4xl mx-auto px-4 py-12 text-center text-red-500">
           <h2 className="text-2xl font-bold mb-4">Account Error</h2>
           <p>Your branch user account exists, but your registration profile was deleted or not found.</p>
           <p className="mt-2">This usually happens if the database was reset after you registered.</p>
           <p className="mt-2 text-slate-700">Please register a new account with a different email/username.</p>
        </div>
      );
    }
    console.log("Entry page: user exists but no registration! Redirecting to /admin/furniture")
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
