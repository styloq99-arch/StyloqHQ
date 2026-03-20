/**
 * Reusable API helper for making authenticated requests
 * Automatically attaches Authorization header if token exists
 */

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000").replace(/\/+$/, "");

console.log("API Base URL:", API_BASE_URL);

function getAuthToken() {
  return localStorage.getItem("token");
}

export function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Health check - verify backend is running
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error("Health check failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/user/profile')
 * @param {object} options - fetch options (method, body, etc.)
 * @returns {Promise<{success: boolean, data?: any, message?: string, reason?: string}>}
 */
export async function apiRequest(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options.headers,
    };

    console.log(`API Request: ${options.method || "GET"} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("Failed to parse response JSON:", e);
      return {
        success: false,
        message: `Server error: HTTP ${response.status}`,
        reason: "parse_error",
        status: response.status,
      };
    }

    console.log(`API Response: ${response.status}`, data);

    if (!response.ok) {
      // Handle 401 - token expired or invalid
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("logout"));
      }
      return {
        success: false,
        message: data.message || `HTTP ${response.status}`,
        reason: data.reason || "http_error",
        status: response.status,
      };
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error);

    // Network errors (Failed to fetch)
    if (error instanceof TypeError) {
      return {
        success: false,
        message: `Cannot connect to ${API_BASE_URL}. Is the server running?`,
        reason: "network_error",
      };
    }
    return {
      success: false,
      message: error.message || "An error occurred",
      reason: "unknown_error",
    };
  }
}

/**
 * POST request
 */
export async function apiPost(endpoint, body, options = {}) {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });
}

/**
 * GET request
 */
export async function apiGet(endpoint, options = {}) {
  return apiRequest(endpoint, {
    method: "GET",
    ...options,
  });
}

/**
 * PUT request
 */
export async function apiPut(endpoint, body, options = {}) {
  return apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
    ...options,
  });
}

/**
 * DELETE request
 */
export async function apiDelete(endpoint, options = {}) {
  return apiRequest(endpoint, {
    method: "DELETE",
    ...options,
  });
}
