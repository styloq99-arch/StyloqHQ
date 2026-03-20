/**
 * Feed API - Post interactions
 */
import { apiGet, apiPost, apiDelete } from "../utils/api.js";

/**
 * Get feed posts
 * @param {object} params - pagination and filter params
 * @returns {Promise<{success: boolean, data?: {posts: [], hasMore: boolean}, message?: string}>}
 */
export async function getFeed(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return apiGet(`/feed${queryString ? `?${queryString}` : ''}`);
}

/**
 * Like a post
 * @param {string} postId
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export async function likePost(postId) {
  return apiPost(`/feed/${postId}/like`);
}

/**
 * Unlike a post
 * @param {string} postId
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export async function unlikePost(postId) {
  return apiDelete(`/feed/${postId}/like`);
}

/**
 * Comment on a post
 * @param {string} postId
 * @param {object} commentData - {content: string}
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export async function commentPost(postId, commentData) {
  return apiPost(`/feed/${postId}/comments`, commentData);
}

/**
 * Save/bookmark a post
 * @param {string} postId
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export async function savePost(postId) {
  return apiPost(`/feed/${postId}/save`);
}

/**
 * Delete a post
 * @param {string} postId
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export async function deletePost(postId) {
  return apiDelete(`/feed/${postId}`);
}
