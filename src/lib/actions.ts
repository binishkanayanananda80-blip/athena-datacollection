"use server"

import { createAdminClient } from "@/lib/supabase/server"

export async function getActiveBranches() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('branches')
    .select('branch_id, branch_name')
    .eq('active', true)
    .order('branch_name')
  
  if (error) throw new Error(error.message)
  return data
}

export async function getActiveCategories() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .select('category_id, category_name')
    .eq('active', true)
    .order('category_name')
  
  if (error) throw new Error(error.message)
  return data
}

export async function getDepartmentsByCategory(categoryId: number) {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('departments')
    .select('department_id, Department')
    .eq('category_id', categoryId)
    .eq('active', true)
    .order('Department')
  
  if (error) throw new Error(error.message)
  return data
}

export async function getDesignationsByDepartment(departmentId: number) {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('designations')
    .select('designation_id, Designation')
    .eq('department_id', departmentId)
    .eq('active', true)
    .order('Designation')
  
  if (error) throw new Error(error.message)
  return data
}

export async function getActiveContractTypes() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('contract_types')
    .select('contract_type_name')
    .eq('active', true)
    .order('contract_type_name')
  
  if (error) throw new Error(error.message)
  return data
}

export async function submitEmployeeData(formData: any) {
  const supabase = await createAdminClient()
  
  // 1. Check globally for NIC
  const { data: existingNic } = await supabase
    .from('employee_submissions')
    .select('id')
    .ilike('nic', formData.nic)
    .limit(1)

  if (existingNic && existingNic.length > 0) {
    return { success: false, error: "An employee record already exists with this NIC number." }
  }

  // 2. Check within branch for EPF
  const { data: existingEpf } = await supabase
    .from('employee_submissions')
    .select('id')
    .eq('branch_id', formData.branch_id)
    .ilike('epf_no', formData.epf_no)
    .limit(1)

  if (existingEpf && existingEpf.length > 0) {
    return { success: false, error: "An employee record already exists with this EPF number in the selected branch." }
  }

  const { error } = await supabase
    .from('employee_submissions')
    .insert([formData])

  if (error) {
    if (error.code === '23505') { // unique violation
      return { success: false, error: "An employee record already exists for this EPF number or NIC number." }
    }
    return { success: false, error: error.message }
  }

  return { success: true }
}
