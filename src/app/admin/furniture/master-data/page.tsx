import { createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FurnitureAdminNav from "@/components/admin/FurnitureAdminNav";
import MasterDataModals from "./MasterDataModals";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MasterDataDashboard() {
  const supabase = await createAdminClient();

  // Fetch all master data
  const [
    { data: categories },
    { data: sections },
    { data: grades },
    { data: classes },
    { data: locations },
    { data: tabs }
  ] = await Promise.all([
    supabase.from('furniture_categories').select('*').order('display_order'),
    supabase.from('furniture_sections').select('*').order('display_order'),
    supabase.from('furniture_grades').select('*, furniture_sections(name)').order('display_order'),
    supabase.from('furniture_classes').select('*, furniture_grades(name)').order('display_order'),
    supabase.from('furniture_locations').select('*').order('display_order'),
    supabase.from('furniture_form_tabs').select('*').order('display_order')
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Furniture Module Administration</h1>
          <p className="text-muted-foreground mt-1">Manage branch registrations and data collection settings.</p>
        </div>
      </div>

      <FurnitureAdminNav />

      <MasterDataModals 
        sections={sections || []} 
        grades={grades || []} 
        categories={categories || []}
        tabs={tabs || []}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Furniture Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories?.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.is_active ? 'Active' : 'Inactive'}</TableCell>
                  </TableRow>
                ))}
                {(!categories || categories.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4">No categories found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Non-Academic Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations?.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.name}</TableCell>
                    <TableCell>{l.is_active ? 'Active' : 'Inactive'}</TableCell>
                  </TableRow>
                ))}
                {(!locations || locations.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4">No locations found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Grades */}
        <Card>
          <CardHeader>
            <CardTitle>Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades?.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell>{g.name}</TableCell>
                    <TableCell>{g.furniture_sections?.name}</TableCell>
                    <TableCell>{g.is_active ? 'Active' : 'Inactive'}</TableCell>
                  </TableRow>
                ))}
                {(!grades || grades.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">No grades found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Classes */}
        <Card>
          <CardHeader>
            <CardTitle>Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes?.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.furniture_grades?.name}</TableCell>
                    <TableCell>{c.is_active ? 'Active' : 'Inactive'}</TableCell>
                  </TableRow>
                ))}
                {(!classes || classes.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">No classes found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
