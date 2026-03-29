import { apiGet, apiPost } from "../utils/api.js";

export async function getConversations() {
  return apiGet("/messages");
}

export async function getChatHistory(userId) {
  return apiGet(`/messages/${userId}`);
}

export async function sendMessage(userId, content) {
  return apiPost(`/messages/${userId}`, { content });
}

export async function getAvailableContacts() {
  return apiGet("/messages/contacts");
}
