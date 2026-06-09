"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Loader2 } from "lucide-react"
import { getExportData, getStudentExportData } from "./actions"
import Papa from "papaparse"

export default function ExportPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [isExportingStudents, setIsExportingStudents] = useState(false)

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
      
      const formattedData = data.map((row: any) => ({
        branch_name: row.branch_name,
        admission_no: row.admission_no ? `\t${row.admission_no}` : "",
        first_name: row.first_name,
        middle_name: row.middle_name || "",
        last_name: row.last_name,
        gender: row.gender,
        dob: row.dob,
        age: row.age,
        date_of_admission: row.date_of_admission,
        student_type: row.student_type,
        curriculum_name: row.curriculum_name,
        academic_year: row.academic_year,
        enrolled_academic_year: row.enrolled_academic_year,
        grade: row.grade,
        class: row.class,
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
      </div>
    </div>
  )
}
