import React, { useState } from "react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi 👋 I'm the StyloQ assistant. How can I help you?",
    },
  ]);

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

    setMessages((prev) => [...prev, userMsg, botMsg]);

    setInput("");
  };
}
