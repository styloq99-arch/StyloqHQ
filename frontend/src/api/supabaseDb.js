/**
 * Supabase Database Queries
 * Handles user lookup and creation for OAuth onboarding.
 *
 * REQUIRED: Run the following SQL in your Supabase SQL Editor
 * to ensure the tables and columns exist:
 *
 * -- Add supabase_uid column if it doesn't exist
 * ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_uid TEXT UNIQUE;
 *
 * -- Make password_hash nullable (OAuth users have no password)
 * ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
 *
 * -- Ensure role-specific tables exist
 * CREATE TABLE IF NOT EXISTS clients (
 *   id SERIAL PRIMARY KEY,
 *   user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE
 * );
 * CREATE TABLE IF NOT EXISTS barbers (
 *   id SERIAL PRIMARY KEY,
 *   user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE
 * );
 * CREATE TABLE IF NOT EXISTS salons (
 *   id SERIAL PRIMARY KEY,
 *   user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE
 * );
 *
 * -- RLS: allow authenticated users to read/insert (adjust for production)
 * ALTER TABLE users ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "auth_read_users"  ON users FOR SELECT TO authenticated USING (true);
 * CREATE POLICY "auth_insert_users" ON users FOR INSERT TO authenticated WITH CHECK (true);
 * ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "auth_insert_clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
 * ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "auth_insert_barbers" ON barbers FOR INSERT TO authenticated WITH CHECK (true);
 * ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "auth_insert_salons" ON salons FOR INSERT TO authenticated WITH CHECK (true);
 */

import { supabase } from "../supabaseClient";

/**
 * Look up a user in the public.users table by email.
 * @param {string} email
 * @returns {Promise<{user: object|null, error: object|null}>}
 */
export async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, role, phone_number, supabase_uid, created_at")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("[supabaseDb] getUserByEmail error:", error.message);
    return { user: null, error };
  }
  return { user: data, error: null };
}

/**
 * Create a new user + role-specific record after Google OAuth.
 *
 * @param {object} params
 * @param {string} params.email
 * @param {string} params.fullName
 * @param {string} params.role        – 'client' | 'barber' | 'salon'
 * @param {string} params.supabaseUid – Supabase Auth user.id
 * @returns {Promise<{user: object|null, error: object|null}>}
 */
export async function createUserWithRole({ email, fullName, role, supabaseUid }) {
  // 1. Insert into users table
  const { data: newUser, error: userError } = await supabase
    .from("users")
    .insert({
      email,
      full_name: fullName || email.split("@")[0],
      role,
      supabase_uid: supabaseUid,
      created_at: new Date().toISOString(),
    })
    .select("id, email, full_name, role, supabase_uid, created_at")
    .single();

  if (userError) {
    console.error("[supabaseDb] createUserWithRole error:", userError.message);
    return { user: null, error: userError };
  }

  // 2. Insert into the role-specific table
  const roleTableMap = { client: "clients", barber: "barbers", salon: "salons" };
  const roleTable = roleTableMap[role];

  if (roleTable) {
    const { error: roleError } = await supabase
      .from(roleTable)
      .insert({ user_id: newUser.id });

    if (roleError) {
      console.error(`[supabaseDb] Error creating ${roleTable} record:`, roleError.message);
      // User record was created – don't fail entirely
    }
  }

  return { user: newUser, error: null };
}
