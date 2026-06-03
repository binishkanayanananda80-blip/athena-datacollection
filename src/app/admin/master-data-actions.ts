"use server"

import { createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getBranches() {
  const supabase = await createAdminClient()
  const { data } = await supabase.from('branches').select('*').order('branch_id')
  return data || []
}

export async function toggleBranchStatus(id: number, active: boolean) {
  const supabase = await createAdminClient()
  await supabase.from('branches').update({ active }).eq('branch_id', id)
  revalidatePath('/admin/branches')
}

export async function updateBranchCount(id: number, count: number) {
  const supabase = await createAdminClient()
  await supabase.from('branches').update({ expected_employee_count: count }).eq('branch_id', id)
  revalidatePath('/admin/branches')
}

export async function addBranch(name: string, count: number) {
  const supabase = await createAdminClient()
  // auto increment or max + 1
  const { data: maxIdData } = await supabase.from('branches').select('branch_id').order('branch_id', { ascending: false }).limit(1)
  const nextId = (maxIdData?.[0]?.branch_id || 0) + 1
  
  await supabase.from('branches').insert([{ branch_id: nextId, branch_name: name, expected_employee_count: count, active: true }])
  revalidatePath('/admin/branches')
}

// Categories
export async function getCategories() {
  const supabase = await createAdminClient()
  const { data } = await supabase.from('categories').select('*').order('category_id')
  return data || []
}

export async function toggleCategoryStatus(id: number, active: boolean) {
  const supabase = await createAdminClient()
  await supabase.from('categories').update({ active }).eq('category_id', id)
  revalidatePath('/admin/categories')
}

export async function addCategory(id: number, name: string) {
  const supabase = await createAdminClient()
  
  // Check if ID already exists
  const { data: existing } = await supabase.from('categories').select('category_id').eq('category_id', id).single()
  if (existing) {
    throw new Error(`Category ID ${id} already exists. Please use a different ID.`)
  }

  const { error } = await supabase.from('categories').insert([{ category_id: id, category_name: name, active: true }])
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/categories')
}

// Departments
export async function getDepartments() {
  const supabase = await createAdminClient()
  const { data } = await supabase.from('departments').select('*, categories(category_name)').order('department_id')
  return data || []
}

export async function toggleDepartmentStatus(id: number, active: boolean) {
  const supabase = await createAdminClient()
  await supabase.from('departments').update({ active }).eq('department_id', id)
  revalidatePath('/admin/departments')
}

export async function addDepartment(id: number, name: string, category_id: number) {
  const supabase = await createAdminClient()
  
  const { data: existing } = await supabase.from('departments').select('department_id').eq('department_id', id).single()
  if (existing) {
    throw new Error(`Department ID ${id} already exists. Please use a different ID.`)
  }

  const { error } = await supabase.from('departments').insert([{ department_id: id, "Department": name, category_id, active: true }])
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/departments')
}

// Designations
export async function getDesignations() {
  const supabase = await createAdminClient()
  const { data } = await supabase.from('designations').select('*, departments("Department")').order('designation_id')
  return data || []
}

export async function toggleDesignationStatus(id: number, active: boolean) {
  const supabase = await createAdminClient()
  await supabase.from('designations').update({ active }).eq('designation_id', id)
  revalidatePath('/admin/designations')
}

export async function addDesignation(id: number, name: string, department_id: number) {
  const supabase = await createAdminClient()

  const { data: existing } = await supabase.from('designations').select('designation_id').eq('designation_id', id).single()
  if (existing) {
    throw new Error(`Designation ID ${id} already exists. Please use a different ID.`)
  }

  const { error } = await supabase.from('designations').insert([{ designation_id: id, "Designation": name, department_id, active: true }])
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/designations')
}

// Contract Types
export async function getContractTypes() {
  const supabase = await createAdminClient()
  const { data } = await supabase.from('contract_types').select('*').order('id')
  return data || []
}

export async function toggleContractTypeStatus(id: number, active: boolean) {
  const supabase = await createAdminClient()
  await supabase.from('contract_types').update({ active }).eq('id', id)
  revalidatePath('/admin/contract-types')
}

export async function addContractType(name: string) {
  const supabase = await createAdminClient()
  await supabase.from('contract_types').insert([{ contract_type_name: name, active: true }])
  revalidatePath('/admin/contract-types')
}
