-- Create Enums
create type furniture_entry_type as enum ('academic_class', 'non_academic_location');
create type furniture_registration_status as enum ('Pending Approval', 'Active', 'Rejected', 'Deactivated');
create type furniture_submission_status as enum ('Not Started', 'Draft', 'Submitted', 'Reopened', 'Finalised', 'Locked');

-- 1. User Roles
create table furniture_user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null check (role in ('super_admin', 'branch_user')),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(user_id)
);

-- 2. Master Data Tables
create table furniture_academic_years (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    is_current boolean default false,
    is_locked boolean default false,
    submission_deadline timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Ensure only one academic year is current
create unique index idx_only_one_current_year on furniture_academic_years(is_current) where is_current = true;

create table furniture_sections (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    display_order integer not null,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table furniture_grades (
    id uuid primary key default gen_random_uuid(),
    section_id uuid not null references furniture_sections(id) on delete cascade,
    name text not null unique,
    display_order integer not null,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table furniture_classes (
    id uuid primary key default gen_random_uuid(),
    grade_id uuid not null references furniture_grades(id) on delete cascade,
    name text not null unique,
    display_order integer not null,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table furniture_locations (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    display_order integer not null,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table furniture_categories (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    display_order integer not null,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table furniture_category_mappings (
    id uuid primary key default gen_random_uuid(),
    category_id uuid not null references furniture_categories(id) on delete cascade,
    section_id uuid references furniture_sections(id) on delete cascade,
    grade_id uuid references furniture_grades(id) on delete cascade,
    class_id uuid references furniture_classes(id) on delete cascade,
    location_id uuid references furniture_locations(id) on delete cascade,
    created_at timestamptz default now()
);

-- 3. Branch Registrations
create table furniture_branch_registrations (
    id uuid primary key default gen_random_uuid(),
    branch_id integer not null references branches(branch_id),
    user_id uuid references auth.users(id), -- Null until auth account is actually created
    full_name text not null,
    username text not null,
    email text not null,
    mobile text,
    status furniture_registration_status not null default 'Pending Approval',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create unique index idx_unique_furniture_username on furniture_branch_registrations(lower(username));
create unique index idx_unique_furniture_email on furniture_branch_registrations(lower(email));

-- Partial unique index to enforce one Active/Pending registration per branch
create unique index idx_unique_active_registration_per_branch 
on furniture_branch_registrations(branch_id) 
where status in ('Pending Approval', 'Active');

-- 4. Branch Assignments (To enforce RLS)
create table furniture_branch_assignments (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    branch_id integer not null references branches(branch_id) on delete cascade,
    created_at timestamptz default now(),
    unique(user_id, branch_id),
    unique(user_id) -- One branch per user
);

-- 5. Data Collection Tables
create table furniture_submissions (
    id uuid primary key default gen_random_uuid(),
    academic_year_id uuid not null references furniture_academic_years(id),
    branch_id integer not null references branches(branch_id),
    status furniture_submission_status not null default 'Not Started',
    completion_percentage numeric(5,2) default 0,
    submitted_by uuid references auth.users(id),
    submitted_at timestamptz,
    reopened_by uuid references auth.users(id),
    reopened_at timestamptz,
    reopening_reason text,
    finalised_by uuid references auth.users(id),
    finalised_at timestamptz,
    locked_by uuid references auth.users(id),
    locked_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(academic_year_id, branch_id)
);

create table furniture_class_enrolments (
    id uuid primary key default gen_random_uuid(),
    academic_year_id uuid not null references furniture_academic_years(id),
    branch_id integer not null references branches(branch_id),
    class_id uuid not null references furniture_classes(id),
    existing_students integer not null default 0 check (existing_students >= 0),
    new_admissions integer not null default 0 check (new_admissions >= 0),
    total_students integer generated always as (existing_students + new_admissions) stored,
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(academic_year_id, branch_id, class_id)
);

create table furniture_requirements (
    id uuid primary key default gen_random_uuid(),
    academic_year_id uuid not null references furniture_academic_years(id),
    branch_id integer not null references branches(branch_id),
    entry_type furniture_entry_type not null,
    class_id uuid references furniture_classes(id),
    location_id uuid references furniture_locations(id),
    furniture_category_id uuid not null references furniture_categories(id),
    existing_furniture_quantity integer check (existing_furniture_quantity >= 0),
    new_furniture_requirement integer not null default 0 check (new_furniture_requirement >= 0),
    remarks text,
    submission_id uuid references furniture_submissions(id),
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    check (
        (entry_type = 'academic_class' and class_id is not null and location_id is null) or
        (entry_type = 'non_academic_location' and location_id is not null and class_id is null)
    )
);

create unique index idx_unique_academic_req 
on furniture_requirements(academic_year_id, branch_id, class_id, furniture_category_id) 
where entry_type = 'academic_class';

create unique index idx_unique_non_academic_req 
on furniture_requirements(academic_year_id, branch_id, location_id, furniture_category_id) 
where entry_type = 'non_academic_location';

create table furniture_submission_comments (
    id uuid primary key default gen_random_uuid(),
    submission_id uuid not null references furniture_submissions(id) on delete cascade,
    user_id uuid not null references auth.users(id),
    comment text not null,
    action_required boolean default false,
    created_at timestamptz default now()
);

-- 6. Audit Logs
create table furniture_audit_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id),
    full_name text,
    username text,
    role text,
    branch_id integer references branches(branch_id),
    action_type text not null,
    table_affected text,
    record_id text,
    previous_value jsonb,
    new_value jsonb,
    ip_address text,
    user_agent text,
    created_at timestamptz default now()
);

-- Enable RLS
alter table furniture_user_roles enable row level security;
alter table furniture_academic_years enable row level security;
alter table furniture_sections enable row level security;
alter table furniture_grades enable row level security;
alter table furniture_classes enable row level security;
alter table furniture_locations enable row level security;
alter table furniture_categories enable row level security;
alter table furniture_category_mappings enable row level security;
alter table furniture_branch_registrations enable row level security;
alter table furniture_branch_assignments enable row level security;
alter table furniture_submissions enable row level security;
alter table furniture_class_enrolments enable row level security;
alter table furniture_requirements enable row level security;
alter table furniture_submission_comments enable row level security;
alter table furniture_audit_logs enable row level security;

-- Setup basic RLS Policies 
-- We will implement application-level checks and secure policies.

-- Super Admin Policy Creation Function to simplify
create or replace function is_super_admin() returns boolean as $$
    select exists (
        select 1 from furniture_user_roles 
        where user_id = auth.uid() and role = 'super_admin'
    );
$$ language sql security definer;

-- Branch User Assignment Check
create or replace function get_assigned_branch() returns integer as $$
    select branch_id from furniture_branch_assignments 
    where user_id = auth.uid();
$$ language sql security definer;

-- Master data: Everyone can read, only super admin can modify
create policy master_data_read on furniture_academic_years for select to authenticated using (true);
create policy master_data_all on furniture_academic_years for all to authenticated using (is_super_admin());

create policy master_data_read_sec on furniture_sections for select to authenticated using (true);
create policy master_data_all_sec on furniture_sections for all to authenticated using (is_super_admin());

create policy master_data_read_grd on furniture_grades for select to authenticated using (true);
create policy master_data_all_grd on furniture_grades for all to authenticated using (is_super_admin());

create policy master_data_read_cls on furniture_classes for select to authenticated using (true);
create policy master_data_all_cls on furniture_classes for all to authenticated using (is_super_admin());

create policy master_data_read_loc on furniture_locations for select to authenticated using (true);
create policy master_data_all_loc on furniture_locations for all to authenticated using (is_super_admin());

create policy master_data_read_cat on furniture_categories for select to authenticated using (true);
create policy master_data_all_cat on furniture_categories for all to authenticated using (is_super_admin());

create policy master_data_read_map on furniture_category_mappings for select to authenticated using (true);
create policy master_data_all_map on furniture_category_mappings for all to authenticated using (is_super_admin());

-- Branch Registrations: Public can insert via RPC (we'll lock this down later if needed), but for now service role handles RPC.
-- Only super admins can select/update. Branch user can see their own.
create policy reg_read_admin on furniture_branch_registrations for select to authenticated using (is_super_admin() or user_id = auth.uid());
create policy reg_all_admin on furniture_branch_registrations for all to authenticated using (is_super_admin());

-- Submissions, Enrolments, Requirements: 
-- Super Admin sees all. Branch user sees/modifies only their branch.
create policy sub_read on furniture_submissions for select to authenticated using (is_super_admin() or branch_id = get_assigned_branch());
create policy sub_insert on furniture_submissions for insert to authenticated with check (is_super_admin() or branch_id = get_assigned_branch());
create policy sub_update on furniture_submissions for update to authenticated using (is_super_admin() or (branch_id = get_assigned_branch() and status in ('Not Started', 'Draft', 'Reopened')));

create policy enr_read on furniture_class_enrolments for select to authenticated using (is_super_admin() or branch_id = get_assigned_branch());
create policy enr_insert on furniture_class_enrolments for insert to authenticated with check (is_super_admin() or branch_id = get_assigned_branch());
create policy enr_update on furniture_class_enrolments for update to authenticated using (is_super_admin() or branch_id = get_assigned_branch());
create policy enr_delete on furniture_class_enrolments for delete to authenticated using (is_super_admin() or branch_id = get_assigned_branch());

create policy req_read on furniture_requirements for select to authenticated using (is_super_admin() or branch_id = get_assigned_branch());
create policy req_insert on furniture_requirements for insert to authenticated with check (is_super_admin() or branch_id = get_assigned_branch());
create policy req_update on furniture_requirements for update to authenticated using (is_super_admin() or branch_id = get_assigned_branch());
create policy req_delete on furniture_requirements for delete to authenticated using (is_super_admin() or branch_id = get_assigned_branch());

create policy com_read on furniture_submission_comments for select to authenticated using (true); -- Usually accessed via view linked to submission
create policy com_all on furniture_submission_comments for all to authenticated using (is_super_admin() or user_id = auth.uid());

create policy aud_read on furniture_audit_logs for select to authenticated using (is_super_admin());
create policy aud_insert on furniture_audit_logs for insert to authenticated with check (true);
