/**
 * Barber API - Profile, Portfolio, Posts, Availability
 */
import { apiGet, apiPut, apiPost } from "../utils/api.js";

/**
 * Get barber profile (public)
 * @param {number} barberId
 * @returns {Promise<{success: boolean, data?: object, message?: string}>}
 */
export async function getBarberProfile(barberId) {
  return apiGet(`/barber/${barberId}/profile`);
}

/**
 * Get barber availability (public)
 * @param {number} barberId
 * @returns {Promise<{success: boolean, data?: object, message?: string}>}
 */
export async function getBarberAvailability(barberId) {
  return apiGet(`/barber/${barberId}/availability`);
}

/**
 * Get barber portfolio (public)
 * @param {number} barberId
 * @returns {Promise<{success: boolean, data?: object, message?: string}>}
 */
export async function getBarberPortfolio(barberId) {
  return apiGet(`/barber/${barberId}/portfolio`);
}

/**
 * Get barber posts (public)
 * @param {number} barberId
 * @returns {Promise<{success: boolean, data?: object, message?: string}>}
 */
export async function getBarberPosts(barberId) {
  return apiGet(`/barber/${barberId}/posts`);
}

/**
 * Get barber reviews (public)
 * @param {number} barberId
 * @returns {Promise<{success: boolean, data?: object[], message?: string}>}
 */
export async function getBarberReviews(barberId) {
  return apiGet(`/barber/${barberId}/reviews`);
}

/**
 * Update barber profile (protected - barber only)
 * @param {number} barberId
 * @param {object} profileData
 * @returns {Promise<{success: boolean, data?: object, message?: string}>}
 */
export async function updateBarberProfile(barberId, profileData) {
  return apiPut(`/barber/${barberId}/profile`, profileData);
}
