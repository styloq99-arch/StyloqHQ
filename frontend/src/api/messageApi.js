import { apiGet, apiPost } from "../utils/api.js";

export async function getConversations() {
  return apiGet("/messages");
}

export async function getChatHistory(token, userId) {
  return apiGet(`/messages/${userId}`);
}

export async function sendMessage(token, userId, content) {
  return apiPost(`/messages/${userId}`, { content });
}