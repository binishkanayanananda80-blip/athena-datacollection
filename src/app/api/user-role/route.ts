import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ role: null }, { status: 401 });
  }

  const { data: roleData } = await supabase
    .from('furniture_user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  return NextResponse.json({ 
    role: roleData?.role || null,
    module: user.user_metadata?.module || null 
  });
}
