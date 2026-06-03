"use client"

import { useEffect, useState } from "react"
import { getDesignations, getDepartments, toggleDesignationStatus, addDesignation } from "@/app/admin/master-data-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function DesignationsPage() {
  const [data, setData] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  
  const [newId, setNewId] = useState("")
  const [newName, setNewName] = useState("")
  const [newDepartmentId, setNewDepartmentId] = useState("")

  const loadData = async () => {
    setLoading(true)
    const [desRes, depRes] = await Promise.all([getDesignations(), getDepartments()])
    setData(desRes)
    setDepartments(depRes.filter((d: any) => d.active))
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleToggle = async (id: number, active: boolean) => {
    await toggleDesignationStatus(id, !active)
    setData(data.map(d => d.designation_id === id ? { ...d, active: !active } : d))
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newDepartmentId || !newId) return
    setIsAdding(true)
    try {
      await addDesignation(parseInt(newId), newName, parseInt(newDepartmentId))
      toast.success("Designation added")
      setNewId("")
      setNewName("")
      setNewDepartmentId("")
      loadData()
    } catch (error: any) {
      toast.error(error.message || "Failed to add designation")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Designations</h1>
          <p className="text-muted-foreground">Manage job designations within departments.</p>
        </div>
        <Dialog>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" /> Add Designation
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Designation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Designation ID</label>
                <Input type="number" required value={newId} onChange={e => setNewId(e.target.value)} placeholder="e.g. 50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Designation Name</label>
                <Input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Senior Teacher" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select required value={newDepartmentId} onValueChange={(val) => setNewDepartmentId(val as string)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dep: any) => (
                      <SelectItem key={dep.department_id} value={dep.department_id.toString()}>
                        {dep.Department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isAdding} className="w-full">
                {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Add"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Master Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Parent Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : (
                  data.map(item => (
                    <TableRow key={item.designation_id}>
                      <TableCell>{item.designation_id}</TableCell>
                      <TableCell className="font-medium">{item.Designation}</TableCell>
                      <TableCell>{item.departments?.Department}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant={item.active ? "destructive" : "secondary"} size="sm" onClick={() => handleToggle(item.designation_id, item.active)}>
                          {item.active ? "Deactivate" : "Activate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
