"use server"

import { createAdminClient, createClient } from "@/lib/supabase/server"

export async function checkIsAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}

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

export async function submitStudentData(formData: any) {
  const supabase = await createAdminClient()
  
  // 1. Check globally for Admission No within the same branch
  const { data: existingStudent } = await supabase
    .from('student_submissions')
    .select('id')
    .eq('branch_id', formData.branch_id)
    .ilike('admission_no', formData.admission_no)
    .limit(1)

  if (existingStudent && existingStudent.length > 0) {
    return { success: false, error: "A student record already exists with this Admission Number in the selected branch." }
  }

  const { error } = await supabase
    .from('student_submissions')
    .insert([formData])

  if (error) {
    if (error.code === '23505') { // unique violation
      return { success: false, error: "A student record already exists for this Admission Number in this branch." }
    }
    return { success: false, error: error.message }
  }

  return { success: true }
}

function parseDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  
  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Try DD/MM/YYYY or DD-MM-YYYY
  const dmMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmMatch) {
    const [_, d, m, y] = dmMatch;
    const paddedM = m.padStart(2, '0');
    const paddedD = d.padStart(2, '0');
    return `${y}-${paddedM}-${paddedD}`;
  }
  
  // Fallback to JS Date parsing
  const dObj = new Date(trimmed);
  if (!isNaN(dObj.getTime())) {
    return dObj.toISOString().split('T')[0];
  }
  
  return trimmed;
}

export async function submitBulkStudentData(records: any[]) {
  const supabase = await createAdminClient()
  
  const results = { successful: 0, failed: 0, errors: [] as string[] }

  for (const record of records) {
    const { data: existing } = await supabase
      .from('student_submissions')
      .select('id')
      .eq('branch_id', record.branch_id)
      .ilike('admission_no', record.admission_no)
      .limit(1)

    if (existing && existing.length > 0) {
      results.failed++
      results.errors.push(`Admission No ${record.admission_no} already exists in this branch.`)
      continue
    }

    // Sanitize record to prevent null constraint violations and format dates
    const sanitizedRecord = {
      ...record,
      dob: parseDate(record.dob) || '2000-01-01',
      date_of_admission: parseDate(record.date_of_admission) || new Date().toISOString().split('T')[0],
      student_type: record.student_type || 'Local',
      status: record.status || 'active',
      is_living: record.is_living || 'yes',
      gender: record.gender || 'Male',
      medium: record.medium || 'English',
      nationality: record.nationality || 'Sri Lankan'
    }

    const parentsToInsert = sanitizedRecord.parents;
    delete sanitizedRecord.parents;

    const { error } = await supabase
      .from('student_submissions')
      .insert([sanitizedRecord])

    if (error) {
      results.failed++
      results.errors.push(`Failed for ${record.admission_no}: ${error.message}`)
    } else {
      // Insert parents if they exist
      if (parentsToInsert && parentsToInsert.length > 0) {
        const parentRecords = parentsToInsert.map((p: any) => ({
          ...p,
          admission_no: record.admission_no
        }));
        
        await supabase.from('parent_submissions').insert(parentRecords);
      }
      
      results.successful++
    }
  }

  return { success: true, results }
}

export async function deleteAllStudentData() {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('student_submissions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // delete all using dummy uuid

  if (error) {
    return { success: false, error: error.message }
  }

  // Also delete all parent submissions to prevent orphaned data
  await supabase
    .from('parent_submissions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  return { success: true }
}
