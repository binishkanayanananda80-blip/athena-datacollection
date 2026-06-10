create table student_submissions (
  id uuid primary key default gen_random_uuid(),

  branch_id integer references branches(branch_id),
  branch_name text not null,

  admission_no text not null,
  first_name text not null,
  middle_name text,
  last_name text not null,
  
  gender text not null,
  dob date not null,
  age integer,
  date_of_admission date not null,

  student_type text not null,

  category_master_id integer references categories(category_id),
  curriculum_name text not null,

  academic_year text not null,
  enrolled_academic_yr text not null,
  
  grade text not null,
  class text not null,
  
  medium text not null,
  nationality text not null,
  religion text not null,
  
  emergency_contact text not null,
  student_lives_with text not null,
  
  guardian_type text not null,
  marital_status text not null,
  is_living text not null,
  
  status text not null default 'active',

  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_student_branch on student_submissions(branch_id);
create index idx_student_category on student_submissions(category_master_id);
create index idx_student_submitted_at on student_submissions(submitted_at);
create index idx_student_admission_no on student_submissions(admission_no);
create unique index unique_student_admission_no_branch on student_submissions(branch_id, lower(admission_no));
