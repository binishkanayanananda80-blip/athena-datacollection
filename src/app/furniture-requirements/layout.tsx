import type { Metadata } from "next";

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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-[#232c5e] text-white shadow-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-bold text-lg tracking-tight">LEEDS International School</div>
            <div className="hidden md:block h-5 w-px bg-white/20 mx-2"></div>
            <div className="hidden md:block text-sm font-medium text-white/80">Furniture Requirement 2026/2027</div>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col relative">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} LEEDS International School. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
