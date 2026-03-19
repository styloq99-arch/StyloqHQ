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
