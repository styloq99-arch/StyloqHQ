import { apiGet, apiPost } from "../utils/api.js";

/**
 * Get all conversations for the current user
 * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
 */
export async function getConversations() {
  return apiGet("/messages");
}

/**
 * Get chat history with a specific user
 * @param {number|string} userId - The ID of the user to chat with
 * @returns {Promise<{success: boolean, data?: Array, message?: string}>}
 */
export async function getChatHistory(userId) {
  return apiGet(`/messages/${userId}`);
}

/**
 * Send a message to a user
 * @param {number|string} userId - The ID of the recipient
 * @param {string} content - The message content
 * @returns {Promise<{success: boolean, data?: {id, content, timestamp, is_mine}, message?: string}>}
 */
export async function sendMessage(userId, content) {
  return apiPost(`/messages/${userId}`, { content });
}
