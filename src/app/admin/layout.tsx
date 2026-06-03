"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  Layers, 
  Network, 
  Briefcase, 
  FileText, 
  QrCode, 
  Download, 
  LogOut 
} from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    window.location.href = "/api/auth/logout"
  }

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/submissions", label: "Submissions", icon: Users },
    { href: "/admin/branches", label: "Branches", icon: Building },
    { href: "/admin/categories", label: "Categories", icon: Layers },
    { href: "/admin/departments", label: "Departments", icon: Network },
    { href: "/admin/designations", label: "Designations", icon: Briefcase },
    { href: "/admin/contract-types", label: "Contract Types", icon: FileText },
    { href: "/admin/qr", label: "QR Code", icon: QrCode },
    { href: "/admin/export", label: "CSV Export", icon: Download },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-primary-foreground hidden md:flex flex-col">
        <div className="p-4 border-b border-primary-foreground/10">
          <h2 className="text-xl font-bold tracking-tight">Admin Portal</h2>
          <p className="text-xs text-primary-foreground/70 mt-1">Leeds International School</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <span className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  isActive 
                    ? "bg-primary-foreground/15 text-white" 
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-white"
                }`}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-primary-foreground/10">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header (simplified) */}
        <header className="md:hidden flex items-center justify-between p-4 bg-primary text-primary-foreground">
          <h2 className="text-lg font-bold">Admin Portal</h2>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-2 py-1 rounded-md text-sm text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Mobile Nav Scroll (simplified) */}
        <div className="md:hidden flex overflow-x-auto bg-white border-b border-border p-2 gap-2 shadow-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="flex-shrink-0">
                <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  <item.icon className="w-3 h-3" />
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
