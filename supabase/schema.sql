create table branches (
  branch_id integer primary key,
  branch_name text not null unique,
  expected_employee_count integer default 0,
  active boolean default true,
  created_at timestamptz default now()
);

create table categories (
  category_id integer primary key,
  category_name text not null unique,
  active boolean default true,
  created_at timestamptz default now()
);

create table departments (
  department_id integer primary key,
  "Department" text not null,
  category_id integer references categories(category_id),
  active boolean default true,
  created_at timestamptz default now()
);

create table designations (
  designation_id integer primary key,
  "Designation" text not null,
  department_id integer references departments(department_id),
  active boolean default true,
  created_at timestamptz default now()
);

create table contract_types (
  id bigint generated always as identity primary key,
  contract_type_name text not null unique,
  active boolean default true,
  created_at timestamptz default now()
);

create table employee_submissions (
  id uuid primary key default gen_random_uuid(),

  branch_id integer references branches(branch_id),
  branch_name text not null,

  epf_no text not null,
  first_name text not null,
  middle_name text,
  last_name text not null,
  join_date date not null,

  category_id integer references categories(category_id),
  category_name text not null,

  department_id integer references departments(department_id),
  "Department" text not null,

  designation_id integer references designations(designation_id),
  "Designation" text not null,

  contract_type_name text not null,
  nic text not null,
  mobile text not null,
  gender text not null,

  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_employee_branch on employee_submissions(branch_id);
create index idx_employee_category on employee_submissions(category_id);
create index idx_employee_department on employee_submissions(department_id);
create index idx_employee_designation on employee_submissions(designation_id);
create index idx_employee_submitted_at on employee_submissions(submitted_at);
create index idx_employee_epf on employee_submissions(epf_no);
create index idx_employee_nic on employee_submissions(nic);
create index idx_employee_mobile on employee_submissions(mobile);

create unique index unique_employee_epf on employee_submissions(lower(epf_no));
create unique index unique_employee_nic on employee_submissions(lower(nic));
