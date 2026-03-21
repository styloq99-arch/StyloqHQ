/**
 * Supabase Database Queries
 * Unified user management — all auth goes through Supabase.
 *
 * REQUIRED SQL — run in your Supabase SQL Editor:
 *
 * CREATE TABLE IF NOT EXISTS users (
 *   id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 *   email TEXT UNIQUE NOT NULL,
 *   full_name TEXT DEFAULT '',
 *   phone_number TEXT,
 *   role TEXT NOT NULL CHECK (role IN ('client', 'barber', 'salon')),
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * CREATE TABLE IF NOT EXISTS clients (
 *   id SERIAL PRIMARY KEY,
 *   user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE
 * );
 * CREATE TABLE IF NOT EXISTS barbers (
 *   id SERIAL PRIMARY KEY,
 *   user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE
 * );
 * CREATE TABLE IF NOT EXISTS salons (
 *   id SERIAL PRIMARY KEY,
 *   user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE
 * );
 *
 * -- RLS Policies
 * ALTER TABLE users ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Users can read own record" ON users
 *   FOR SELECT TO authenticated USING (auth.uid() = id);
 * CREATE POLICY "Users can insert own record" ON users
 *   FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
 *
 * ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Clients insert own" ON clients
 *   FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
 * ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Barbers insert own" ON barbers
 *   FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
 * ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Salons insert own" ON salons
 *   FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
 */

import { supabase } from "../supabaseClient";

/**
 * Look up a user in users table by Supabase Auth UID (= users.id).
 * @param {string} uid – auth.users.id (UUID)
 * @returns {Promise<{user: object|null, error: object|null}>}
 */
export async function getUserByUid(uid) {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, role, phone_number, created_at")
    .eq("id", uid)
    .maybeSingle();

  if (error) {
    console.error("[supabaseDb] getUserByUid error:", error.message);
    return { user: null, error };
  }
  return { user: data, error: null };
}

/**
 * Look up a user by email (fallback / legacy).
 * @param {string} email
 * @returns {Promise<{user: object|null, error: object|null}>}
 */
export async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, role, phone_number, created_at")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("[supabaseDb] getUserByEmail error:", error.message);
    return { user: null, error };
  }
  return { user: data, error: null };
}

/**
 * Create a new user record + role-specific record.
 *
 * @param {object} params
 * @param {string} params.supabaseUid – auth.users.id (UUID), used as users.id
 * @param {string} params.email
 * @param {string} params.fullName
 * @param {string} params.role   – 'client' | 'barber' | 'salon'
 * @param {string} [params.phone]
 * @returns {Promise<{user: object|null, error: object|null}>}
 */
export async function createUserWithRole({ supabaseUid, email, fullName, role, phone }) {
  // 1. Insert into users table (id = auth.users UUID)
  const { data: newUser, error: userError } = await supabase
    .from("users")
    .insert({
      id: supabaseUid,
      email,
      full_name: fullName || email.split("@")[0],
      role,
      phone_number: phone || null,
      created_at: new Date().toISOString(),
    })
    .select("id, email, full_name, role, phone_number, created_at")
    .single();

  if (userError) {
    console.error("[supabaseDb] createUserWithRole error:", userError.message);
    return { user: null, error: userError };
  }

  // 2. Insert into role-specific table
  const roleTableMap = { client: "clients", barber: "barbers", salon: "salons" };
  const roleTable = roleTableMap[role];

  if (roleTable) {
    const { error: roleError } = await supabase
      .from(roleTable)
      .insert({ user_id: newUser.id });

    if (roleError) {
      console.error(`[supabaseDb] ${roleTable} insert error:`, roleError.message);
    }
  }

  return { user: newUser, error: null };
}
