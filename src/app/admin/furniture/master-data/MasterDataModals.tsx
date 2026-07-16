"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addFurnitureCategory, addFurnitureGrade, addFurnitureClass, addFurnitureLocation } from "@/lib/furniture-actions";

export default function MasterDataModals({ sections, grades }: { sections: any[], grades: any[] }) {
  const router = useRouter();
  
  const [openCat, setOpenCat] = useState(false);
  const [openLoc, setOpenLoc] = useState(false);
  const [openGrade, setOpenGrade] = useState(false);
  const [openClass, setOpenClass] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await addFurnitureCategory(name);
    setIsLoading(false);
    if (res.success) {
      toast.success("Category added successfully");
      setOpenCat(false);
      setName("");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to add category");
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await addFurnitureLocation(name);
    setIsLoading(false);
    if (res.success) {
      toast.success("Location added successfully");
      setOpenLoc(false);
      setName("");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to add location");
    }
  };

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentId) return toast.error("Please select a section");
    setIsLoading(true);
    const res = await addFurnitureGrade(name, parentId);
    setIsLoading(false);
    if (res.success) {
      toast.success("Grade added successfully");
      setOpenGrade(false);
      setName("");
      setParentId("");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to add grade");
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentId) return toast.error("Please select a grade");
    setIsLoading(true);
    const res = await addFurnitureClass(name, parentId);
    setIsLoading(false);
    if (res.success) {
      toast.success("Class added successfully");
      setOpenClass(false);
      setName("");
      setParentId("");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to add class");
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-lg border shadow-sm">
      <Button variant="outline" onClick={() => setOpenCat(true)}>Add Category</Button>
      <Dialog open={openCat} onOpenChange={setOpenCat}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Furniture Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <Label>Category Name</Label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Desks" />
            </div>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Adding..." : "Save"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Button variant="outline" onClick={() => setOpenLoc(true)}>Add Location</Button>
      <Dialog open={openLoc} onOpenChange={setOpenLoc}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Non-Academic Location</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddLocation} className="space-y-4">
            <div>
              <Label>Location Name</Label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Main Library" />
            </div>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Adding..." : "Save"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Button variant="outline" onClick={() => setOpenGrade(true)}>Add Grade</Button>
      <Dialog open={openGrade} onOpenChange={setOpenGrade}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Grade</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddGrade} className="space-y-4">
            <div>
              <Label>Section</Label>
              <Select value={parentId} onValueChange={(val) => setParentId(val || "")}>
                <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
                <SelectContent>
                  {sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Grade Name</Label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Grade 1" />
            </div>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Adding..." : "Save"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Button variant="outline" onClick={() => setOpenClass(true)}>Add Class</Button>
      <Dialog open={openClass} onOpenChange={setOpenClass}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Class</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddClass} className="space-y-4">
            <div>
              <Label>Grade</Label>
              <Select value={parentId} onValueChange={(val) => setParentId(val || "")}>
                <SelectTrigger><SelectValue placeholder="Select Grade" /></SelectTrigger>
                <SelectContent>
                  {grades.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Class Name</Label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. 1-A" />
            </div>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Adding..." : "Save"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
