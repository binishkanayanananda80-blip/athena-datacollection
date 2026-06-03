insert into branches (branch_id, branch_name, expected_employee_count, active) values
(1, 'Panadura', 0, true),
(2, 'Galle', 0, true),
(3, 'Homagama', 0, true),
(4, 'Malabe', 0, true),
(5, 'Maggona', 0, true),
(6, 'Boralesgamuwa', 0, true),
(7, 'Matara', 0, true),
(8, 'Ambalangoda', 0, true),
(9, 'Tangalle', 0, true),
(10, 'Tissamaharama', 0, true),
(11, 'Embilipitiya', 0, true),
(12, 'Matugama', 0, true),
(13, 'Horana', 0, true),
(14, 'Bandaragama', 0, true),
(15, 'Piliyandala', 0, true),
(16, 'Walgama', 0, true),
(17, 'Kepuela', 0, true),
(18, 'Maharagama', 0, true),
(19, 'Kottawa', 0, true);

insert into categories (category_id, category_name, active) values
(2, 'Academic', true),
(3, 'Operations', true),
(4, 'Academic Operations', true),
(5, 'Branch Leadership', true),
(6, 'Network Leadership', true),
(8, 'Network Coordination and Leadership', true);

insert into departments (department_id, "Department", category_id, active) values
(11, 'Academic Department', 2, true),

(1, 'Operations Department', 3, true),
(2, 'IT Department', 3, true),
(3, 'Marketing Department', 3, true),
(4, 'HR Department', 3, true),
(5, 'Accounts Departments', 3, true),
(8, 'Parent Services Department', 3, true),

(7, 'Sports Department', 4, true),
(9, 'Nursing Department', 4, true),
(10, 'Counselling Department', 4, true),
(15, 'Library Department', 4, true),
(16, 'Science Department', 4, true),

(14, 'Branch Leadership Department', 5, true),

(6, 'Internal Audit Department', 6, true),
(13, 'Network Leadership Department', 6, true),

(12, 'Network Coordination and Leadership Department', 8, true);

insert into designations (designation_id, "Designation", department_id, active) values
(15, 'Assistant Teacher', 11, true),
(14, 'Trainee Teacher', 11, true),
(16, 'Class Teacher', 11, true),
(17, 'Subject Teacher', 11, true),
(40, 'Senior Subject Teacher', 11, true),
(46, 'Grade Coordinator', 11, true),

(13, 'General Coordinator- Operations', 1, true),

(37, 'IT Lab In-charge', 2, true),
(51, 'IT Coordinator', 2, true),

(52, 'Junior Executive - Marketing', 3, true),

(29, 'Junior Executive- HR', 4, true),
(30, 'Senior Executive- HR', 4, true),
(31, 'Executive- HR', 4, true),
(32, 'HR Officer', 4, true),
(33, 'HR Assistant', 4, true),

(34, 'Accounts Assistant', 5, true),
(38, 'Junior Executive- Accounts', 5, true),
(44, 'Senior Executive- Accounts', 5, true),
(49, 'Executive- Accounts', 5, true),

(50, 'Executive- Parent Services', 8, true),

(41, 'Sport Coordinator', 7, true),
(48, 'Assistant Sports Coordinator', 7, true),

(36, 'Student Counselor', 10, true),

(45, 'Librarian', 15, true),

(54, 'Science Lab In-Charge', 16, true),

(4, 'Principal', 14, true),
(5, 'Deputy Principal', 14, true),
(6, 'Head Master', 14, true),
(7, 'Head Mistress', 14, true),
(8, 'Sectional Head- Upper School', 14, true),
(9, 'Sectional Head- Primary School', 14, true),
(10, 'Sectional Head- Pre School', 14, true),
(11, 'Grade Coordinator', 14, true),
(12, 'General Coordinator- Academic', 14, true),

(55, 'Network Internal Auditor', 6, true),

(42, 'Network Sports Coordinator', 13, true),
(53, 'Network Dancing Coordinator', 13, true),

(22, 'Assistant Coordinating Principal', 12, true),
(24, 'Network Coordinator-Pre School to Primary', 12, true),
(25, 'Head of Academics and Assessment', 12, true),
(26, 'Head of Operations- Western Province', 12, true),
(27, 'Head of Operations- Southern Province', 12, true),
(43, 'Group Finance Controller', 12, true);

insert into contract_types (contract_type_name, active) values
('Contract', true);
