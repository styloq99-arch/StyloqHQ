/**
 * Feed API - Post interactions
 * Matches backend feed/routes.py exactly
 */
import { apiGet, apiPost, apiDelete } from "../utils/api.js";

/**
 * Get feed posts (paginated)
 * Backend: GET /feed?page=1&limit=5
 * @param {object} params - { page: number, limit: number }
 * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
 */
export async function getFeed(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return apiGet(`/feed${queryString ? `?${queryString}` : ''}`);
}

/**
 * Toggle like on a post (like if not liked, unlike if already liked)
 * Backend: POST /feed/{post_id}/like
 * @param {number} postId
 * @returns {Promise<{success: boolean, data?: {message: string}, message?: string}>}
 */
export async function toggleLike(postId) {
  return apiPost(`/feed/${postId}/like`);
}

/**
 * Add comment to a post
 * Backend: POST /feed/{post_id}/comments with body { "content": "text" }
 * @param {number} postId
 * @param {string} commentText - The comment text
 * @returns {Promise<{success: boolean, data?: {id, content, username, createdAt}, message?: string}>}
 */
export async function addComment(postId, commentText) {
  return apiPost(`/feed/${postId}/comments`, { content: commentText });
}

/**
 * Toggle save on a post (save if not saved, unsave if already saved)
 * Backend: POST /feed/{post_id}/save
 * @param {number} postId
 * @returns {Promise<{success: boolean, data?: {message: string}, message?: string}>}
 */
export async function toggleSave(postId) {
  return apiPost(`/feed/${postId}/save`);
}

/**
 * Delete a post (owner only)
 * Backend: DELETE /feed/{post_id}
 * @param {number} postId
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export async function deletePost(postId) {
  return apiDelete(`/feed/${postId}`);
}

/**
 * Get comments for a post
 * Backend: GET /feed/{post_id}/comments
 * @param {number} postId
 * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
 */
export async function getComments(postId) {
  return apiGet(`/feed/${postId}/comments`);
}

/**
 * Get saved posts for current user
 * Backend: GET /feed/saved
 * @returns {Promise<{success: boolean, data?: {posts: Array}, message?: string}>}
 */
export async function getSavedPosts() {
  return apiGet('/feed/saved');
}

/**
 * Create a new post (barber only)
 * Backend: POST /feed/create
 * @param {string} caption
 * @param {string} imageUrl
 * @returns {Promise<{success: boolean, data?: {post_id, message}, message?: string}>}
 */
export async function createPost(caption, imageUrl) {
  return apiPost('/feed/create', { caption, image_url: imageUrl });
}
