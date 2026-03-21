import { useState, useEffect } from "react";

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
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [messages, setMessages] = useState([]);

  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);

  const handleMouseDown = () => setDragging(true);
  const handleMouseUp = () => setDragging(false);

  const handleMouseMove = (e) => {
    if (!dragging) return;

    setPosition({
      x: window.innerWidth - e.clientX - 30,
      y: window.innerHeight - e.clientY - 30,
    });
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  const handleQuestionClick = (q) => {
    setMessages((prev) => [
      ...prev,
      { type: "user", text: q.q },
      { type: "bot", text: q.a },
    ]);
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          className="chatbot-fab"
          onMouseDown={handleMouseDown}
          onClick={() => !dragging && setOpen(true)}
          style={{
            bottom: position.y,
            right: position.x,
          }}
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            Styloq Assistant
            <button
              className="chatbot-close-btn"
              onClick={() => setOpen(false)}
            >
              ✖
            </button>
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
