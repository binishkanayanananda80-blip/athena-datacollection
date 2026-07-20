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
  const tabs = masterData.tabs || [];
  const [activeTabId, setActiveTabId] = useState<string>(tabs.length > 0 ? tabs[0].id : "");
  
  const activeTab = tabs.find((t: any) => t.id === activeTabId);
  const tabType = activeTab?.tab_type || "academic";

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
  let applicableCategories: any[] = [];
  if (tabType === "equipment") {
    // For equipment, all sub-categories assigned to this tab are applicable
    applicableCategories = masterData.categories.filter((cat: any) => cat.tab_id === activeTabId && cat.parent_id);
  } else if (tabType === "academic") {
    applicableCategories = masterData.categories.filter((cat: any) => {
      if (cat.tab_id !== activeTabId || !cat.parent_id) return false;
      
      const parentId = cat.parent_id;
      // We check mappings against the PARENT category
      const mappings = masterData.mappings.filter((m: any) => m.category_id === parentId);
      
      if (mappings.length === 0) return true; // fallback

      const result = mappings.some((m: any) => {
        if (m.class_id) return m.class_id === selectedClass;
        if (m.grade_id) return m.grade_id === selectedGrade;
        if (m.section_id) return m.section_id === selectedSection;
        return false;
      });
      console.log('Cat:', cat.name, 'Parent Mappings:', mappings, 'Result:', result);
      return result;
    });
    console.log('Applicable Categories:', applicableCategories);
  } else {
    // Locations
    applicableCategories = masterData.categories.filter((cat: any) => {
      // For locations, we don't care about tab_id because the original seed data didn't set tab_id for location furniture.
      // We just check if this category itself, or its parent, has a mapping for the selected location.
      const mappings = masterData.mappings.filter((m: any) => 
        m.category_id === cat.id || (cat.parent_id && m.category_id === cat.parent_id)
      );
      
      // If there are no location mappings for this category, it's not applicable here
      if (mappings.length === 0) return false;
      
      return mappings.some((m: any) => m.location_id === selectedLocation);
    });
  }

  // Group applicable categories by their parent
  const groupedCategories = applicableCategories.reduce((acc: any, cat: any) => {
    const parent = masterData.categories.find((c: any) => c.id === cat.parent_id);
    const parentName = parent ? parent.name : "Other";
    if (!acc[parentName]) acc[parentName] = [];
    acc[parentName].push(cat);
    return acc;
  }, {});

  // Load existing data when selection changes
  useEffect(() => {
    async function loadData() {
      if (tabType === "academic" && !selectedClass) return;
      if (tabType === "location" && !selectedLocation) return;
      // equipment needs no selection at the top level
      
      setIsLoadingData(true);
      try {
        const data = await fetchExistingFormData(
          academicYearId, 
          branchId, 
          tabType === "academic" ? selectedClass : undefined,
          tabType === "location" ? selectedLocation : undefined
        );
        
        if (tabType === "academic") {
          setExistingStudents(data.enrolments?.existing_students || 0);
          setNewAdmissions(data.enrolments?.new_admissions || 0);
        }

        // Initialize requirements array matching applicable categories
        const initReqs = applicableCategories.map((cat: any) => {
          let existing;
          if (tabType === "equipment") {
             // For equipment, fetch the exact row if it exists, but actually we should populate an empty row if no data, 
             // or multiple rows if there are multiple? 
             // The user asked for a dropdown per row. If we initialize one row per equipment category, they can select one location.
             existing = data.requirements.find((r: any) => r.furniture_category_id === cat.id);
          } else {
             existing = data.requirements.find((r: any) => r.furniture_category_id === cat.id);
          }
          
          return {
            id: existing?.id, // keep id to update correctly
            furniture_category_id: cat.id,
            category_name: cat.name,
            location_id: existing?.location_id || "", // for equipment
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
  }, [activeTabId, selectedClass, selectedLocation, academicYearId, branchId]);

  const handleSave = async (autoSave = false) => {
    if (tabType === "academic" && !selectedClass) return;
    if (tabType === "location" && !selectedLocation) return;
    
    // For equipment, enforce location selection
    if (tabType === "equipment") {
      const missingLocations = requirements.some(r => r.new_furniture_requirement > 0 && !r.location_id);
      if (missingLocations && !autoSave) {
        toast.error("Please select a location for equipment with requirements.");
        return;
      }
    }

    if (!autoSave) setIsSaving(true);
    
    const payload = {
      academic_year_id: academicYearId,
      branch_id: branchId,
      entry_type: tabType === "academic" ? "academic_class" : (tabType === "location" ? "non_academic_location" : "equipment"),
      class_id: tabType === "academic" ? selectedClass : null,
      location_id: tabType === "location" ? selectedLocation : null,
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
        // Only autosave equipment if they have selected locations for non-zero reqs
        if (tabType === 'equipment') {
           const missingLocations = requirements.some(r => r.new_furniture_requirement > 0 && !r.location_id);
           if (missingLocations) return;
        }
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

  const isFormReady = (tabType === "academic" && selectedClass) || 
                      (tabType === "location" && selectedLocation) || 
                      (tabType === "equipment");

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-6">
      {/* Navigation / Selection Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-6">
        <div className="flex flex-col gap-2 bg-slate-100 p-2 rounded-lg">
          {tabs.map((tab: any) => (
             <button
              key={tab.id}
              className={`w-full py-2 px-3 text-sm text-left font-medium rounded-md transition-colors ${
                activeTabId === tab.id ? "bg-white shadow-sm text-primary" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
              onClick={() => {
                setActiveTabId(tab.id);
                setSelectedSection("");
                setSelectedGrade("");
                setSelectedClass("");
                setSelectedLocation("");
                setRequirements([]);
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {tabType === "academic" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Section</label>
              <Select value={selectedSection} onValueChange={(v) => { setSelectedSection(v || ""); setSelectedGrade(""); setSelectedClass(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Section">
                    {selectedSection ? masterData.sections.find((s: any) => s.id === selectedSection)?.name : "Select Section"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {masterData.sections.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Grade</label>
              <Select value={selectedGrade} onValueChange={(v) => { setSelectedGrade(v || ""); setSelectedClass(""); }} disabled={!selectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Grade">
                    {selectedGrade ? grades.find((g: any) => g.id === selectedGrade)?.name : "Select Grade"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {grades.map((g: any) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Class</label>
              <Select value={selectedClass} onValueChange={(v) => setSelectedClass(v || "")} disabled={!selectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class">
                    {selectedClass ? classes.find((c: any) => c.id === selectedClass)?.name : "Select Class"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {tabType === "location" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Location</label>
              <Select value={selectedLocation} onValueChange={(v) => setSelectedLocation(v || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Location">
                    {selectedLocation ? masterData.locations.find((l: any) => l.id === selectedLocation)?.name : "Select Location"}
                  </SelectValue>
                </SelectTrigger>
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
        {isFormReady ? (
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <CardTitle>
                  {tabType === "academic" 
                    ? `Class: ${masterData.classes.find((c:any) => c.id === selectedClass)?.name}`
                    : tabType === "location" 
                      ? `Location: ${masterData.locations.find((l:any) => l.id === selectedLocation)?.name}`
                      : `${activeTab?.name} List`
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
                  {tabType === "academic" && (
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
                    {requirements.length > 0 ? (
                      <div className="border border-slate-200 rounded-lg overflow-hidden space-y-6 bg-white">
                        {Object.entries(groupedCategories).map(([parentName, cats]: [string, any]) => (
                          <div key={parentName} className="border-b last:border-b-0">
                            <div className="bg-slate-100 px-4 py-2 font-semibold text-sm text-slate-700">
                              {parentName}
                            </div>
                            <Table>
                              <TableHeader className="bg-white">
                                <TableRow>
                                  <TableHead className="w-[200px]">Item</TableHead>
                                  {tabType === "equipment" && <TableHead className="w-[200px]">Location</TableHead>}
                                  {tabType === "academic" && <TableHead className="w-[100px] text-center">Students</TableHead>}
                                  <TableHead className="w-[120px] text-center">Existing Qty</TableHead>
                                  <TableHead className="w-[120px] text-center">New Req.</TableHead>
                                  <TableHead>Remarks</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {cats.map((cat: any) => {
                                  const reqIndex = requirements.findIndex(r => r.furniture_category_id === cat.id);
                                  const req = requirements[reqIndex];
                                  if (!req) return null;
                                  return (
                                    <TableRow key={cat.id}>
                                      <TableCell className="font-medium text-slate-700">{req.category_name}</TableCell>
                                      
                                      {tabType === "equipment" && (
                                        <TableCell>
                                          <Select 
                                            value={req.location_id} 
                                            onValueChange={(v) => handleRequirementChange(reqIndex, 'location_id', v)}
                                          >
                                            <SelectTrigger className="h-9">
                                              <SelectValue placeholder="Select Location" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {masterData.locations.map((l: any) => (
                                                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </TableCell>
                                      )}

                                      {tabType === "academic" && (
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
                                          onChange={(e) => handleRequirementChange(reqIndex, 'existing_furniture_quantity', e.target.value)}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Input 
                                          type="number" 
                                          min="0"
                                          className="text-center font-bold text-primary"
                                          value={req.new_furniture_requirement}
                                          onChange={(e) => handleRequirementChange(reqIndex, 'new_furniture_requirement', e.target.value)}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Input 
                                          type="text" 
                                          placeholder="Optional notes..."
                                          value={req.remarks}
                                          onChange={(e) => handleRequirementChange(reqIndex, 'remarks', e.target.value)}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                        No items found for this selection.
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
            <p>Select a {tabType === "academic" ? "Class" : tabType === "location" ? "Location" : "Tab"} from the sidebar to begin data entry.</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
