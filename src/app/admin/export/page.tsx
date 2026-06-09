"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Loader2 } from "lucide-react"
import { getExportData, getStudentExportData, getParentExportData } from "./actions"
import Papa from "papaparse"

import masterMappings from "@/lib/mappings.json"

export default function ExportPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [isExportingStudents, setIsExportingStudents] = useState(false)
  const [isExportingParents, setIsExportingParents] = useState(false)

  async function handleParentExport() {
    setIsExportingParents(true)
    try {
      const data = await getParentExportData()
      
      const formattedData = data.map((row: any) => ({
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
      link.setAttribute("download", "athena_parent_data_export.csv")
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

  async function handleStudentExport() {
    setIsExportingStudents(true)
    try {
      const data = await getStudentExportData()
      
      const gradeToId: Record<string, string | number> = {};
      const classToId: Record<string, string | number> = {};
      masterMappings.Student.forEach((s: any) => {
        if (s.grade && s.grade_id) gradeToId[s.grade] = s.grade_id;
        if (s.class && s.class_id) classToId[s.class] = s.class_id;
      });
      const mediumToId: Record<string, string | number> = {};
      masterMappings.Medium.forEach((m: any) => {
        if (m.medium && m.medium_id) mediumToId[m.medium] = m.medium_id;
      });
      
      const getAcademicYearId = (name: string, branch_id: number, category_master_id: number) => {
        const match = masterMappings["Academic Year"].find((a: any) => 
          a.name === name && a.branch_id === branch_id && a.category_master_id === category_master_id
        );
        return match ? match.academic_year_id : "";
      }
      
      const formattedData = data.map((row: any) => ({
        branch_id: row.branch_id || "",
        branch_name: row.branch_name,
        admission_no: row.admission_no ? `\t${row.admission_no}` : "",
        first_name: row.first_name,
        middle_name: row.middle_name || "",
        last_name: row.last_name,
        gender: row.gender,
        dob: row.dob,
        age: row.age,
        date_of_admission: row.date_of_admission,
        student_type_id: row.student_type.toLowerCase() === 'local' ? 1 : (row.student_type.toLowerCase() === 'international' ? 2 : ""),
        student_type: row.student_type,
        category_master_id: row.category_master_id || (masterMappings.Curriculums.find((c: any) => c["Curriculum Name"] === row.curriculum_name)?.category_master_id || ""),
        curriculum: row.curriculum_name,
        academic_year_id: getAcademicYearId(row.academic_year, row.branch_id, row.category_master_id || (masterMappings.Curriculums.find((c: any) => c["Curriculum Name"] === row.curriculum_name)?.category_master_id || 0)),
        academic_year: row.academic_year,
        enrolled_academic_year_id: getAcademicYearId(row.enrolled_academic_year, row.branch_id, row.category_master_id || (masterMappings.Curriculums.find((c: any) => c["Curriculum Name"] === row.curriculum_name)?.category_master_id || 0)),
        enrolled_academic_year: row.enrolled_academic_year,
        grade_id: gradeToId[row.grade] || "",
        grade: row.grade,
        class_id: classToId[row.class] || "",
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
      }))

      const csv = Papa.unparse(formattedData)
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "athena_student_data_export.csv")
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
            <Button onClick={handleStudentExport} disabled={isExportingStudents} className="w-full" variant="secondary">
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
            <Button onClick={handleParentExport} disabled={isExportingParents} className="w-full" variant="outline">
              {isExportingParents ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing Export...</>
              ) : (
                <><Download className="mr-2 h-4 w-4" /> Download Parent CSV</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
