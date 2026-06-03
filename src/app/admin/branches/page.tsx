"use client"

import { useEffect, useState } from "react"
import { getBranches, toggleBranchStatus, updateBranchCount, addBranch } from "@/app/admin/master-data-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Edit2, Save, X } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function BranchesPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editCount, setEditCount] = useState<string>("")
  const [isAdding, setIsAdding] = useState(false)
  
  // Add Form
  const [newName, setNewName] = useState("")
  const [newCount, setNewCount] = useState("")

  const loadData = async () => {
    setLoading(true)
    const res = await getBranches()
    setData(res)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleToggle = async (id: number, active: boolean) => {
    await toggleBranchStatus(id, !active)
    setData(data.map(d => d.branch_id === id ? { ...d, active: !active } : d))
  }

  const handleSaveCount = async (id: number) => {
    await updateBranchCount(id, parseInt(editCount) || 0)
    setData(data.map(d => d.branch_id === id ? { ...d, expected_employee_count: parseInt(editCount) || 0 } : d))
    setEditingId(null)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName) return
    setIsAdding(true)
    try {
      await addBranch(newName, parseInt(newCount) || 0)
      toast.success("Branch added")
      setNewName("")
      setNewCount("")
      loadData()
    } catch {
      toast.error("Failed to add branch")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground">Manage school branches and their expected employee counts.</p>
        </div>
        <Dialog>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" /> Add Branch
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Branch</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Branch Name</label>
                <Input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Colombo" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expected Employee Count</label>
                <Input type="number" required value={newCount} onChange={e => setNewCount(e.target.value)} placeholder="e.g. 50" />
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
                  <TableHead>Branch Name</TableHead>
                  <TableHead>Expected Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : (
                  data.map(branch => (
                    <TableRow key={branch.branch_id}>
                      <TableCell>{branch.branch_id}</TableCell>
                      <TableCell className="font-medium">{branch.branch_name}</TableCell>
                      <TableCell>
                        {editingId === branch.branch_id ? (
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number" 
                              className="w-20 h-8" 
                              value={editCount} 
                              onChange={(e) => setEditCount(e.target.value)}
                            />
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleSaveCount(branch.branch_id)}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {branch.expected_employee_count}
                            <Button size="icon" variant="ghost" className="h-6 w-6 opacity-50 hover:opacity-100" onClick={() => {
                              setEditingId(branch.branch_id)
                              setEditCount(branch.expected_employee_count?.toString() || "0")
                            }}>
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${branch.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {branch.active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant={branch.active ? "destructive" : "secondary"} size="sm" onClick={() => handleToggle(branch.branch_id, branch.active)}>
                          {branch.active ? "Deactivate" : "Activate"}
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
