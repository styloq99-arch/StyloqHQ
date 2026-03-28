import { useState, useRef, useEffect } from "react";

const chatbotData = {
  booking: {
    label: "💇 Booking & Appointments",
    questions: [
      {
        q: "How do I book a barber?",
        a: "Navigate to a barber's profile, click 'Book', choose an available time slot, and confirm.",
      },
      {
        q: "Can I cancel or reschedule?",
        a: "Yes, you can manage your upcoming appointments from your profile's booking section.",
      },
      {
        q: "How do I know it's confirmed?",
        a: "You'll see it marked as 'Confirmed' in your bookings list and receive a notification.",
      }
    ],
  },
  barber: {
    label: "👤 Barber Profiles",
    questions: [
      {
        q: "How do I follow a barber?",
        a: "Click the follow icon on the barber's profile to stay updated with their posts.",
      },
      {
        q: "How do I leave a review?",
        a: "After an appointment finishes, you can leave a star rating and comment on the barber's profile.",
      },
      {
        q: "How can I see their work?",
        a: "Scroll down on any barber's profile to view their feed of styles.",
      }
    ],
  },
  account: {
    label: "⚙️ Account & Settings",
    questions: [
      {
        q: "How do I change my role?",
        a: "You pick your role during sign-up. If you need to change it, contact support.",
      },
      {
        q: "How do I edit my profile?",
        a: "Go to 'Profile' in the navigation menu and hit the 'Edit Profile' button.",
      }
    ]
  },
  support: {
    label: "🆘 Support & Help",
    questions: [
      {
        q: "What if a barber doesn't show?",
        a: "Please report the incident through the booking details page so we can refund you.",
      },
      {
        q: "How do I contact you?",
        a: "Email us directly at support@styloq.com for any urgent inquiries.",
      }
    ]
  }
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [messages, setMessages] = useState([]);

  // Initialization: bottom right
  const [position, setPosition] = useState({ 
    x: window.innerWidth - 80, 
    y: window.innerHeight - 80 
  });
  
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 60),
        y: Math.min(prev.y, window.innerHeight - 60)
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e) => {
    isDragging.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    // Buttons === 1 means left click is held
    if (e.buttons !== 1) return;

    const dx = Math.abs(e.clientX - dragStart.current.x);
    const dy = Math.abs(e.clientY - dragStart.current.y);
    
    // Distinguish between a click and a drag
    if (dx > 3 || dy > 3) {
      isDragging.current = true;
    }

    if (isDragging.current) {
      setPosition({
        x: Math.min(Math.max(0, e.clientX - 25), window.innerWidth - 55),
        y: Math.min(Math.max(0, e.clientY - 25), window.innerHeight - 55),
      });
    }
  };

  const handlePointerUp = (e) => {
    e.target.releasePointerCapture(e.pointerId);
    if (!isDragging.current) {
      setOpen(true);
    }
  };

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
          style={{
            top: position.y,
            left: position.x,
            bottom: "auto",
            right: "auto",
            touchAction: "none" // Prevents scrolling on mobile during drag
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          title="Drag to move, click to open"
        >
          <i className="fas fa-robot" style={{ pointerEvents: 'none' }}></i>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <span><i className="fas fa-robot" style={{ marginRight: '8px' }}></i> StyloQ Assistant</span>
            <button
              className="chatbot-close-btn"
              onClick={() => setOpen(false)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="bot-msg">👋 Hi! I'm here to help. Pick a topic below!</div>
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
                className="chatbot-back-btn chatbot-btn"
                style={{ textAlign: 'center', background: 'var(--color-accent)' }}
                onClick={() => setSelectedCategory(null)}
              >
                <i className="fas fa-arrow-left"></i> Back to Topics
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
