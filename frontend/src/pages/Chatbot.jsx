import React, { useState, useEffect, useRef } from "react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi 👋 I'm the StyloQ assistant. How can I help you?",
    },
  ]);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };

    let botReply = "Sorry, I don't understand that.";

    const msg = input.toLowerCase();

    if (msg.includes("book"))
      botReply =
        "To book an appointment, open a barber profile and press Book.";
    else if (msg.includes("cancel"))
      botReply = "You can cancel a booking from the My Bookings page.";
    else if (msg.includes("barber"))
      botReply = "Use the search page to find barbers near you.";
    else if (msg.includes("styloq"))
      botReply = "StyloQ connects clients with barbers and salons.";

    const botMsg = { sender: "bot", text: botReply };

    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    setTimeout(() => {
      setTyping(false);

      const botMsg = { sender: "bot", text: botReply };

      setMessages((prev) => [...prev, botMsg]);
    }, 700);

    setInput("");
  };
  return (
    <>
      {!open && (
        <button className="chatbot-button" onClick={() => setOpen(true)}>
          💬
        </button>
      )}

      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            StyloQ Support
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chatbot-messages">
            <div className="faq-buttons">
              <button onClick={() => setInput("How do I book?")}>
                Book Appointment
              </button>

              <button onClick={() => setInput("Find barber")}>
                Find Barber
              </button>

              <button onClick={() => setInput("Cancel booking")}>
                Cancel Booking
              </button>
            </div>
            {messages.map((m, i) => (
              <div key={i} className={`chat-message ${m.sender}`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="chatbot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
