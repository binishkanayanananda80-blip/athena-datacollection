"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
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
  LogOut,
  Upload,
  Package
} from "lucide-react"

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isSuperAdmin, setIsSuperAdmin] = useState(true)

  useEffect(() => {
    async function checkRole() {
      try {
        const response = await fetch('/api/user-role')
        const data = await response.json()
        // If the user is explicitly a branch_user, hide the main admin links
        if (data.role === 'branch_user') {
          setIsSuperAdmin(false)
        }
      } catch (e) {
        // Assume super admin if check fails, middleware protects routes anyway
      }
    }
    checkRole()
  }, [])

  // Don't show sidebar on login pages
  if (pathname === '/admin/login' || pathname === '/furniture-requirements') {
    return <>{children}</>
  }

  const allNavItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/submissions", label: "Submissions", icon: Users },
    { href: "/admin/branches", label: "Branches", icon: Building },
    { href: "/admin/categories", label: "Categories", icon: Layers },
    { href: "/admin/departments", label: "Departments", icon: Network },
    { href: "/admin/designations", label: "Designations", icon: Briefcase },
    { href: "/admin/contract-types", label: "Contract Types", icon: FileText },
    { href: "/admin/qr", label: "QR Code", icon: QrCode },
    { href: "/admin/students/import", label: "Student Import", icon: Upload },
    { href: "/admin/export", label: "CSV Export", icon: Download },
  ]
  
  const furnitureNavItemsAdmin = [
    { href: "/admin/furniture", label: "Furniture Module", icon: Package },
  ]

  const furnitureNavItemsBranch = [
    { href: "/furniture-requirements/dashboard", label: "Furniture Requirement", icon: Package },
  ]

  const navItems = isSuperAdmin ? [...allNavItems, ...furnitureNavItemsAdmin] : furnitureNavItemsBranch;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-[280px] bg-sidebar text-sidebar-foreground hidden md:flex flex-col shadow-xl z-20">
        <div className="p-8 border-b border-white/10">
          <h2 className="text-2xl font-bold tracking-tight text-white">{isSuperAdmin ? "Admin Portal" : "Branch Portal"}</h2>
          <p className="text-sm text-white/70 mt-2">Leeds International School</p>
        </div>
        <nav className="flex-1 overflow-y-auto pt-4 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <span className={`flex items-center gap-3 px-6 py-3 transition-colors text-sm font-medium ${
                  isActive 
                    ? "bg-white/10 text-white border-l-4 border-primary" 
                    : "text-white/70 hover:bg-white/5 hover:text-white border-l-4 border-transparent"
                }`}>
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
        <div className="p-8 border-t border-white/10 space-y-3">
          <a
            href="/"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-md"
          >
            Exit to Data Form
          </a>
          <a
            href="/api/auth/logout"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header (simplified) */}
        <header className="md:hidden flex items-center justify-between p-4 bg-sidebar text-white shadow-md z-20">
          <h2 className="text-lg font-bold tracking-tight">{isSuperAdmin ? "Admin Portal" : "Branch Portal"}</h2>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
            >
              Exit
            </a>
            <a
              href="/api/auth/logout"
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </a>
          </div>
        </header>

        {/* Mobile Nav Scroll (simplified) */}
        <div className="md:hidden flex overflow-x-auto bg-[#232c5e] border-b border-white/5 p-3 gap-2 shadow-sm hide-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="flex-shrink-0">
                <span className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  isActive 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-white/70 bg-white/5 hover:bg-white/10"
                }`}>
                  <item.icon className="w-4 h-4" />
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
