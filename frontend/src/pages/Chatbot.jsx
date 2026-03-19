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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [messages, setMessages] = useState([]);

  const handleQuestionClick = (question) => {
    setMessages((prev) => [
      ...prev,
      { type: "user", text: question.q },
      { type: "bot", text: question.a },
    ]);
  };
}

const goBack = () => {
  setSelectedCategory(null);
};

return (
  <div style={styles.container}>
    <h2>Styloq Assistant</h2>

    <div style={styles.chatBox}>
      {messages.map((msg, index) => (
        <div
          key={index}
          style={{
            ...styles.message,
            alignSelf: msg.type === "user" ? "flex-end" : "flex-start",
            backgroundColor: msg.type === "user" ? "#ff7a00" : "#eee",
            color: msg.type === "user" ? "#fff" : "#000",
          }}
        >
          {msg.text}
        </div>
      ))}
    </div>

    {/* CATEGORY VIEW */}
    {!selectedCategory && (
      <div style={styles.buttonContainer}>
        {Object.keys(chatbotData).map((key) => (
          <button
            key={key}
            style={styles.button}
            onClick={() => setSelectedCategory(key)}
          >
            {chatbotData[key].label}
          </button>
        ))}
      </div>
    )}

    {/* QUESTIONS VIEW */}
    {selectedCategory && (
      <div style={styles.buttonContainer}>
        {chatbotData[selectedCategory].questions.map((q, index) => (
          <button
            key={index}
            style={styles.button}
            onClick={() => handleQuestionClick(q)}
          >
            {q.q}
          </button>
        ))}

        <button style={styles.backButton} onClick={goBack}>
          ⬅ Back
        </button>
      </div>
    )}
  </div>
);

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
