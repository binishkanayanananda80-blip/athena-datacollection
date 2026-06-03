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
