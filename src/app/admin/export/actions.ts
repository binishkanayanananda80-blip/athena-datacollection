"use server"

import { createAdminClient } from "@/lib/supabase/server"

export async function getExportData() {
  const supabase = await createAdminClient()

  // Fetch all submissions, ordered by submitted_at
  const { data, error } = await supabase
    .from('employee_submissions')
    .select('branch_id, branch_name, epf_no, first_name, middle_name, last_name, join_date, category_id, category_name, department_id, "Department", designation_id, "Designation", contract_type_name, nic, mobile, gender')
    .order('submitted_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function getStudentExportData() {
  const supabase = await createAdminClient()

  // Fetch all student submissions, ordered by submitted_at
  const { data, error } = await supabase
    .from('student_submissions')
    .select('branch_id, branch_name, admission_no, first_name, middle_name, last_name, gender, dob, age, date_of_admission, student_type, category_master_id, curriculum_name, academic_year, enrolled_academic_yr, grade, class, medium, nationality, religion, emergency_contact, student_lives_with, guardian_type, marital_status, is_living, status')
    .order('submitted_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function getParentExportData() {
  const supabase = await createAdminClient()

  // Fetch all parent submissions
  const { data: parents, error: parentsError } = await supabase
    .from('parent_submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (parentsError) {
    throw new Error(parentsError.message)
  }
  
  if (!parents || parents.length === 0) return []

  // Fetch all students to get branch info
  const { data: students, error: studentsError } = await supabase
    .from('student_submissions')
    .select('admission_no, branch_id, branch_name')
  
  if (studentsError) {
    throw new Error(studentsError.message)
  }

  // Create a map for quick lookup
  const studentMap = new Map()
  students?.forEach(s => {
    if (s.admission_no) {
      studentMap.set(s.admission_no, { branch_id: s.branch_id, branch_name: s.branch_name })
    }
  })

  // Attach branch info to each parent and filter out orphans
  const enrichedParents = parents
    .filter(p => studentMap.has(p.admission_no))
    .map(p => {
      const studentInfo = studentMap.get(p.admission_no);
      return {
        branch_id: studentInfo.branch_id,
        branch_name: studentInfo.branch_name,
        ...p
      }
    })

  return enrichedParents
}
