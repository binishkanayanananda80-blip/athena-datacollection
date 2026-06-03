"use client"

import { useEffect, useState } from "react"
import { getSubmissions, deleteSubmission, getCurrentUserEmail } from "./actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Trash2, Edit2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function SubmissionsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const email = await getCurrentUserEmail()
      setUserEmail(email)
      
      const subs = await getSubmissions()
      setData(subs)
    } catch (error) {
      toast.error("Failed to load submissions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredData = data.filter(s => {
    const term = search.toLowerCase()
    return (
      s.epf_no?.toLowerCase().includes(term) ||
      s.first_name?.toLowerCase().includes(term) ||
      s.last_name?.toLowerCase().includes(term) ||
      s.nic?.toLowerCase().includes(term) ||
      s.mobile?.includes(term) ||
      s.branch_name?.toLowerCase().includes(term)
    )
  })

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const res = await deleteSubmission(deleteId)
      if (res.success) {
        toast.success("Record deleted successfully")
        setData(data.filter(s => s.id !== deleteId))
      } else {
        toast.error(res.error || "Failed to delete record")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Submissions</h1>
        <p className="text-muted-foreground">View and manage employee data submissions.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <CardTitle>All Records ({filteredData.length})</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by EPF, Name, NIC..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow>
                  <TableHead>EPF No</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>NIC</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.epf_no}</TableCell>
                      <TableCell>{`${sub.first_name} ${sub.middle_name || ''} ${sub.last_name}`}</TableCell>
                      <TableCell>{sub.branch_name}</TableCell>
                      <TableCell>{sub.category_name}</TableCell>
                      <TableCell>{sub.Department}</TableCell>
                      <TableCell>{sub.Designation}</TableCell>
                      <TableCell>{sub.nic}</TableCell>
                      <TableCell>{sub.mobile}</TableCell>
                      <TableCell>{new Date(sub.submitted_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Link href={`/admin/submissions/${sub.id}`}>
                            <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-600/10">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </Link>
                          {userEmail === 'binishkanayanananda80@gmail.com' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteId(sub.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the employee record from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
