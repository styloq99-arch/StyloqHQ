/**
 * Barber API Service
 * Centralized API client for all barber-related endpoints
 * Base URL: /barber
 */

import { supabase } from "../supabaseClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const BARBER_ENDPOINT = `${API_BASE_URL}/barber`;

// -------------------------------------------------
// HELPER FUNCTIONS
// -------------------------------------------------

/**
 * Get access token from Supabase session
 * @returns {Promise<string|null>} Access token or null
 */
async function getToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

/**
 * Check if user has an active Supabase session
 * @returns {Promise<boolean>} True if user is authenticated
 */
async function isAuthenticated() {
  const token = await getToken();
  return !!token;
}

/**
 * Make API request with automatic auth header
 * @param {string} endpoint - Full endpoint path
 * @param {object} options - Fetch options
 * @returns {Promise<{success: boolean, data: any, reason?: string, message?: string}>}
 */
async function apiRequest(endpoint, options = {}) {
  const token = await getToken();
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add auth header for protected endpoints if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json();

    // Handle 401 Unauthorized - auto logout
    if (response.status === 401) {
      window.dispatchEvent(new Event("logout"));
      throw new Error("Session expired. Please login again.");
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      throw new Error("Access denied. You don't have permission to perform this action.");
    }

    // Backend returns { success, data, reason, message }
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
 * Generic error handler for API calls
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default message if error has no message
 * @returns {object} Formatted error object
 */
function handleError(error, defaultMessage = "An error occurred") {
  return {
    success: false,
    message: error.message || defaultMessage,
    reason: error.reason || "REQUEST_FAILED",
  };
}

// -------------------------------------------------
// PUBLIC ENDPOINTS (No authentication required)
// -------------------------------------------------

/**
 * Get barber profile information
 * GET /barber/{id}/profile
 * @param {string} barberId - Barber ID
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function getBarberProfile(barberId) {
  try {
    const response = await apiRequest(`${BARBER_ENDPOINT}/${barberId}/profile`, {
      method: "GET",
    });
    return response;
  } catch (error) {
    return handleError(error, "Failed to fetch barber profile");
  }
}

/**
 * Get barber availability
 * GET /barber/{id}/availability
 * @param {string} barberId - Barber ID
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function getBarberAvailability(barberId) {
  try {
    const response = await apiRequest(`${BARBER_ENDPOINT}/${barberId}/availability`, {
      method: "GET",
    });
    return response;
  } catch (error) {
    return handleError(error, "Failed to fetch availability");
  }
}

/**
 * Get barber portfolio items
 * GET /barber/{id}/portfolio
 * @param {string} barberId - Barber ID
 * @returns {Promise<{success: boolean, data: object[]}>}
 */
export async function getBarberPortfolio(barberId) {
  try {
    const response = await apiRequest(`${BARBER_ENDPOINT}/${barberId}/portfolio`, {
      method: "GET",
    });
    return response;
  } catch (error) {
    return handleError(error, "Failed to fetch portfolio");
  }
}

/**
 * Get barber social media posts
 * GET /barber/{id}/posts
 * @param {string} barberId - Barber ID
 * @returns {Promise<{success: boolean, data: object[]}>}
 */
export async function getBarberPosts(barberId) {
  try {
    const response = await apiRequest(`${BARBER_ENDPOINT}/${barberId}/posts`, {
      method: "GET",
    });
    return response;
  } catch (error) {
    return handleError(error, "Failed to fetch posts");
  }
}

// -------------------------------------------------
// PROTECTED ENDPOINTS (Require authentication)
// -------------------------------------------------

/**
 * Update barber profile
 * PUT /barber/{id}/profile
 * @param {string} barberId - Barber ID
 * @param {object} profileData - Profile data to update
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function updateProfile(barberId, profileData) {
  try {
    if (!(await isAuthenticated())) {
      throw new Error("Authentication required");
    }
    const response = await apiRequest(`${BARBER_ENDPOINT}/${barberId}/profile`, {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
    return response;
  } catch (error) {
    return handleError(error, "Failed to update profile");
  }
}

/**
 * Update barber location
 * PUT /barber/{id}/location
 * @param {string} barberId - Barber ID
 * @param {object} locationData - Location data { latitude, longitude, address }
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function updateLocation(barberId, locationData) {
  try {
    if (!(await isAuthenticated())) {
      throw new Error("Authentication required");
    }
    const response = await apiRequest(`${BARBER_ENDPOINT}/${barberId}/location`, {
      method: "PUT",
      body: JSON.stringify(locationData),
    });
    return response;
  } catch (error) {
    return handleError(error, "Failed to update location");
  }
}

/**
 * Update barber availability
 * PUT /barber/{id}/availability
 * @param {string} barberId - Barber ID
 * @param {object} availabilityData - Availability schedule
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function updateAvailability(barberId, availabilityData) {
  try {
    if (!(await isAuthenticated())) {
      throw new Error("Authentication required");
    }
    const response = await apiRequest(`${BARBER_ENDPOINT}/${barberId}/availability`, {
      method: "PUT",
      body: JSON.stringify(availabilityData),
    });
    return response;
  } catch (error) {
    return handleError(error, "Failed to update availability");
  }
}

/**
 * Add portfolio item
 * POST /barber/{id}/portfolio
 * @param {string} barberId - Barber ID
 * @param {FormData} portfolioData - Form data with file and metadata
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function addPortfolioItem(barberId, portfolioData) {
  try {
    if (!(await isAuthenticated())) {
      throw new Error("Authentication required");
    }
    
    const token = await getToken();
    const response = await fetch(`${BARBER_ENDPOINT}/${barberId}/portfolio`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: portfolioData, // FormData, don't set Content-Type
    });

    if (response.status === 401) {
      window.dispatchEvent(new Event("logout"));
      throw new Error("Session expired");
    }

    if (response.status === 403) {
      throw new Error("Access denied");
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to add portfolio item");
    }

    return data;
  } catch (error) {
    return handleError(error, "Failed to add portfolio item");
  }
}

/**
 * Delete portfolio item
 * DELETE /barber/{id}/portfolio/{portfolioId}
 * @param {string} barberId - Barber ID
 * @param {string} portfolioId - Portfolio item ID
 * @returns {Promise<{success: boolean}>}
 */
export async function deletePortfolioItem(barberId, portfolioId) {
  try {
    if (!(await isAuthenticated())) {
      throw new Error("Authentication required");
    }
    const response = await apiRequest(
      `${BARBER_ENDPOINT}/${barberId}/portfolio/${portfolioId}`,
      {
        method: "DELETE",
      }
    );
    return response;
  } catch (error) {
    return handleError(error, "Failed to delete portfolio item");
  }
}

/**
 * Create social media post
 * POST /barber/{id}/posts
 * @param {string} barberId - Barber ID
 * @param {FormData} postData - Form data with image and caption
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function createPost(barberId, postData) {
  try {
    if (!(await isAuthenticated())) {
      throw new Error("Authentication required");
    }

    const token = await getToken();
    const response = await fetch(`${BARBER_ENDPOINT}/${barberId}/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: postData, // FormData, don't set Content-Type
    });

    if (response.status === 401) {
      window.dispatchEvent(new Event("logout"));
      throw new Error("Session expired");
    }

    if (response.status === 403) {
      throw new Error("Access denied");
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to create post");
    }

    return data;
  } catch (error) {
    return handleError(error, "Failed to create post");
  }
}

/**
 * Get barber appointments
 * GET /barber/{id}/appointments
 * @param {string} barberId - Barber ID
 * @returns {Promise<{success: boolean, data: object[]}>}
 */
export async function getAppointments(barberId) {
  try {
    if (!(await isAuthenticated())) {
      throw new Error("Authentication required");
    }
    const response = await apiRequest(`${BARBER_ENDPOINT}/${barberId}/appointments`, {
      method: "GET",
    });
    return response;
  } catch (error) {
    return handleError(error, "Failed to fetch appointments");
  }
}

/**
 * Accept appointment
 * PATCH /barber/appointments/{id}/accept
 * @param {string} appointmentId - Appointment ID
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function acceptAppointment(appointmentId) {
  try {
    if (!(await isAuthenticated())) {
      throw new Error("Authentication required");
    }
    const response = await apiRequest(
      `${BARBER_ENDPOINT}/appointments/${appointmentId}/accept`,
      {
        method: "PATCH",
        body: JSON.stringify({}),
      }
    );
    return response;
  } catch (error) {
    return handleError(error, "Failed to accept appointment");
  }
}

/**
 * Reject appointment
 * PATCH /barber/appointments/{id}/reject
 * @param {string} appointmentId - Appointment ID
 * @param {object} rejectData - Rejection reason (optional)
 * @returns {Promise<{success: boolean}>}
 */
export async function rejectAppointment(appointmentId, rejectData = {}) {
  try {
    if (!(await isAuthenticated())) {
      throw new Error("Authentication required");
    }
    const response = await apiRequest(
      `${BARBER_ENDPOINT}/appointments/${appointmentId}/reject`,
      {
        method: "PATCH",
        body: JSON.stringify(rejectData),
      }
    );
    return response;
  } catch (error) {
    return handleError(error, "Failed to reject appointment");
  }
}

/**
 * Reschedule appointment
 * PATCH /barber/appointments/{id}/reschedule
 * @param {string} appointmentId - Appointment ID
 * @param {object} rescheduleData - New date/time { dateTime }
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function rescheduleAppointment(appointmentId, rescheduleData) {
  try {
    if (!(await isAuthenticated())) {
      throw new Error("Authentication required");
    }
    const response = await apiRequest(
      `${BARBER_ENDPOINT}/appointments/${appointmentId}/reschedule`,
      {
        method: "PATCH",
        body: JSON.stringify(rescheduleData),
      }
    );
    return response;
  } catch (error) {
    return handleError(error, "Failed to reschedule appointment");
  }
}

/**
 * Book appointment with barber
 * POST /barber/{id}/book
 * @param {string} barberId - Barber ID
 * @param {object} bookingData - Booking details { dateTime, hairstyleId, notes }
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function bookAppointment(barberId, bookingData) {
  try {
    const response = await apiRequest(`${BARBER_ENDPOINT}/${barberId}/book`, {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
    return response;
  } catch (error) {
    return handleError(error, "Failed to book appointment");
  }
}

// -------------------------------------------------
// UTILITY EXPORTS
// -------------------------------------------------

export { isAuthenticated, getToken };
