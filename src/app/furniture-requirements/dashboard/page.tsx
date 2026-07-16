import { getCurrentFurnitureUser } from "@/lib/furniture-actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  FileEdit, 
  LogOut, 
  Package, 
  Percent
} from "lucide-react";

export default async function FurnitureDashboard() {
  const { user, status, registration } = await getCurrentFurnitureUser() || {};
  
  if (!user || !registration) {
    redirect("/furniture-requirements");
  }

  const supabase = await createClient();

  // Fetch Current Academic Year
  const { data: yearData } = await supabase
    .from('furniture_academic_years')
    .select('*')
    .eq('is_current', true)
    .single();

  const academicYearId = yearData?.id;

  // Fetch Submission Status
  let submission = null;
  if (academicYearId) {
    const { data: subData } = await supabase
      .from('furniture_submissions')
      .select('*')
      .eq('academic_year_id', academicYearId)
      .eq('branch_id', registration.branch_id)
      .single();
    
    submission = subData;
  }

  // Fetch Requirement Stats
  let totalNewFurniture = 0;
  if (academicYearId) {
     const { data: reqs } = await supabase
       .from('furniture_requirements')
       .select('new_furniture_requirement')
       .eq('academic_year_id', academicYearId)
       .eq('branch_id', registration.branch_id);
       
     if (reqs) {
       totalNewFurniture = reqs.reduce((sum, r) => sum + (r.new_furniture_requirement || 0), 0);
     }
  }

  const completionPercent = submission?.completion_percentage || 0;
  const currentStatus = submission?.status || 'Not Started';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {registration.full_name}</h1>
          <p className="text-slate-500 mt-1">Manage your branch furniture requirements</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/api/auth/logout">
            <Button variant="outline" className="text-slate-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </Link>
          {(currentStatus === 'Not Started' || currentStatus === 'Draft' || currentStatus === 'Reopened') && (
            <Link href="/furniture-requirements/entry">
              <Button className="bg-[#232c5e] hover:bg-[#1a2147]">
                <FileEdit className="w-4 h-4 mr-2" />
                Continue Data Entry
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Assigned Branch</CardTitle>
            <Building2 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registration.branches?.branch_name}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Academic Year</CardTitle>
            <CalendarDays className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yearData?.name || 'N/A'}</div>
            <p className="text-xs text-slate-400 mt-1">
              Deadline: {yearData?.submission_deadline ? new Date(yearData.submission_deadline).toLocaleDateString() : 'Not set'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Status</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStatus}</div>
            <p className="text-xs text-slate-400 mt-1">
              {submission?.updated_at ? `Last saved: ${new Date(submission.updated_at).toLocaleString()}` : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">New Items Requested</CardTitle>
            <Package className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNewFurniture}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Completion Progress</CardTitle>
          <CardDescription>Overall progress of your data entry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">{completionPercent}% Completed</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500 ease-in-out" style={{ width: `${completionPercent}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Link href="/furniture-requirements/review">
          <Button variant="outline" size="lg">Review Submission</Button>
        </Link>
        {currentStatus !== 'Submitted' && currentStatus !== 'Finalised' && currentStatus !== 'Locked' && (
           <Link href="/furniture-requirements/entry">
             <Button size="lg" className="bg-[#232c5e] hover:bg-[#1a2147]">Start / Continue Data Entry</Button>
           </Link>
        )}
      </div>

    </div>
  );
}
