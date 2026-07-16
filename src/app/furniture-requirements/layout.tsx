import type { Metadata } from "next";
import SidebarLayout from "@/components/layout/SidebarLayout";

export const metadata: Metadata = {
  title: "LEEDS Furniture Requirement 2026/2027",
  description: "Furniture Requirement Data Collection for Leeds International School",
};

export default function FurnitureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarLayout>
      <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
        <header className="bg-[#232c5e] text-white shadow-md relative z-10 md:hidden">
          <div className="px-4 h-14 flex items-center justify-between">
            <div className="font-bold text-lg tracking-tight">LEEDS International School</div>
          </div>
        </header>
        <main className="flex-1 flex flex-col relative w-full h-full p-4 md:p-8">
          {children}
        </main>
      </div>
    </SidebarLayout>
  );
}
