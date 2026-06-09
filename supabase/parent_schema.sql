create table parent_submissions (
  id uuid primary key default gen_random_uuid(),

  admission_no text not null,
  guardian_type text not null,
  
  nic text,
  initial_name text,
  name_with_initial text,
  first_name text,
  middle_name text,
  last_name text,
  
  mobile text,
  home_phone text,
  
  personal_email text,
  work_email text,
  school_email text,
  
  city text,
  district text,
  grama_niladhari_division text,
  permanent_address text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_parent_admission_no on parent_submissions(admission_no);
