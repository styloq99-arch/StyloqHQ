import { useState } from "react";

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

  const handleQuestionClick = (q) => {
    setMessages((prev) => [
      ...prev,
      { type: "user", text: q.q },
      { type: "bot", text: q.a },
    ]);
  };

  return (
    <>
      {!open && (
        <button className="chatbot-fab" onClick={() => setOpen(true)}>
          💬
        </button>
      )}

      {open && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            Styloq Assistant
            <button onClick={() => setOpen(false)}>✖</button>
          </div>

          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="bot-msg">👋 Hi! How can I help you?</div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.type === "user" ? "user-msg" : "bot-msg"}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chatbot-options">
            {!selectedCategory &&
              Object.keys(chatbotData).map((key) => (
                <button
                  key={key}
                  className="chatbot-btn"
                  onClick={() => setSelectedCategory(key)}
                >
                  {chatbotData[key].label}
                </button>
              ))}

            {selectedCategory &&
              chatbotData[selectedCategory].questions.map((q, i) => (
                <button
                  key={i}
                  className="chatbot-btn"
                  onClick={() => handleQuestionClick(q)}
                >
                  {q.q}
                </button>
              ))}

            {selectedCategory && (
              <button
                className="chatbot-back"
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
