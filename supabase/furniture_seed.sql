-- Seed Master Data for Furniture Module

-- 1. Academic Year
insert into furniture_academic_years (name, is_current) 
values ('2026/2027', true)
on conflict (name) do nothing;

-- 2. Sections
insert into furniture_sections (name, display_order) values 
('Pre-School', 1),
('Primary', 2),
('Form', 3)
on conflict (name) do nothing;

-- 3. Grades
do $$
declare
    v_preschool uuid;
    v_primary uuid;
    v_form uuid;
begin
    select id into v_preschool from furniture_sections where name = 'Pre-School';
    select id into v_primary from furniture_sections where name = 'Primary';
    select id into v_form from furniture_sections where name = 'Form';

    insert into furniture_grades (section_id, name, display_order) values
    (v_preschool, 'Play Group', 1),
    (v_preschool, 'Kindergarten 1', 2),
    (v_preschool, 'Kindergarten 2', 3),
    
    (v_primary, 'Primary 1', 4),
    (v_primary, 'Primary 2', 5),
    (v_primary, 'Primary 3', 6),
    (v_primary, 'Primary 4', 7),
    (v_primary, 'Primary 5', 8),
    
    (v_form, 'Form 1', 9),
    (v_form, 'Form 2', 10),
    (v_form, 'Form 3', 11),
    (v_form, 'Form 4', 12),
    (v_form, 'Form 5', 13),
    (v_form, 'Form 6', 14),
    (v_form, 'Form 7', 15)
    on conflict (name) do nothing;
end $$;

-- 4. Classes
do $$
declare
    v_pg uuid;
    v_kg1 uuid;
    v_kg2 uuid;
    v_p1 uuid; v_p2 uuid; v_p3 uuid; v_p4 uuid; v_p5 uuid;
    v_f1 uuid; v_f2 uuid; v_f3 uuid; v_f4 uuid; v_f5 uuid; v_f6 uuid; v_f7 uuid;
begin
    select id into v_pg from furniture_grades where name = 'Play Group';
    select id into v_kg1 from furniture_grades where name = 'Kindergarten 1';
    select id into v_kg2 from furniture_grades where name = 'Kindergarten 2';
    select id into v_p1 from furniture_grades where name = 'Primary 1';
    select id into v_p2 from furniture_grades where name = 'Primary 2';
    select id into v_p3 from furniture_grades where name = 'Primary 3';
    select id into v_p4 from furniture_grades where name = 'Primary 4';
    select id into v_p5 from furniture_grades where name = 'Primary 5';
    select id into v_f1 from furniture_grades where name = 'Form 1';
    select id into v_f2 from furniture_grades where name = 'Form 2';
    select id into v_f3 from furniture_grades where name = 'Form 3';
    select id into v_f4 from furniture_grades where name = 'Form 4';
    select id into v_f5 from furniture_grades where name = 'Form 5';
    select id into v_f6 from furniture_grades where name = 'Form 6';
    select id into v_f7 from furniture_grades where name = 'Form 7';

    insert into furniture_classes (grade_id, name, display_order) values
    (v_pg, 'Play Group A', 1), (v_pg, 'Play Group B', 2),
    (v_kg1, 'KG 1 A', 3), (v_kg1, 'KG 1 B', 4), (v_kg1, 'KG 1 C', 5),
    (v_kg2, 'KG 2 A', 6), (v_kg2, 'KG 2 B', 7), (v_kg2, 'KG 2 C', 8),

    (v_p1, 'Primary 1 A', 9), (v_p1, 'Primary 1 B', 10), (v_p1, 'Primary 1 C', 11), (v_p1, 'Primary 1 D', 12),
    (v_p2, 'Primary 2 A', 13), (v_p2, 'Primary 2 B', 14), (v_p2, 'Primary 2 C', 15), (v_p2, 'Primary 2 D', 16),
    (v_p3, 'Primary 3 A', 17), (v_p3, 'Primary 3 B', 18), (v_p3, 'Primary 3 C', 19), (v_p3, 'Primary 3 D', 20),
    (v_p4, 'Primary 4 A', 21), (v_p4, 'Primary 4 B', 22), (v_p4, 'Primary 4 C', 23), (v_p4, 'Primary 4 D', 24),
    (v_p5, 'Primary 5 A', 25), (v_p5, 'Primary 5 B', 26), (v_p5, 'Primary 5 C', 27), (v_p5, 'Primary 5 D', 28),

    (v_f1, 'Form 1 A', 29), (v_f1, 'Form 1 B', 30), (v_f1, 'Form 1 C', 31), (v_f1, 'Form 1 D', 32),
    (v_f2, 'Form 2 A', 33), (v_f2, 'Form 2 B', 34), (v_f2, 'Form 2 C', 35), (v_f2, 'Form 2 D', 36),
    (v_f3, 'Form 3 A', 37), (v_f3, 'Form 3 B', 38), (v_f3, 'Form 3 C', 39), (v_f3, 'Form 3 D', 40),
    (v_f4, 'Form 4 A', 41), (v_f4, 'Form 4 B', 42), (v_f4, 'Form 4 C', 43), (v_f4, 'Form 4 D', 44),
    (v_f5, 'Form 5 A', 45), (v_f5, 'Form 5 B', 46), (v_f5, 'Form 5 C', 47), (v_f5, 'Form 5 D', 48),
    (v_f6, 'Form 6 A', 49), (v_f6, 'Form 6 B', 50), (v_f6, 'Form 6 C', 51), (v_f6, 'Form 6 D', 52),
    (v_f7, 'Form 7 A', 53), (v_f7, 'Form 7 B', 54), (v_f7, 'Form 7 C', 55), (v_f7, 'Form 7 D', 56)
    on conflict (name) do nothing;
end $$;

-- 5. Non-academic Locations
insert into furniture_locations (name, display_order) values
('Library', 1),
('ICT Lab', 2),
('Auditorium', 3),
('Lobby', 4),
('Health Room', 5),
('Science Lab', 6),
('Office', 7)
on conflict (name) do nothing;

-- 6. Furniture Categories
insert into furniture_categories (name, display_order) values
('Pre-school Tables', 1),
('Pre-school Chairs', 2),
('Student Tables – Primary 1–2', 3),
('Student Chairs – Primary 1–2', 4),
('Student Tables – Primary 3–5', 5),
('Student Chairs – Primary 3–5', 6),
('Student Tables – Form', 7),
('Student Chairs – Form', 8),
('Teacher Tables', 9),
('Teacher Chairs', 10),
('Steel Cupboards – Full', 11),
('Steel Cupboards – Half', 12),
('Plastic Chairs – Library', 13),
('Plastic Chairs – ICT Lab', 14),
('Plastic Chairs – Auditorium', 15),
('Science Lab Tables', 16),
('Science Lab Chairs/Stools', 17),
('Classroom Book Racks – Small', 18),
('Classroom Book Racks – Large', 19),
('Office Tables – Executive', 20),
('Office Chairs – Executive', 21),
('Visitor Chairs', 22),
('Lobby Chairs', 23),
('Health Room Beds', 24),
('Library Tables', 25)
on conflict (name) do nothing;

-- Ensure Library Chairs is removed/inactive if it accidentally existed in previous schemas (not explicitly added here but good to be safe)
update furniture_categories set is_active = false where name = 'Library Chairs';

-- 7. Initial Mappings for Locations
do $$
declare
    v_lib uuid; v_ict uuid; v_aud uuid; v_lob uuid; v_hlth uuid; v_sci uuid; v_off uuid;
    
    c_lib_chairs uuid; c_lib_tables uuid; c_st_full uuid; c_st_half uuid; c_bk_sml uuid; c_bk_lrg uuid;
    c_ict_chairs uuid; c_tch_tbl uuid; c_tch_chr uuid;
    c_aud_chairs uuid;
    c_lob_chairs uuid; c_vis_chairs uuid;
    c_hlth_beds uuid;
    c_sci_tbl uuid; c_sci_chr uuid;
    c_off_tbl uuid; c_off_chr uuid;
begin
    -- Locations
    select id into v_lib from furniture_locations where name = 'Library';
    select id into v_ict from furniture_locations where name = 'ICT Lab';
    select id into v_aud from furniture_locations where name = 'Auditorium';
    select id into v_lob from furniture_locations where name = 'Lobby';
    select id into v_hlth from furniture_locations where name = 'Health Room';
    select id into v_sci from furniture_locations where name = 'Science Lab';
    select id into v_off from furniture_locations where name = 'Office';

    -- Categories
    select id into c_lib_chairs from furniture_categories where name = 'Plastic Chairs – Library';
    select id into c_lib_tables from furniture_categories where name = 'Library Tables';
    select id into c_st_full from furniture_categories where name = 'Steel Cupboards – Full';
    select id into c_st_half from furniture_categories where name = 'Steel Cupboards – Half';
    select id into c_bk_sml from furniture_categories where name = 'Classroom Book Racks – Small';
    select id into c_bk_lrg from furniture_categories where name = 'Classroom Book Racks – Large';
    select id into c_ict_chairs from furniture_categories where name = 'Plastic Chairs – ICT Lab';
    select id into c_tch_tbl from furniture_categories where name = 'Teacher Tables';
    select id into c_tch_chr from furniture_categories where name = 'Teacher Chairs';
    select id into c_aud_chairs from furniture_categories where name = 'Plastic Chairs – Auditorium';
    select id into c_lob_chairs from furniture_categories where name = 'Lobby Chairs';
    select id into c_vis_chairs from furniture_categories where name = 'Visitor Chairs';
    select id into c_hlth_beds from furniture_categories where name = 'Health Room Beds';
    select id into c_sci_tbl from furniture_categories where name = 'Science Lab Tables';
    select id into c_sci_chr from furniture_categories where name = 'Science Lab Chairs/Stools';
    select id into c_off_tbl from furniture_categories where name = 'Office Tables – Executive';
    select id into c_off_chr from furniture_categories where name = 'Office Chairs – Executive';

    -- Library Mappings
    insert into furniture_category_mappings (category_id, location_id) values
    (c_lib_chairs, v_lib), (c_lib_tables, v_lib), (c_st_full, v_lib), (c_st_half, v_lib), (c_bk_sml, v_lib), (c_bk_lrg, v_lib)
    on conflict do nothing;

    -- ICT Lab Mappings
    insert into furniture_category_mappings (category_id, location_id) values
    (c_ict_chairs, v_ict), (c_tch_tbl, v_ict), (c_tch_chr, v_ict), (c_st_full, v_ict), (c_st_half, v_ict)
    on conflict do nothing;

    -- Auditorium Mappings
    insert into furniture_category_mappings (category_id, location_id) values
    (c_aud_chairs, v_aud)
    on conflict do nothing;

    -- Lobby Mappings
    insert into furniture_category_mappings (category_id, location_id) values
    (c_lob_chairs, v_lob), (c_vis_chairs, v_lob)
    on conflict do nothing;

    -- Health Room Mappings
    insert into furniture_category_mappings (category_id, location_id) values
    (c_hlth_beds, v_hlth), (c_st_half, v_hlth), (c_vis_chairs, v_hlth)
    on conflict do nothing;

    -- Science Lab Mappings
    insert into furniture_category_mappings (category_id, location_id) values
    (c_sci_tbl, v_sci), (c_sci_chr, v_sci), (c_tch_tbl, v_sci), (c_tch_chr, v_sci), (c_st_full, v_sci), (c_st_half, v_sci)
    on conflict do nothing;

    -- Office Mappings
    insert into furniture_category_mappings (category_id, location_id) values
    (c_off_tbl, v_off), (c_off_chr, v_off), (c_vis_chairs, v_off), (c_st_full, v_off), (c_st_half, v_off)
    on conflict do nothing;
end $$;
