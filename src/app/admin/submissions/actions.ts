"use server"

import { createAdminClient, createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCurrentUserEmail() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email || null
}

export async function getSubmissionById(id: string) {
  const supabase = await createAdminClient()
  const { data, error } = await supabase.from('employee_submissions').select('*').eq('id', id).single()
  if (error) throw new Error(error.message)
  return data
}

export async function getSubmissions() {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('employee_submissions')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function deleteSubmission(id: string) {
  const email = await getCurrentUserEmail()
  if (email !== 'binishkanayanananda80@gmail.com') {
    return { success: false, error: 'Only the super admin can delete records.' }
  }

  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('employee_submissions')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/submissions')
  return { success: true }
}

export async function updateSubmission(id: string, data: any) {
  const supabase = await createAdminClient()

  // 1. Check globally for NIC
  const { data: existingNic } = await supabase
    .from('employee_submissions')
    .select('id')
    .ilike('nic', data.nic)
    .neq('id', id)
    .limit(1)

  if (existingNic && existingNic.length > 0) {
    return { success: false, error: "An employee record already exists with this NIC number." }
  }

  // 2. Check within branch for EPF
  const { data: existingEpf } = await supabase
    .from('employee_submissions')
    .select('id')
    .eq('branch_id', data.branch_id)
    .ilike('epf_no', data.epf_no)
    .neq('id', id)
    .limit(1)

  if (existingEpf && existingEpf.length > 0) {
    return { success: false, error: "An employee record already exists with this EPF number in the selected branch." }
  }

  const { error } = await supabase.from('employee_submissions').update(data).eq('id', id)
  if (error) {
    if (error.code === '23505') {
       return { success: false, error: "Database error: This EPF number (in this branch) or NIC is already in use." }
    }
    return { success: false, error: error.message }
  }
  revalidatePath('/admin/submissions')
  return { success: true }
}
