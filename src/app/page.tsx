import Link from "next/link"

export default function PublicForm() {
  return (
    <div className="min-h-screen bg-background p-4 py-8 flex flex-col items-center justify-center relative">
      <div className="w-full max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">Leeds International School</h1>
          <h2 className="text-lg md:text-xl text-muted-foreground font-medium">Resource Management System</h2>
          
          <div className="pt-12">
            <Link 
              href="/furniture-requirements" 
              className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white rounded-xl text-lg font-medium hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md"
            >
              Furniture Requirements Module 2026/2027 →
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
