"use server"

import { createAdminClient } from "@/lib/supabase/server"
import { startOfDay, startOfWeek, startOfMonth } from "date-fns"

export async function getDashboardStats() {
  const supabase = await createAdminClient()

  // Execute all basic count queries in parallel
  const [
    { count: totalSubmissions },
    { count: totalBranches },
    { count: totalCategories },
    { count: totalDepartments },
    { count: totalDesignations },
  ] = await Promise.all([
    supabase.from('employee_submissions').select('*', { count: 'exact', head: true }),
    supabase.from('branches').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('departments').select('*', { count: 'exact', head: true }),
    supabase.from('designations').select('*', { count: 'exact', head: true }),
  ])

  // Get time-based submission counts
  const now = new Date()
  const today = startOfDay(now).toISOString()
  const thisWeek = startOfWeek(now).toISOString()
  const thisMonth = startOfMonth(now).toISOString()

  const [
    { count: todaySubmissions },
    { count: weekSubmissions },
    { count: monthSubmissions },
  ] = await Promise.all([
    supabase.from('employee_submissions').select('*', { count: 'exact', head: true }).gte('submitted_at', today),
    supabase.from('employee_submissions').select('*', { count: 'exact', head: true }).gte('submitted_at', thisWeek),
    supabase.from('employee_submissions').select('*', { count: 'exact', head: true }).gte('submitted_at', thisMonth),
  ])

  // Get data for charts (grouping handled in JS for simplicity, though could be SQL RPC)
  const { data: allSubmissions } = await supabase
    .from('employee_submissions')
    .select('branch_name, category_name, submitted_at, department_id, "Department"')
  
  const branchCounts: Record<string, number> = {}
  const categoryCounts: Record<string, number> = {}
  const dateCounts: Record<string, number> = {}
  
  allSubmissions?.forEach(sub => {
    // Branch
    branchCounts[sub.branch_name] = (branchCounts[sub.branch_name] || 0) + 1
    // Category
    categoryCounts[sub.category_name] = (categoryCounts[sub.category_name] || 0) + 1
    // Date
    const dateStr = sub.submitted_at.split('T')[0]
    dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1
  })

  const branchChartData = Object.entries(branchCounts).map(([name, count]) => ({ name, count }))
  const categoryChartData = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }))
  const dateChartData = Object.entries(dateCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Branch completion table
  const { data: branchesData } = await supabase
    .from('branches')
    .select('branch_id, branch_name, expected_employee_count')
    .order('branch_name')

  const completionData = branchesData?.map(b => {
    const submittedCount = branchCounts[b.branch_name] || 0
    const expected = b.expected_employee_count || 0
    const pending = expected > 0 ? Math.max(0, expected - submittedCount) : null
    const percentage = expected > 0 ? Math.min(100, Math.round((submittedCount / expected) * 100)) : null
    
    return {
      branch_name: b.branch_name,
      expected,
      submitted: submittedCount,
      pending,
      percentage
    }
  }) || []

  return {
    stats: {
      totalSubmissions: totalSubmissions || 0,
      totalBranches: totalBranches || 0,
      totalCategories: totalCategories || 0,
      totalDepartments: totalDepartments || 0,
      totalDesignations: totalDesignations || 0,
      todaySubmissions: todaySubmissions || 0,
      weekSubmissions: weekSubmissions || 0,
      monthSubmissions: monthSubmissions || 0,
    },
    charts: {
      branchChartData,
      categoryChartData,
      dateChartData,
    },
    completionData
  }
}
