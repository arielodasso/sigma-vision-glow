// Script to assign superadmin role to a specific email
// Run with: npx tsx scripts/assign-superadmin.ts

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qxkeungqbgaytxdfhccn.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY not set");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function assignSuperadmin(email: string) {
  // Get user by email
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error("Error fetching users:", userError);
    return;
  }

  const user = users.find((u) => u.email === email);
  
  if (!user) {
    console.error(`User with email ${email} not found`);
    return;
  }

  console.log(`Found user: ${user.id} (${user.email})`);

  // Check current roles
  const { data: currentRoles, error: rolesError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (rolesError) {
    console.error("Error fetching roles:", rolesError);
    return;
  }

  console.log("Current roles:", currentRoles);

  // Check if already superadmin
  const isSuperadmin = currentRoles?.some((r) => r.role === "superadmin");
  
  if (isSuperadmin) {
    console.log("User is already superadmin");
    return;
  }

  // Assign superadmin role
  const { error: insertError } = await supabase
    .from("user_roles")
    .insert({ user_id: user.id, role: "superadmin" });

  if (insertError) {
    console.error("Error assigning superadmin:", insertError);
    return;
  }

  console.log(`✅ Successfully assigned superadmin role to ${email}`);
}

assignSuperadmin("arielodassotec@gmail.com");