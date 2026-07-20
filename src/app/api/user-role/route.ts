import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ role: null }, { status: 401 });
  }

  const supabaseAdmin = await createAdminClient();

  const { data: roleData } = await supabaseAdmin
    .from('furniture_user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (roleData?.role) {
    return NextResponse.json({ 
      role: roleData.role,
      module: user.user_metadata?.module || null 
    });
  }

  // If not in user_roles, check if they have a branch registration
  const { data: regData } = await supabaseAdmin
    .from('furniture_branch_registrations')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (regData) {
    return NextResponse.json({ 
      role: 'branch_user',
      module: user.user_metadata?.module || null 
    });
  }

  return NextResponse.json({ 
    role: null,
    module: user.user_metadata?.module || null 
  });
}
