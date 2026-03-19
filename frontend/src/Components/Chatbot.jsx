import React, { useState } from "react";

const chatbotData = {
  booking: {
    label: "Booking",
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
    label: "Barber Profiles",
    questions: [
      {
        q: "How do I follow a barber?",
        a: "Click the follow button on the barber's profile.",
      },
    ],
  },
  salon: {
    label: "Salons",
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

  const goBack = () => {
    setSelectedCategory(null);
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "14px",
            borderRadius: "50%",
            backgroundColor: "#ff7a00",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            zIndex: 1000,
            fontSize: "18px",
          }}
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "320px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            zIndex: 1000,
            padding: "10px",
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => setOpen(false)}
            style={{
              float: "right",
              border: "none",
              background: "none",
              cursor: "pointer",
            }}
          >
            ✖
          </button>

          <h3>Styloq Assistant</h3>

          {/* CHAT AREA */}
          <div
            style={{
              height: "250px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.type === "user" ? "flex-end" : "flex-start",
                  backgroundColor: msg.type === "user" ? "#ff7a00" : "#eee",
                  color: msg.type === "user" ? "#fff" : "#000",
                  padding: "8px 12px",
                  borderRadius: "15px",
                  maxWidth: "70%",
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* CATEGORY / QUESTIONS */}
          {!selectedCategory && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {Object.keys(chatbotData).map((key) => (
                <button key={key} onClick={() => setSelectedCategory(key)}>
                  {chatbotData[key].label}
                </button>
              ))}
            </div>
          )}

          {selectedCategory && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {chatbotData[selectedCategory].questions.map((q, index) => (
                <button key={index} onClick={() => handleQuestionClick(q)}>
                  {q.q}
                </button>
              ))}

              <button onClick={() => setSelectedCategory(null)}>⬅ Back</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

const styles = {
  container: {
    width: "350px",
    margin: "20px auto",
    border: "1px solid #ccc",
    borderRadius: "10px",
    padding: "10px",
    fontFamily: "Arial",
  },
  chatBox: {
    height: "300px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "10px",
    padding: "10px",
    border: "1px solid #eee",
  },
  message: {
    padding: "8px 12px",
    borderRadius: "15px",
    maxWidth: "70%",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  button: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#000",
    color: "#fff",
    cursor: "pointer",
  },
  backButton: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#888",
    color: "#fff",
    cursor: "pointer",
  },
};
