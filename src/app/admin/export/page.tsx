"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Download, Loader2 } from "lucide-react"
import { getExportData, getStudentExportData, getParentExportData } from "./actions"
import { getBranches } from "../master-data-actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Papa from "papaparse"

import masterMappings from "@/lib/mappings.json"
import { getMappedIds, getAcademicYearIdForBranch } from "@/lib/id-mapper"

export default function ExportPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [isExportingStudents, setIsExportingStudents] = useState(false)
  const [isExportingParents, setIsExportingParents] = useState(false)
  const [isBranchExporting, setIsBranchExporting] = useState(false)
  
  const [branches, setBranches] = useState<any[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [exportStudents, setExportStudents] = useState(true)
  const [exportParents, setExportParents] = useState(true)

  useEffect(() => {
    async function loadBranches() {
      const data = await getBranches()
      setBranches(data)
    }
    loadBranches()
  }, [])

  async function handleParentExport(branchName?: string, customFileName?: string) {
    setIsExportingParents(true)
    try {
      const data = await getParentExportData(branchName)
      
      if (!data || data.length === 0) {
        alert(`No parent data available${branchName ? ` for ${branchName}` : ''}.`)
        return false;
      }
      
      const formattedData = data.map((row: any) => ({
        branch_id: row.branch_id || "",
        branch_name: row.branch_name || "",
        admission_no: row.admission_no ? `\t${row.admission_no}` : "",
        guardian_type: row.guardian_type,
        nic: row.nic ? `\t${row.nic}` : "",
        initial_name: row.initial_name || "",
        name_with_initial: row.name_with_initial || "",
        first_name: row.first_name || "",
        middle_name: row.middle_name || "",
        last_name: row.last_name || "",
        mobile: row.mobile ? `\t${row.mobile}` : "",
        home_phone: row.home_phone ? `\t${row.home_phone}` : "",
        personal_email: row.personal_email || "",
        work_email: row.work_email || "",
        school_email: row.school_email || "",
        city: row.city || "",
        district: row.district || "",
        grama_niladhari_division: row.grama_niladhari_division || "",
        permanent_address: row.permanent_address || "",
      }))

      const csv = Papa.unparse(formattedData)
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", customFileName || "athena_parent_data_export.csv")
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (error) {
      console.error("Export failed", error)
      alert("Failed to export parent data.")
    } finally {
      setIsExportingParents(false)
    }
  }

  async function handleExport() {
    setIsExporting(true)
    try {
      const data = await getExportData()
      
      const formattedData = data.map((row: any) => ({
        branch_id: row.branch_id,
        branch_name: row.branch_name,
        epf_no: row.epf_no ? `\t${row.epf_no}` : "",
        first_name: row.first_name,
        middle_name: row.middle_name || "",
        last_name: row.last_name,
        join_date: row.join_date,
        category_id: row.category_id,
        category_name: row.category_name,
        department_id: row.department_id,
        Department: row.Department,
        designation_id: row.designation_id,
        Designation: row.Designation,
        contract_type_name: row.contract_type_name,
        nic: row.nic ? `\t${row.nic}` : "",
        mobile: row.mobile ? `\t${row.mobile}` : "",
        gender: row.gender,
      }))

      const csv = Papa.unparse(formattedData)
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "athena_employee_data_export.csv")
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (error) {
      console.error("Export failed", error)
      alert("Failed to export data.")
    } finally {
      setIsExporting(false)
    }
  }

  async function handleStudentExport(branchName?: string, customFileName?: string) {
    setIsExportingStudents(true)
    try {
      const data = await getStudentExportData(branchName)
      
      if (!data || data.length === 0) {
        alert(`No student data available${branchName ? ` for ${branchName}` : ''}.`)
        return false;
      }
      
      const gradeToId: Record<string, string | number> = {};
      const classToId: Record<string, string | number> = {};
      const academicYearToId: Record<string, string | number> = {};
      const enrolledAcademicYearToId: Record<string, string | number> = {};
      masterMappings.Student.forEach((s: any) => {
        if (s.grade && s.grade_id) gradeToId[s.grade] = s.grade_id;
        if (s.class && s.class_id) classToId[s.class] = s.class_id;
        if (s["academic year"] && s.academic_year_id) academicYearToId[s["academic year"]] = s.academic_year_id;
        if (s["enrolled academic year"] && s.enrolled_academic_year_id) enrolledAcademicYearToId[s["enrolled academic year"]] = s.enrolled_academic_year_id;
      });
      const mediumToId: Record<string, string | number> = {};
      masterMappings.Medium.forEach((m: any) => {
        if (m.medium && m.medium_id) mediumToId[m.medium] = m.medium_id;
      });
      
      const getClassId = (grade: string, cls: string) => {
        let actualGrade = grade;
        let actualClass = cls;
        if (!actualClass && actualGrade) actualClass = actualGrade;
        if (!actualGrade && actualClass) actualGrade = actualClass;

        if (!actualClass) return "";
        if (classToId[actualClass]) return classToId[actualClass];
        
        // Strip suffixes like -1 from classes
        const strippedClass = actualClass.replace(/-\d+$/, "").trim();
        if (classToId[strippedClass]) return classToId[strippedClass];

        if (!actualGrade) return "";
        
        let prefix = "";
        const normGrade = actualGrade.toLowerCase().replace(/kingdergarten/g, "kindergarten").replace(/-\d+$/, "").trim();
        if (normGrade.includes("kindergarten 1")) prefix = "KG 1";
        else if (normGrade.includes("kindergarten 2")) prefix = "KG 2";
        else if (normGrade.includes("primary 01") || normGrade.includes("primary 1")) prefix = "1";
        else if (normGrade.includes("primary 02") || normGrade.includes("primary 2")) prefix = "2";
        else if (normGrade.includes("primary 03") || normGrade.includes("primary 3")) prefix = "3";
        else if (normGrade.includes("primary 04") || normGrade.includes("primary 4")) prefix = "4";
        else if (normGrade.includes("primary 05") || normGrade.includes("primary 5")) prefix = "5";
        else if (normGrade.includes("play group")) prefix = "PG";
        else if (normGrade.includes("grade 09") || normGrade.includes("grade 9")) prefix = "9";
        
        if (prefix) {
          if (classToId[`${prefix} ${actualClass}`]) return classToId[`${prefix} ${actualClass}`];
          if (classToId[`${prefix}${actualClass}`]) return classToId[`${prefix}${actualClass}`];
        }
        
        const match = masterMappings.Student.find((s: any) => s.class && (s.class.endsWith(actualClass) || s.class.endsWith(strippedClass)));
        return match ? match.class_id : "";
      };

      const getGradeId = (name: string, cls: string) => {
        if (!name && cls) name = cls;
        if (!name) return "";
        
        // Fix typos and strip suffixes like "-1" or "-2"
        name = name.replace(/kingdergarten/ig, "Kindergarten");
        name = name.replace(/-\d+$/, "").trim();
        
        // Normalize "Form 3" -> "Form 03", "Grade 9" -> "Grade 09", etc.
        name = name.replace(/(\bForm|\bGrade|\bPrimary)\s+(\d)$/i, '$1 0$2');
        name = name.replace(/(\bForm|\bGrade|\bPrimary)(\d)$/i, '$1 0$2');
        
        // Hardcode missing Form IDs that don't exist in mappings.json
        const fallbackGradeIds: Record<string, number> = {
           "form 03": 11,
           "form 04": 12,
           "form 05": 13
        };
        const normName = name.toLowerCase();
        if (fallbackGradeIds[normName]) return fallbackGradeIds[normName];
        
        if (gradeToId[name]) return gradeToId[name];
        
        const normalized = name.replace(/ (\d)$/, ' 0$1'); 
        if (gradeToId[normalized]) return gradeToId[normalized];
        
        const normalized2 = name.replace(/ 0(\d)$/, ' $1'); 
        if (gradeToId[normalized2]) return gradeToId[normalized2];

        const match = masterMappings.Student.find((s: any) => 
          s.grade && (
            s.grade.toLowerCase() === name.toLowerCase() ||
            s.grade.toLowerCase() === normalized.toLowerCase() ||
            s.grade.toLowerCase() === normalized2.toLowerCase()
          )
        );
        if (match && match.grade_id) return match.grade_id;

        // Fallback: If it's a Local Syllabus grade (e.g. "Grade 11") that only has a class_id in mappings.json
        const classMatch = masterMappings.Student.find((s: any) => s.class && (
            s.class.toLowerCase() === name.toLowerCase() || 
            s.class.toLowerCase() === normalized.toLowerCase()
        ));
        return classMatch ? (classMatch.grade_id || classMatch.class_id || "") : "";
      };
      
      const getAcademicYearId = (name: string, branchId: string | number, branchName?: string) => {
        if (!name) return "";
        const branchMatch = getAcademicYearIdForBranch(branchId, name, branchName);
        if (branchMatch) return branchMatch;

        const match = masterMappings.Student.find((s: any) => 
          s["academic year"] === name || 
          s["academic year"]?.trim() === name?.trim() ||
          s.academic_year === name
        );
        return match ? match.academic_year_id : "";
      }

      const getEnrolledAcademicYearId = (name: string, branchId: string | number, branchName?: string) => {
        if (!name) return "";
        const branchMatch = getAcademicYearIdForBranch(branchId, name, branchName);
        if (branchMatch) return branchMatch;

        const match = masterMappings.Student.find((s: any) => 
          s["enrolled academic year"] === name || 
          s["enrolled academic year"]?.trim() === name?.trim() ||
          s.enrolled_academic_year === name
        );
        return match ? match.enrolled_academic_year_id : "";
      }


      const calculateAge = (dobString: string) => {
        if (!dobString) return 0;
        const dob = new Date(dobString);
        if (isNaN(dob.getTime())) return 0;
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        return age >= 0 ? age : 0;
      };
      
      const formattedData = data.map((row: any) => {
        const branchName = branchMap[row.branch_id?.toString()] || row.branch_name;

        // Fallback to our new mapped IDs if the database record doesn't have them yet
        const mapped = (!row.grade_id || !row.class_id) 
          ? getMappedIds(row.branch_id, row.grade, row.class, branchName)
          : { section_id: null, section_name: null, grade_id: null, class_id: null };

        return {
          branch_id: row.branch_id || "",
          branch_name: row.branch_name,
          admission_no: row.admission_no ? `\t${row.admission_no}` : "",
          first_name: row.first_name,
          middle_name: row.middle_name || "",
          last_name: row.last_name,
          gender: row.gender,
          dob: row.dob,
          age: calculateAge(row.dob),
          date_of_admission: row.date_of_admission,
          student_type_id: row.student_type?.toLowerCase() === 'local' ? 1 : (row.student_type?.toLowerCase() === 'international' ? 2 : ""),
          student_type: row.student_type,
          category_master_id: row.category_master_id || (masterMappings.Curriculums.find((c: any) => c["Curriculum Name"] === row.curriculum_name)?.category_master_id || ""),
          curriculum: row.curriculum_name,
          academic_year_id: getAcademicYearId(row.academic_year, row.branch_id, branchName),
          academic_year: row.academic_year,
          enrolled_academic_yr: getEnrolledAcademicYearId(row.enrolled_academic_yr, row.branch_id, branchName),
          enrolled_academic_year: row.enrolled_academic_yr,
          section_id: row.section_id || mapped.section_id || "",
          section_name: row.section_name || mapped.section_name || "",
          grade_id: row.grade_id || mapped.grade_id || getGradeId(row.grade, row.class) || "",
          grade: row.grade,
          class_id: row.class_id || mapped.class_id || getClassId(row.grade, row.class) || "",
          class: row.class,
          medium_id: mediumToId[row.medium] || "",
          medium: row.medium,
        nationality: row.nationality,
        religion: row.religion,
        emergency_contact: row.emergency_contact,
        student_lives_with: row.student_lives_with,
        guardian_type: row.guardian_type,
        marital_status: row.marital_status,
        is_living: row.is_living,
        status: row.status,
        };
      })

      const csv = Papa.unparse(formattedData)
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", customFileName || "athena_student_data_export.csv")
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (error) {
      console.error("Export failed", error)
      alert("Failed to export student data.")
    } finally {
      setIsExportingStudents(false)
    }
  }

  async function handleBranchExport() {
    if (!selectedBranch) return;
    if (!exportStudents && !exportParents) return;
    
    setIsBranchExporting(true)
    try {
      const formattedBranchName = selectedBranch.replace(/\s+/g, '_')
      
      if (exportStudents) {
        await handleStudentExport(selectedBranch, `${formattedBranchName}_studentdata_athena.csv`)
      }
      
      if (exportStudents && exportParents) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      if (exportParents) {
        await handleParentExport(selectedBranch, `${formattedBranchName}_parentdata_athena.csv`)
      }
      
    } catch (error) {
      console.error("Branch export failed", error)
      alert("Failed to export branch data.")
    } finally {
      setIsBranchExporting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CSV Export</h1>
        <p className="text-muted-foreground">Download data for Athena School Management System.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Employee Export</CardTitle>
            <CardDescription>
              This will download all employee records in the format required by the Athena system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} disabled={isExporting} className="w-full">
              {isExporting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing Export...</>
              ) : (
                <><Download className="mr-2 h-4 w-4" /> Download Employee CSV</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Export</CardTitle>
            <CardDescription>
              This will download all student records. The downloaded file will be named <strong>athena_student_data_export.csv</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleStudentExport()} disabled={isExportingStudents} className="w-full" variant="secondary">
              {isExportingStudents ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing Export...</>
              ) : (
                <><Download className="mr-2 h-4 w-4" /> Download Student CSV</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parent Export</CardTitle>
            <CardDescription>
              This will download all extracted parent data for your students.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleParentExport()} disabled={isExportingParents} className="w-full" variant="outline">
              {isExportingParents ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing Export...</>
              ) : (
                <><Download className="mr-2 h-4 w-4" /> Download Parent CSV</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Branch-Wise Export</CardTitle>
            <CardDescription>
              Select a branch and the type of data to download. Files will be named dynamically based on the branch.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Branch</Label>
              <Select value={selectedBranch} onValueChange={(val) => setSelectedBranch(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a branch..." />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.branch_id} value={b.branch_name}>
                      {b.branch_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-6 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="export-students" 
                  checked={exportStudents} 
                  onCheckedChange={(c) => setExportStudents(c === true)} 
                />
                <Label htmlFor="export-students" className="cursor-pointer">Student Data</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="export-parents" 
                  checked={exportParents} 
                  onCheckedChange={(c) => setExportParents(c === true)} 
                />
                <Label htmlFor="export-parents" className="cursor-pointer">Parent Data</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleBranchExport} 
              disabled={isBranchExporting || !selectedBranch || (!exportStudents && !exportParents)} 
              className="w-full"
            >
              {isBranchExporting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing Export...</>
              ) : (
                <><Download className="mr-2 h-4 w-4" /> Download Branch CSV(s)</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
