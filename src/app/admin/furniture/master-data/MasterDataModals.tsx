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

export default function MasterDataModals({ sections, grades, categories, tabs }: { sections: any[], grades: any[], categories: any[], tabs: any[] }) {
  const router = useRouter();
  
  const [openCat, setOpenCat] = useState(false);
  const [openEquip, setOpenEquip] = useState(false);
  const [openLoc, setOpenLoc] = useState(false);
  const [openGrade, setOpenGrade] = useState(false);
  const [openClass, setOpenClass] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [tabId, setTabId] = useState("");

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tabId) return toast.error("Please select a Tab Type");
    setIsLoading(true);
    const actualParentId = (parentId === "none" || !parentId) ? undefined : parentId;
    const res = await addFurnitureCategory(name, tabId, actualParentId);
    setIsLoading(false);
    if (res.success) {
      toast.success("Category added successfully");
      setOpenCat(false);
      setName("");
      setParentId("");
      setTabId("");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to add category");
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    const equipTab = tabs?.find(t => t.tab_type === "equipment");
    const equipParentCat = categories?.find(c => c.name === "Equipment" && !c.parent_id);
    
    if (!equipTab || !equipParentCat) return toast.error("Equipment system configuration is missing.");

    setIsLoading(true);
    const res = await addFurnitureCategory(name, equipTab.id, equipParentCat.id);
    setIsLoading(false);
    if (res.success) {
      toast.success("Equipment added successfully");
      setOpenEquip(false);
      setName("");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to add equipment");
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
      <Button variant="outline" onClick={() => setOpenEquip(true)}>Add Equipment</Button>
      <Dialog open={openCat} onOpenChange={setOpenCat}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Furniture Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pre School Tables" required />
            </div>
            <div>
              <Label>Tab Section</Label>
              <Select value={tabId} onValueChange={(v) => setTabId(v || "")} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Form Tab" />
                </SelectTrigger>
                <SelectContent>
                  {tabs?.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Parent Category (Optional)</Label>
              <Select value={parentId} onValueChange={(v) => setParentId(v || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Parent Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Parent</SelectItem>
                  {categories?.filter(c => !c.parent_id).map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Category"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openEquip} onOpenChange={setOpenEquip}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEquipment} className="space-y-4">
            <div>
              <Label>Equipment Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wall Fan" required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Equipment"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Button variant="outline" onClick={() => setOpenLoc(true)}>Add Location</Button>
      <Dialog open={openLoc} onOpenChange={setOpenLoc}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Location</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddLocation} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Library" required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Location"}
            </Button>
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
              <Select value={parentId} onValueChange={(v) => setParentId(v || "")} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Grade 1" required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Grade"}
            </Button>
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
              <Select value={parentId} onValueChange={(v) => setParentId(v || "")} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 1A" required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Class"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
