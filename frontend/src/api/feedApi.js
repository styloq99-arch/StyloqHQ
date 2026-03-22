/**
 * Feed API - Post interactions
 * Matches backend feed/routes.py exactly
 */
import { apiGet, apiPost, apiDelete } from "../utils/api.js";

/**
 * Create a new post (barber only)
 * Backend: POST /feed/create with body { "caption": "text", "image_url": "url" }
 * Or multipart: POST /feed/create with FormData containing caption and image
 * @param {FormData|string} postData - FormData with image and caption, or object with image_url and caption
 * @returns {Promise<{success: boolean, data?: object, message?: string}>}
 */
export async function createPost(postData) {
  // Check if it's FormData or regular data
  if (postData instanceof FormData) {
    return apiPostForm('/feed/create', postData);
  }
  return apiPost('/feed/create', postData);
}

/**
 * Helper for FormData POST requests
 */
async function apiPostForm(endpoint, formData) {
  const token = localStorage.getItem('supabase_token') || 
                await (await import('../supabaseClient.js')).supabase.auth.getSession().then(r => r.data.session?.access_token);
  
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
}

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
