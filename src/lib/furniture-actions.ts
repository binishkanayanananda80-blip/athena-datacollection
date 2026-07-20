"use server"

import { createAdminClient, createClient } from "@/lib/supabase/server"

// --- Branch Registration ---

export async function getAvailableBranchesForRegistration() {
  const supabase = await createAdminClient();
  
  // Get all active branches
  const { data: branches, error: branchError } = await supabase
    .from('branches')
    .select('branch_id, branch_name')
    .eq('active', true)
    .order('branch_name');
    
  if (branchError) throw new Error(branchError.message);
  
  // Get branches that already have an Active or Pending registration
  const { data: registeredBranches, error: regError } = await supabase
    .from('furniture_branch_registrations')
    .select('branch_id')
    .in('status', ['Pending Approval', 'Active']);
    
  if (regError) throw new Error(regError.message);
  
  const registeredIds = new Set(registeredBranches.map(r => r.branch_id));
  
  return branches.map(b => ({
    ...b,
    isAvailable: true
  }));
}

export async function registerBranchUser(formData: {
  branch_id: number;
  full_name: string;
  username: string;
  email: string;
  mobile?: string;
  password?: string; // We'll handle auth user creation upon approval, or immediately? 
  // Wait, if we create it immediately, they can log in but be blocked by RLS.
  // Actually, creating the auth account in 'registerBranchUser' makes password management easier.
}) {
  const supabase = await createAdminClient();
  
  // 1. Transactional safety using standard insert with unique index protection
  // Lowercase email and username for consistency
  const email = formData.email.toLowerCase();
  const username = formData.username.toLowerCase();
  
  // Removed the check to allow multiple users to register for the same branch

  // 2. Check username/email uniqueness in registration table
  const { data: existingUser } = await supabase
    .from('furniture_branch_registrations')
    .select('id, username, email')
    .or(`username.eq.${username},email.eq.${email}`)
    .limit(1);
    
  if (existingUser && existingUser.length > 0) {
    if (existingUser[0].email === email) return { success: false, error: 'Email is already registered.' };
    if (existingUser[0].username === username) return { success: false, error: 'Username is already taken.' };
  }

  // 3. Create Supabase Auth User
  // We'll create it now, but without branch_assignment so they can't do anything yet.
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: formData.password,
    email_confirm: true, // Auto-confirm for this flow
    user_metadata: {
      full_name: formData.full_name,
      username: username,
      module: 'furniture'
    }
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  const userId = authData.user.id;

  // 4. Create Registration Record
  const { error: regError } = await supabase
    .from('furniture_branch_registrations')
    .insert([{
      branch_id: formData.branch_id,
      user_id: userId,
      full_name: formData.full_name,
      username: username,
      email: email,
      mobile: formData.mobile,
      status: 'Active'
    }]);

  if (regError) {
    // Rollback auth user
    await supabase.auth.admin.deleteUser(userId);
    return { success: false, error: 'Failed to create registration record. ' + regError.message };
  }
  
  // 5. Add to user roles as 'branch_user'
  const { error: roleError } = await supabase.from('furniture_user_roles').insert([{
    user_id: userId,
    role: 'branch_user'
  }]);

  // 6. Assign branch to user automatically
  await supabase.from('furniture_branch_assignments').insert([{
    user_id: userId,
    branch_id: formData.branch_id
  }]);

  return { success: true };
}

// Admin approves registration
export async function approveRegistration(registrationId: string) {
  const supabase = await createAdminClient();
  
  // Get registration
  const { data: reg, error: fetchError } = await supabase
    .from('furniture_branch_registrations')
    .select('*')
    .eq('id', registrationId)
    .single();
    
  if (fetchError || !reg) return { success: false, error: 'Registration not found' };
  
  if (reg.status === 'Active') return { success: false, error: 'Registration is already active' };

  // Assign branch to user
  const { error: assignError } = await supabase
    .from('furniture_branch_assignments')
    .insert([{
      user_id: reg.user_id,
      branch_id: reg.branch_id
    }]);
    
  if (assignError) return { success: false, error: assignError.message };
  
  // Update registration status
  const { error: updateError } = await supabase
    .from('furniture_branch_registrations')
    .update({ status: 'Active', updated_at: new Date().toISOString() })
    .eq('id', registrationId);
    
  if (updateError) return { success: false, error: updateError.message };
  
  return { success: true };
}

export async function rejectRegistration(registrationId: string) {
  const supabase = await createAdminClient();
  
  const { error } = await supabase
    .from('furniture_branch_registrations')
    .update({ status: 'Rejected', updated_at: new Date().toISOString() })
    .eq('id', registrationId);
    
  if (error) return { success: false, error: error.message };
  
  return { success: true };
}

export async function loginBranchUser(formData: { identifier: string; password: string }) {
  const supabase = await createClient(); // Use regular client for login
  
  const identifier = formData.identifier.toLowerCase();
  
  // 1. Resolve identifier to email if it's a username
  let emailToLogin = identifier;
  
  // If it doesn't look like an email, assume it's a username
  if (!identifier.includes('@')) {
    const supabaseAdmin = await createAdminClient();
    const { data: userReg } = await supabaseAdmin
      .from('furniture_branch_registrations')
      .select('email, status')
      .eq('username', identifier)
      .single();
      
    if (!userReg) {
      return { success: false, error: 'Invalid login credentials.' };
    }
    
    if (userReg.status === 'Rejected') return { success: false, error: 'Your registration was rejected.' };
    if (userReg.status === 'Deactivated') return { success: false, error: 'Your account has been deactivated.' };
    
    emailToLogin = userReg.email;
  } else {
    // It's an email, still verify status
    const supabaseAdmin = await createAdminClient();
    const { data: userReg } = await supabaseAdmin
      .from('furniture_branch_registrations')
      .select('status')
      .eq('email', identifier)
      .single();
      
    if (userReg) {
      if (userReg.status === 'Rejected') return { success: false, error: 'Your registration was rejected.' };
      if (userReg.status === 'Deactivated') return { success: false, error: 'Your account has been deactivated.' };
    }
  }

  // 2. Perform Supabase Auth Login
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailToLogin,
    password: formData.password,
  });

  if (error) {
    return { success: false, error: 'Invalid login credentials.' };
  }

  return { success: true };
}
export async function getCurrentFurnitureUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log("getCurrentFurnitureUser: supabase.auth.getUser() returned null user.");
    return null;
  }

  // Since regular users might not have access to view registrations due to RLS,
  // we bypass RLS by using the admin client.
  const supabaseAdmin = await createAdminClient(); 
  
  const { data: reg, error } = await supabaseAdmin
    .from('furniture_branch_registrations')
    .select('*, branches(branch_name)')
    .eq('user_id', user.id)
    .single();

  if (error || !reg) {
     console.log("getCurrentFurnitureUser: Error fetching registration or no reg found:", error?.message);
     return { user, status: null };
  }
  
  console.log("getCurrentFurnitureUser: Successfully found user and registration for:", user.id);
  return { user, status: reg.status, registration: reg };
}

export async function getMasterDataForEntry() {
  const supabase = await createClient();
  
  // Need to bypass RLS for master data if branch user RLS is tricky, but we made master data readable to authenticated.
  const [sectionsRes, gradesRes, classesRes, locationsRes, categoriesRes, mappingsRes, yearRes, tabsRes] = await Promise.all([
    supabase.from('furniture_sections').select('*').eq('is_active', true).order('display_order'),
    supabase.from('furniture_grades').select('*').eq('is_active', true).order('display_order'),
    supabase.from('furniture_classes').select('*').eq('is_active', true).order('display_order'),
    supabase.from('furniture_locations').select('*').eq('is_active', true).order('display_order'),
    supabase.from('furniture_categories').select('*').eq('is_active', true).order('display_order'),
    supabase.from('furniture_category_mappings').select('*'),
    supabase.from('furniture_academic_years').select('id, name').eq('is_current', true).single(),
    supabase.from('furniture_form_tabs').select('*').eq('is_active', true).order('display_order')
  ]);

  return {
    sections: sectionsRes.data || [],
    grades: gradesRes.data || [],
    classes: classesRes.data || [],
    locations: locationsRes.data || [],
    categories: categoriesRes.data || [],
    mappings: mappingsRes.data || [],
    tabs: tabsRes.data || [],
    currentYear: yearRes.data
  };
}

export async function saveFurnitureDraft(data: any) {
  const supabase = await createClient(); // RLS will protect based on auth user
  const { user } = await getCurrentFurnitureUser() || {};
  if (!user) return { success: false, error: 'Unauthorized' };
  
  // Data payload will contain branch_id, academic_year_id, class_id/location_id, and requirements array, plus enrolment data
  
  // First, upsert the submission record
  const { data: subData, error: subError } = await supabase
    .from('furniture_submissions')
    .upsert({
      academic_year_id: data.academic_year_id,
      branch_id: data.branch_id,
      status: 'Draft',
      updated_at: new Date().toISOString()
    }, { onConflict: 'academic_year_id, branch_id' })
    .select('id')
    .single();

  if (subError) return { success: false, error: subError.message };

  // If this is an academic class, upsert enrolment
  if (data.entry_type === 'academic_class' && data.class_id) {
    await supabase
      .from('furniture_class_enrolments')
      .upsert({
        academic_year_id: data.academic_year_id,
        branch_id: data.branch_id,
        class_id: data.class_id,
        existing_students: data.existing_students || 0,
        new_admissions: data.new_admissions || 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'academic_year_id, branch_id, class_id' });
  }

  // Upsert the requirements
  if (data.requirements && data.requirements.length > 0) {
    const reqsToUpsert = data.requirements.map((req: any) => ({
      academic_year_id: data.academic_year_id,
      branch_id: data.branch_id,
      entry_type: data.entry_type,
      class_id: data.entry_type === 'academic_class' ? data.class_id : null,
      location_id: (data.entry_type === 'non_academic_location' || data.entry_type === 'equipment') ? (data.location_id || req.location_id) : null,
      furniture_category_id: req.furniture_category_id,
      existing_furniture_quantity: req.existing_furniture_quantity !== '' ? req.existing_furniture_quantity : null,
      new_furniture_requirement: req.new_furniture_requirement || 0,
      remarks: req.remarks || null,
      submission_id: subData.id,
      updated_at: new Date().toISOString()
    }));

    // Fetch existing requirements for this class/location to determine what to update vs insert
    let query = supabase
      .from('furniture_requirements')
      .select('id, furniture_category_id, location_id')
      .eq('academic_year_id', data.academic_year_id)
      .eq('branch_id', data.branch_id)
      .eq('entry_type', data.entry_type);
      
    if (data.entry_type === 'academic_class') {
      query = query.eq('class_id', data.class_id);
    } else if (data.entry_type === 'non_academic_location') {
      query = query.eq('location_id', data.location_id);
    }
    // For equipment, we fetch all for the branch/entry_type and match by both category and location later

    const { data: existingReqs, error: fetchError } = await query;
    if (fetchError) return { success: false, error: fetchError.message };

    // Key by category_id AND location_id to be safe
    const existingMap = new Map((existingReqs || []).map(r => [`${r.furniture_category_id}_${r.location_id || 'null'}`, r.id]));

    const toInsert = [];
    const toUpdate = [];

    for (const req of reqsToUpsert) {
      const existingId = existingMap.get(`${req.furniture_category_id}_${req.location_id || 'null'}`);
      if (existingId) {
        toUpdate.push({ ...req, id: existingId });
      } else {
        toInsert.push(req);
      }
    }

    if (toInsert.length > 0) {
      const { error: insertError } = await supabase.from('furniture_requirements').insert(toInsert);
      if (insertError) return { success: false, error: insertError.message };
    }

    if (toUpdate.length > 0) {
      const { error: updateError } = await supabase.from('furniture_requirements').upsert(toUpdate);
      if (updateError) return { success: false, error: updateError.message };
    }
  }

  return { success: true, savedAt: new Date().toISOString() };
}

export async function fetchExistingFormData(academicYearId: string, branchId: number, classId?: string, locationId?: string) {
  const supabase = await createClient();
  
  let enrolments = null;
  let requirements = [];

  if (classId) {
    const { data: enrData } = await supabase
      .from('furniture_class_enrolments')
      .select('*')
      .eq('academic_year_id', academicYearId)
      .eq('branch_id', branchId)
      .eq('class_id', classId)
      .single();
    enrolments = enrData;

    const { data: reqData } = await supabase
      .from('furniture_requirements')
      .select('*')
      .eq('academic_year_id', academicYearId)
      .eq('branch_id', branchId)
      .eq('class_id', classId);
    requirements = reqData || [];
  }

  if (locationId) {
    const { data: reqData } = await supabase
      .from('furniture_requirements')
      .select('*')
      .eq('academic_year_id', academicYearId)
      .eq('branch_id', branchId)
      .eq('location_id', locationId);
    requirements = reqData || [];
  }

  return { enrolments, requirements };
}

// --- Master Data Management ---

export async function addFurnitureCategory(name: string, tabId: string, parentId?: string) {
  const supabase = await createAdminClient();
  const data: any = { name, tab_id: tabId, active: true };
  if (parentId) data.parent_id = parentId;
  const { data: insertedData, error } = await supabase.from('furniture_categories').insert(data).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data: insertedData };
}

export async function addFurnitureGrade(name: string, section_id: string) {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.from('furniture_grades').insert([{ name, section_id, active: true }]).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addFurnitureClass(name: string, grade_id: string) {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.from('furniture_classes').insert([{ name, grade_id, active: true }]).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addFurnitureLocation(name: string) {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.from('furniture_locations').insert([{ name, active: true }]).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}
