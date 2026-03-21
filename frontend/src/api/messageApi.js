const API_BASE_URL = "http://localhost:5000/messages";

export async function getConversations(token) {
  try {
    const res = await fetch(`${API_BASE_URL}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return { success: false, message: error.message };
  }
}

export async function getChatHistory(token, userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch chat history:", error);
    return { success: false, message: error.message };
  }
}

export async function sendMessage(token, userId, content) {
  try {
    const res = await fetch(`${API_BASE_URL}/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to send message:", error);
    return { success: false, message: error.message };
  }
}
