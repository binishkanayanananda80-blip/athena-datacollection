"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FurnitureAdminNav() {
  const pathname = usePathname();

  const tabs = [
    { name: "Registrations", href: "/admin/furniture" },
    { name: "Reports & Exports", href: "/admin/furniture/reports" },
    { name: "Master Data", href: "/admin/furniture/master-data" },
  ];

  return (
    <div className="border-b mb-6">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }
              `}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
