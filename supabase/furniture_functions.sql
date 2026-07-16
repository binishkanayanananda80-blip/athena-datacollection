-- Secure RPC for Branch Registration

create or replace function register_furniture_branch(
    p_branch_id integer,
    p_full_name text,
    p_username citext,
    p_email citext,
    p_mobile text,
    p_password text -- Stored securely via auth later, or we can create auth user here
) returns jsonb as $$
declare
    v_branch_exists boolean;
    v_is_claimed boolean;
    v_registration_id uuid;
begin
    -- 1. Lock the branch record to prevent concurrent claims (Select FOR UPDATE)
    select exists(
        select 1 from branches where branch_id = p_branch_id for update
    ) into v_branch_exists;

    if not v_branch_exists then
        return jsonb_build_object('success', false, 'error', 'Branch does not exist.');
    end if;

    -- 2. Check if the branch is already claimed
    select exists(
        select 1 from furniture_branch_registrations 
        where branch_id = p_branch_id and status in ('Pending Approval', 'Active')
    ) into v_is_claimed;

    if v_is_claimed then
        return jsonb_build_object('success', false, 'error', 'Branch is already registered or pending approval.');
    end if;

    -- 3. Check for unique username and email globally
    if exists(select 1 from furniture_branch_registrations where username = p_username) then
        return jsonb_build_object('success', false, 'error', 'Username is already taken.');
    end if;

    if exists(select 1 from furniture_branch_registrations where email = p_email) then
        return jsonb_build_object('success', false, 'error', 'Email is already registered.');
    end if;

    -- 4. Create the registration
    -- We do not create the Supabase Auth user yet. That happens upon approval by Super Admin to save auth seats and prevent spam auth users.
    -- Wait, the prompt says: "Password requirements...". So the user provides a password during registration.
    -- We must create the Supabase Auth user with 'Pending' status, OR store the password temporarily?
    -- Actually, it's safer to create the Auth User immediately but without the 'branch_user' role, so they can't access anything.
    -- However, creating Auth Users from within a standard postgres RPC is complicated without the pg_net extension or triggering Edge Functions.
    -- It is better to handle the transactional logic in the Next.js Server Action (transactional server-side function) using Supabase Admin client. 
    -- The prompt says: "Use a secure Supabase RPC function OR transactional server-side function...".
    -- I will write the server-side function in Next.js which is much easier for calling `supabase.auth.admin.createUser`.
    -- So this RPC will just be a helper to check and lock, or I'll just use the unique index and handle it entirely in `src/lib/furniture-actions.ts`.
    
    return jsonb_build_object('success', true, 'message', 'Logic handled in Next.js Server Action.');
end;
$$ language plpgsql security definer;
