"use client";

import { useState, useEffect } from "react";
import { fetchExistingFormData, saveFurnitureDraft } from "@/lib/furniture-actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2, ArrowRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DataEntryClientProps {
  branchId: number;
  academicYearId: string;
  masterData: any;
}

export default function DataEntryClient({ branchId, academicYearId, masterData }: DataEntryClientProps) {
  const [activeTab, setActiveTab] = useState<"academic" | "locations">("academic");
  
  // Selection State
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  // Form State
  const [existingStudents, setExistingStudents] = useState<number>(0);
  const [newAdmissions, setNewAdmissions] = useState<number>(0);
  const totalStudents = existingStudents + newAdmissions;

  const [requirements, setRequirements] = useState<any[]>([]);
  
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Derived filtered options
  const grades = masterData.grades.filter((g: any) => g.section_id === selectedSection);
  const classes = masterData.classes.filter((c: any) => c.grade_id === selectedGrade);
  
  // Applicable categories based on context
  const applicableCategories = activeTab === "academic" 
    ? masterData.categories.filter((cat: any) => 
        masterData.mappings.some((m: any) => 
          m.category_id === cat.id && m.grade_id === selectedGrade
        )
      )
    : masterData.categories.filter((cat: any) => 
        masterData.mappings.some((m: any) => 
          m.category_id === cat.id && m.location_id === selectedLocation
        )
      );

  // Load existing data when selection changes
  useEffect(() => {
    async function loadData() {
      if (activeTab === "academic" && !selectedClass) return;
      if (activeTab === "locations" && !selectedLocation) return;
      
      setIsLoadingData(true);
      try {
        const data = await fetchExistingFormData(
          academicYearId, 
          branchId, 
          activeTab === "academic" ? selectedClass : undefined,
          activeTab === "locations" ? selectedLocation : undefined
        );
        
        if (activeTab === "academic") {
          setExistingStudents(data.enrolments?.existing_students || 0);
          setNewAdmissions(data.enrolments?.new_admissions || 0);
        }

        // Initialize requirements array matching applicable categories
        const initReqs = applicableCategories.map((cat: any) => {
          const existing = data.requirements.find((r: any) => r.furniture_category_id === cat.id);
          return {
            furniture_category_id: cat.id,
            category_name: cat.name,
            existing_furniture_quantity: existing?.existing_furniture_quantity ?? "",
            new_furniture_requirement: existing?.new_furniture_requirement ?? 0,
            remarks: existing?.remarks || ""
          };
        });
        
        setRequirements(initReqs);
        
      } catch (error) {
        toast.error("Failed to load existing data");
      } finally {
        setIsLoadingData(false);
      }
    }
    
    loadData();
  }, [activeTab, selectedClass, selectedLocation, academicYearId, branchId]);

  const handleSave = async (autoSave = false) => {
    if (activeTab === "academic" && !selectedClass) return;
    if (activeTab === "locations" && !selectedLocation) return;

    if (!autoSave) setIsSaving(true);
    
    const payload = {
      academic_year_id: academicYearId,
      branch_id: branchId,
      entry_type: activeTab === "academic" ? "academic_class" : "non_academic_location",
      class_id: activeTab === "academic" ? selectedClass : null,
      location_id: activeTab === "locations" ? selectedLocation : null,
      existing_students: existingStudents,
      new_admissions: newAdmissions,
      requirements: requirements
    };

    try {
      const res = await saveFurnitureDraft(payload);
      if (res.success) {
        setLastSaved(new Date());
        if (!autoSave) toast.success("Draft saved successfully");
      } else {
        toast.error(res.error || "Failed to save draft");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      if (!autoSave) setIsSaving(false);
    }
  };

  // Auto-save logic (debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (requirements.length > 0) {
        handleSave(true);
      }
    }, 2000); // Save after 2 seconds of inactivity
    
    return () => clearTimeout(handler);
  }, [existingStudents, newAdmissions, requirements]);

  const handleRequirementChange = (index: number, field: string, value: any) => {
    const newReqs = [...requirements];
    if (field === 'existing_furniture_quantity' || field === 'new_furniture_requirement') {
      newReqs[index][field] = value === '' ? '' : Number(value);
    } else {
      newReqs[index][field] = value;
    }
    setRequirements(newReqs);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Navigation / Selection Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-6">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === "academic" ? "bg-white shadow-sm text-primary" : "text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("academic")}
          >
            Academic Classes
          </button>
          <button
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === "locations" ? "bg-white shadow-sm text-primary" : "text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("locations")}
          >
            Other Locations
          </button>
        </div>

        {activeTab === "academic" ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Section</label>
              <Select value={selectedSection} onValueChange={(v) => { setSelectedSection(v || ""); setSelectedGrade(""); setSelectedClass(""); }}>
                <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
                <SelectContent>
                  {masterData.sections.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Grade</label>
              <Select value={selectedGrade} onValueChange={(v) => { setSelectedGrade(v || ""); setSelectedClass(""); }} disabled={!selectedSection}>
                <SelectTrigger><SelectValue placeholder="Select Grade" /></SelectTrigger>
                <SelectContent>
                  {grades.map((g: any) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Class</label>
              <Select value={selectedClass} onValueChange={(v) => setSelectedClass(v || "")} disabled={!selectedGrade}>
                <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Location</label>
              <Select value={selectedLocation} onValueChange={(v) => setSelectedLocation(v || "")}>
                <SelectTrigger><SelectValue placeholder="Select Location" /></SelectTrigger>
                <SelectContent>
                  {masterData.locations.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Main Data Entry Area */}
      <div className="flex-1">
        {((activeTab === "academic" && selectedClass) || (activeTab === "locations" && selectedLocation)) ? (
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <CardTitle>
                  {activeTab === "academic" 
                    ? `Class: ${masterData.classes.find((c:any) => c.id === selectedClass)?.name}`
                    : `Location: ${masterData.locations.find((l:any) => l.id === selectedLocation)?.name}`
                  }
                </CardTitle>
                {lastSaved && (
                  <p className="text-xs text-slate-400 mt-1">Draft saved at {lastSaved.toLocaleTimeString()}</p>
                )}
              </div>
              <Button onClick={() => handleSave(false)} disabled={isSaving || isLoadingData} size="sm" className="bg-[#232c5e] hover:bg-[#1a2147]">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Draft
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingData ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
              ) : (
                <div className="space-y-8">
                  {/* Academic Class Enrolment Section */}
                  {activeTab === "academic" && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <h3 className="text-sm font-medium text-slate-900 mb-4">Class Enrolment Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">Existing Students</label>
                          <Input 
                            type="number" 
                            min="0"
                            value={existingStudents} 
                            onChange={(e) => setExistingStudents(parseInt(e.target.value) || 0)} 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">New Admissions</label>
                          <Input 
                            type="number" 
                            min="0"
                            value={newAdmissions} 
                            onChange={(e) => setNewAdmissions(parseInt(e.target.value) || 0)} 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">Total Students</label>
                          <div className="h-10 flex items-center px-3 bg-slate-200 rounded-md font-bold text-slate-900">
                            {totalStudents}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Furniture Requirements Table */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-900 mb-4">Furniture Requirements</h3>
                    {requirements.length > 0 ? (
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader className="bg-slate-50">
                            <TableRow>
                              <TableHead className="w-[200px]">Category</TableHead>
                              {activeTab === "academic" && <TableHead className="w-[100px] text-center">Students</TableHead>}
                              <TableHead className="w-[150px] text-center">Existing Qty</TableHead>
                              <TableHead className="w-[150px] text-center">New Req.</TableHead>
                              <TableHead>Remarks</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {requirements.map((req, index) => (
                              <TableRow key={req.furniture_category_id}>
                                <TableCell className="font-medium text-slate-700">{req.category_name}</TableCell>
                                {activeTab === "academic" && (
                                  <TableCell className="text-center font-semibold text-slate-500 bg-slate-50/50">
                                    {totalStudents}
                                  </TableCell>
                                )}
                                <TableCell>
                                  <Input 
                                    type="number" 
                                    min="0"
                                    className="text-center"
                                    value={req.existing_furniture_quantity}
                                    onChange={(e) => handleRequirementChange(index, 'existing_furniture_quantity', e.target.value)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input 
                                    type="number" 
                                    min="0"
                                    className="text-center font-bold text-primary"
                                    value={req.new_furniture_requirement}
                                    onChange={(e) => handleRequirementChange(index, 'new_furniture_requirement', e.target.value)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input 
                                    type="text" 
                                    placeholder="Optional notes..."
                                    value={req.remarks}
                                    onChange={(e) => handleRequirementChange(index, 'remarks', e.target.value)}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                        No applicable furniture categories found for this selection.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
            <ArrowRight className="w-8 h-8 mb-4 text-slate-300" />
            <p>Select a {activeTab === "academic" ? "Class" : "Location"} from the sidebar to begin data entry.</p>
          </div>
        )}
      </div>
    </div>
  );
}
