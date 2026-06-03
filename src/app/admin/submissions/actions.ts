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
  const { error } = await supabase.from('employee_submissions').update(data).eq('id', id)
  if (error) {
    return { success: false, error: error.message }
  }
  revalidatePath('/admin/submissions')
  return { success: true }
}
