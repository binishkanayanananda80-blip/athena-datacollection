"use client"

import { useEffect, useState } from "react"
import { getDepartments, getCategories, toggleDepartmentStatus, addDepartment } from "@/app/admin/master-data-actions"
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

export default function DepartmentsPage() {
  const [data, setData] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  
  const [newId, setNewId] = useState("")
  const [newName, setNewName] = useState("")
  const [newCategoryId, setNewCategoryId] = useState("")

  const loadData = async () => {
    setLoading(true)
    const [depRes, catRes] = await Promise.all([getDepartments(), getCategories()])
    setData(depRes)
    setCategories(catRes.filter((c: any) => c.active))
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleToggle = async (id: number, active: boolean) => {
    await toggleDepartmentStatus(id, !active)
    setData(data.map(d => d.department_id === id ? { ...d, active: !active } : d))
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newCategoryId || !newId) return
    setIsAdding(true)
    try {
      await addDepartment(parseInt(newId), newName, parseInt(newCategoryId))
      toast.success("Department added")
      setNewId("")
      setNewName("")
      setNewCategoryId("")
      loadData()
    } catch (error: any) {
      toast.error(error.message || "Failed to add department")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">Manage departments within categories.</p>
        </div>
        <Dialog>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" /> Add Department
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Department ID</label>
                <Input type="number" required value={newId} onChange={e => setNewId(e.target.value)} placeholder="e.g. 20" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department Name</label>
                <Input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. IT Department" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select required value={newCategoryId} onValueChange={setNewCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.category_id} value={cat.category_id.toString()}>
                        {cat.category_name}
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
                  <TableHead>Department</TableHead>
                  <TableHead>Parent Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : (
                  data.map(item => (
                    <TableRow key={item.department_id}>
                      <TableCell>{item.department_id}</TableCell>
                      <TableCell className="font-medium">{item.Department}</TableCell>
                      <TableCell>{item.categories?.category_name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant={item.active ? "destructive" : "secondary"} size="sm" onClick={() => handleToggle(item.department_id, item.active)}>
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
