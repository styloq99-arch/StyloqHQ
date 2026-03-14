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

  const sendMessage = () => {};
}
