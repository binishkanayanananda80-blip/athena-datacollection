import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminFurnitureActions from "./AdminFurnitureActions";

export default async function AdminFurnitureDashboard() {
  const supabase = await createClient();

  // Verify super admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: roleData } = await supabase
    .from('furniture_user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleData?.role !== 'super_admin') {
    // If a branch user accidentally comes here, redirect them to their module
    redirect("/furniture-requirements/dashboard");
  }

  // Fetch pending branch registrations
  const { data: registrations } = await supabase
    .from('furniture_branch_registrations')
    .select('*, branches(branch_name)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Furniture Module Administration</h1>
          <p className="text-muted-foreground mt-1">Manage branch registrations and data collection settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Branch Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {registrations && registrations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch</TableHead>
                    <TableHead>Representative</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">{reg.branches?.branch_name}</TableCell>
                      <TableCell>{reg.full_name}</TableCell>
                      <TableCell>{reg.email}</TableCell>
                      <TableCell>
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            reg.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : reg.status === 'Pending Approval' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {reg.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(reg.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        {reg.status === 'Pending Approval' && (
                          <AdminFurnitureActions registrationId={reg.id} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No branch registrations found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
