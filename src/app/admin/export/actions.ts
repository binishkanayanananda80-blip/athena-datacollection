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
    .select('branch_id, branch_name, admission_no, first_name, middle_name, last_name, gender, dob, age, date_of_admission, student_type, category_master_id, curriculum_name, academic_year, enrolled_academic_year, grade, class, medium, nationality, religion, emergency_contact, student_lives_with, guardian_type, marital_status, is_living, status')
    .order('submitted_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}
