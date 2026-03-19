import React, { useState } from "react";

const chatbotData = {
  booking: {
    label: "💇 Booking",
    questions: [
      {
        q: "How do I book a barber?",
        a: "Go to the barber's profile and select an available time slot.",
      },
      {
        q: "Can I cancel a booking?",
        a: "Yes, you can cancel from your bookings page.",
      },
    ],
  },
  barber: {
    label: "👤 Barber Profiles",
    questions: [
      {
        q: "How do I follow a barber?",
        a: "Click the follow button on the barber's profile.",
      },
    ],
  },
  salon: {
    label: "🏪 Salons",
    questions: [
      {
        q: "How do salons recruit barbers?",
        a: "Salons can view verified barbers and send recruitment requests.",
      },
    ],
  },
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [messages, setMessages] = useState([]);

  const handleQuestionClick = (question) => {
    setMessages((prev) => [
      ...prev,
      { type: "user", text: question.q },
      { type: "bot", text: question.a },
    ]);
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button style={styles.fab} onClick={() => setOpen(true)}>
          💬
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <span>Styloq Assistant</span>
            <button onClick={() => setOpen(false)} style={styles.closeBtn}>
              ✖
            </button>
          </div>

          {/* Chat Messages */}
          <div style={styles.chatBox}>
            {messages.length === 0 && (
              <div style={styles.botMessage}>👋 Hi! How can I help you?</div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                style={
                  msg.type === "user" ? styles.userMessage : styles.botMessage
                }
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Options */}
          <div style={styles.options}>
            {!selectedCategory &&
              Object.keys(chatbotData).map((key) => (
                <button
                  key={key}
                  style={styles.optionBtn}
                  onClick={() => setSelectedCategory(key)}
                >
                  {chatbotData[key].label}
                </button>
              ))}

            {selectedCategory &&
              chatbotData[selectedCategory].questions.map((q, index) => (
                <button
                  key={index}
                  style={styles.optionBtn}
                  onClick={() => handleQuestionClick(q)}
                >
                  {q.q}
                </button>
              ))}

            {selectedCategory && (
              <button
                style={styles.backBtn}
                onClick={() => setSelectedCategory(null)}
              >
                ⬅ Back
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  fab: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    backgroundColor: "var(--color-accent)",
    color: "#fff",
    border: "none",
    fontSize: "22px",
    cursor: "pointer",
    boxShadow: "0 4px 12px var(--color-accent-glow)",
    zIndex: 1000,
  },

  container: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "320px",
    height: "450px",
    backgroundColor: "#000", // 🔥 black background
    borderRadius: "15px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
    zIndex: 1000,
    border: "1px solid var(--color-accent-border)",
  },

  header: {
    backgroundColor: "var(--color-accent)",
    color: "#fff",
    padding: "12px",
    fontWeight: "bold",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  closeBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
  },

  chatBox: {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    backgroundColor: "#111", // 🔥 dark grey for contrast
  },

  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "var(--color-accent)",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "15px",
    maxWidth: "70%",
  },

  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "15px",
    maxWidth: "70%",
    border: "1px solid var(--color-accent-border)",
  },

  options: {
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    borderTop: "1px solid #222",
    backgroundColor: "#000",
  },

  optionBtn: {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid var(--color-accent-border)",
    backgroundColor: "#111",
    color: "#fff",
    cursor: "pointer",
    textAlign: "left",
  },

  backBtn: {
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "var(--color-accent)",
    color: "#fff",
    cursor: "pointer",
  },
};
