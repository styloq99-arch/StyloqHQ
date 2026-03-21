/**
 * Feed API Service
 * Handles all feed-related API calls with automatic authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const FEED_ENDPOINT = `${API_BASE_URL}/feed`;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get JWT token from localStorage
 */
function getToken() {
  return localStorage.getItem("token");
}

/**
 * Make authenticated API request
 */
async function authenticatedRequest(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    // Handle 401 - auto logout
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.href = "/signin";
      throw new Error("Session expired. Please login again.");
    }

    // Handle 403 - access denied
    if (response.status === 403) {
      throw new Error("Access denied. You don't have permission to perform this action.");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
}

/**
 * Generic error handler
 */
function handleError(error, defaultMessage = "An error occurred") {
  return {
    success: false,
    message: error.message || defaultMessage,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC ENDPOINTS (No authentication required)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get paginated feed posts
 * GET /feed?page=1&limit=5
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Posts per page (default: 5)
 * @returns {Promise<{success: boolean, data: array}>}
 */
export async function getFeed(page = 1, limit = 5) {
  try {
    const response = await authenticatedRequest(
      `${FEED_ENDPOINT}/?page=${page}&limit=${limit}`,
      { method: "GET" }
    );
    return response;
  } catch (error) {
    return handleError(error, "Failed to fetch feed");
  }
}

/**
 * Get a single post
 * GET /feed/{post_id}
 * @param {number} postId - Post ID
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function getPost(postId) {
  try {
    const response = await authenticatedRequest(
      `${FEED_ENDPOINT}/${postId}`,
      { method: "GET" }
    );
    return response;
  } catch (error) {
    return handleError(error, "Failed to fetch post");
  }
}

/**
 * Get comments for a post
 * GET /feed/{post_id}/comments
 * @param {number} postId - Post ID
 * @returns {Promise<{success: boolean, data: {comments: array}}>}
 */
export async function getComments(postId) {
  try {
    const response = await authenticatedRequest(
      `${FEED_ENDPOINT}/${postId}/comments`,
      { method: "GET" }
    );
    return response;
  } catch (error) {
    return handleError(error, "Failed to fetch comments");
  }
}

/**
 * Get likes for a post
 * GET /feed/{post_id}/likes
 * @param {number} postId - Post ID
 * @returns {Promise<{success: boolean, data: {likes: array}}>}
 */
export async function getLikes(postId) {
  try {
    const response = await authenticatedRequest(
      `${FEED_ENDPOINT}/${postId}/likes`,
      { method: "GET" }
    );
    return response;
  } catch (error) {
    return handleError(error, "Failed to fetch likes");
  }
}

/**
 * Get saved posts
 * GET /feed/saved
 * @returns {Promise<{success: boolean, data: array}>}
 */
export async function getSavedPosts() {
  try {
    const response = await authenticatedRequest(
      `${FEED_ENDPOINT}/saved`,
      { method: "GET" }
    );
    return response;
  } catch (error) {
    return handleError(error, "Failed to fetch saved posts");
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROTECTED ENDPOINTS (Require authentication)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Like a post
 * POST /feed/{post_id}/like
 * @param {number} postId - Post ID
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function likePost(postId) {
  try {
    const response = await authenticatedRequest(
      `${FEED_ENDPOINT}/${postId}/like`,
      {
        method: "POST",
        body: JSON.stringify({}),
      }
    );
    return response;
  } catch (error) {
    return handleError(error, "Failed to like post");
  }
}

/**
 * Unlike a post (same endpoint, toggles)
 * POST /feed/{post_id}/like
 * @param {number} postId - Post ID
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function unlikePost(postId) {
  return likePost(postId); // Same endpoint, toggles like/unlike
}

/**
 * Comment on a post
 * POST /feed/{post_id}/comment
 * @param {number} postId - Post ID
 * @param {string} comment - Comment text
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function commentPost(postId, comment) {
  try {
    const response = await authenticatedRequest(
      `${FEED_ENDPOINT}/${postId}/comment`,
      {
        method: "POST",
        body: JSON.stringify({ comment }),
      }
    );
    return response;
  } catch (error) {
    return handleError(error, "Failed to add comment");
  }
}

/**
 * Save/bookmark a post
 * POST /feed/{post_id}/save
 * @param {number} postId - Post ID
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function savePost(postId) {
  try {
    const response = await authenticatedRequest(
      `${FEED_ENDPOINT}/${postId}/save`,
      {
        method: "POST",
        body: JSON.stringify({}),
      }
    );
    return response;
  } catch (error) {
    return handleError(error, "Failed to save post");
  }
}

/**
 * Delete a post
 * DELETE /feed/{post_id}
 * @param {number} postId - Post ID
 * @returns {Promise<{success: boolean}>}
 */
export async function deletePost(postId) {
  try {
    const response = await authenticatedRequest(
      `${FEED_ENDPOINT}/${postId}`,
      { method: "DELETE" }
    );
    return response;
  } catch (error) {
    return handleError(error, "Failed to delete post");
  }
}

/**
 * Create a new post
 * POST /feed/create
 * @param {object} data - Post data {caption, image_url}
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function createPost(data) {
  try {
    const response = await authenticatedRequest(
      `${FEED_ENDPOINT}/create`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response;
  } catch (error) {
    return handleError(error, "Failed to create post");
  }
}

export { getToken };
