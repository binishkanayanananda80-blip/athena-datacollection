import { createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FurnitureAdminNav from "@/components/admin/FurnitureAdminNav";
import ExportButton from "./ExportButton";

export default async function ReportsDashboard() {
  const supabase = await createAdminClient();

  const { data: requirementsRaw } = await supabase
    .from('furniture_requirements')
    .select(`
      id,
      entry_type,
      existing_furniture_quantity,
      new_furniture_requirement,
      remarks,
      created_at,
      branches (branch_name),
      furniture_academic_years (name),
      furniture_categories (name),
      furniture_locations (name),
      furniture_classes (
        name,
        furniture_grades (
          name,
          furniture_sections (name)
        )
      )
    `)
    .order('created_at', { ascending: false });

  const requirements = requirementsRaw as any[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Furniture Module Administration</h1>
          <p className="text-muted-foreground mt-1">Manage branch registrations and data collection settings.</p>
        </div>
      </div>

      <FurnitureAdminNav />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Submitted Requirements</CardTitle>
          <ExportButton data={requirements || []} />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border max-h-[600px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Location / Class</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Existing</TableHead>
                  <TableHead className="text-right font-bold text-primary">Required</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requirements?.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.branches?.branch_name}</TableCell>
                    <TableCell>{req.furniture_academic_years?.name}</TableCell>
                    <TableCell>
                      {req.entry_type === 'academic_class' 
                        ? `${req.furniture_classes?.furniture_grades?.furniture_sections?.name} > ${req.furniture_classes?.name}` 
                        : req.furniture_locations?.name}
                    </TableCell>
                    <TableCell>{req.furniture_categories?.name}</TableCell>
                    <TableCell className="text-right">{req.existing_furniture_quantity}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{req.new_furniture_requirement}</TableCell>
                  </TableRow>
                ))}
                {(!requirements || requirements.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No furniture requirements have been submitted yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
