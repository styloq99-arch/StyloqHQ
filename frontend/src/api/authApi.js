/**
 * Auth API - Login, Register, and User Info
 */
import { apiPost, apiGet, getAuthHeaders } from "../utils/api.js";

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, data?: {token, user}, message?: string}>}
 */
export async function login(email, password) {
  return apiPost("/auth/login", { email, password });
}

/**
 * Register new user
 * @param {object} userData - includes email, password, name, role, etc.
 * @returns {Promise<{success: boolean, data?: {token, user}, message?: string}>}
 */
export async function register(userData) {
  return apiPost("/auth/register", userData);
}

/**
 * Get current logged-in user
 * @returns {Promise<{success: boolean, data?: user, message?: string}>}
 */
export async function getCurrentUser() {
  return apiGet("/auth/me");
}

export { getAuthHeaders };
