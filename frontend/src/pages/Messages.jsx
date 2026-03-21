import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getConversations, getChatHistory, sendMessage } from "../api/messageApi";

export default function Messages() {
  const { token, user } = useAuth();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Check if a user was passed via state (e.g. from "Message" button on Barber Profile)
  useEffect(() => {
    if (location.state && location.state.userId) {
      setSelectedContact({
        id: location.state.userId,
        name: location.state.userName || "User",
        role: location.state.userRole || "unknown"
      });
    }
  }, [location.state]);

  // Fetch contacts
  const fetchContacts = async () => {
    if (!token) return;
    const res = await getConversations(token);
    if (res.success) {
      setContacts(res.data);
      // Auto-select first contact if none selected and we didn't navigate with state
      if (res.data.length > 0 && !selectedContact && !location.state) {
        setSelectedContact({
          id: res.data[0].id,
          name: res.data[0].name,
          role: res.data[0].role
        });
      }
    }
    setLoadingContacts(false);
  };

  useEffect(() => {
    fetchContacts();
    // Poll contacts every 10s to see if there are new messages pushing people to top
    const interval = setInterval(fetchContacts, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // Fetch chat history for selected user
  const fetchMessages = async (forceLoad = false) => {
    if (!token || !selectedContact) return;
    if (forceLoad) setLoadingMessages(true);
    
    const res = await getChatHistory(token, selectedContact.id);
    if (res.success) {
      setMessages(res.data);
    }
    if (forceLoad) setLoadingMessages(false);
  };

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(true);
      // Poll current chat every 3 seconds for fast reply visibility
      const interval = setInterval(() => fetchMessages(false), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedContact, token]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContact) return;

    const tempMsg = {
      id: Date.now(),
      content: inputText,
      is_mine: true,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMsg]);
    setInputText("");

    const res = await sendMessage(token, selectedContact.id, tempMsg.content);
    if (res.success) {
      // Re-fetch strictly to get accurate DB ID
      fetchMessages(false);
      fetchContacts();
    } else {
      // Revert if failed (simple visual cleanup by re-fetching)
      fetchMessages(false);
    }
  };

  return (
    <div className="app-layout" style={{ height: "100vh", overflow: "hidden" }}>
      {/* Sidebar - mimicking CustomerHome */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <h1 className="brand-title" style={{ fontSize: "40px" }}>StyloQ</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/home" className="sidebar-link">
            <i className="fas fa-home"></i> <span>Home</span>
          </Link>
          <Link to="/ai-recommendation" className="sidebar-link">
            <i className="fas fa-magic"></i> <span>AI Stylist</span>
          </Link>
          <Link to="/customer-search" className="sidebar-link">
            <i className="fas fa-search"></i> <span>Search</span>
          </Link>
          <Link to="/favourites" className="sidebar-link">
            <i className="fas fa-heart"></i> <span>Favourites</span>
          </Link>
          <Link to="/message" className="sidebar-link active">
            <i className="fas fa-comments"></i> <span>Message</span>
          </Link>
          <Link to="/profile" className="sidebar-link">
            <i className="fas fa-user"></i> <span>Profile</span>
          </Link>
        </nav>
      </aside>

      <div className="main-content" style={{ display: "flex", flexDirection: "column", height: "100vh", padding: 0 }}>
        {/* Header */}
        <header className="customer-barber-header" style={{ padding: "1rem 2rem", borderBottom: "1px solid var(--border-faint)", zIndex: 10 }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem", color: "var(--text-primary)" }}>Messages</h1>
        </header>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Contacts List */}
          <div style={{ 
            width: "350px", 
            borderRight: "1px solid var(--border-faint)", 
            backgroundColor: "var(--bg-elevated)",
            display: "flex", 
            flexDirection: "column",
            overflowY: "auto"
          }}>
            {loadingContacts ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-dim)" }}>
                <i className="fas fa-spinner fa-spin"></i> Loading...
              </div>
            ) : contacts.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-dim)" }}>
                No active conversations. Open a barber's profile to send them a message!
              </div>
            ) : (
              contacts.map((contact) => (
                <div 
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  style={{
                    padding: "1rem",
                    borderBottom: "1px solid var(--border-faint)",
                    cursor: "pointer",
                    backgroundColor: selectedContact?.id === contact.id ? "var(--bg-highlight, #f0f7ff)" : "transparent",
                    transition: "background 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h4 style={{ margin: "0 0 0.2rem 0", color: "var(--text-primary)" }}>{contact.name}</h4>
                    {contact.last_message && (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                        {new Date(contact.last_message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  {contact.last_message && (
                    <p style={{ 
                      margin: 0, 
                      fontSize: "0.9rem", 
                      color: contact.last_message.is_read || contact.last_message.is_mine ? "var(--text-secondary)" : "var(--text-primary)",
                      fontWeight: contact.last_message.is_read || contact.last_message.is_mine ? "normal" : "bold",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {contact.last_message.is_mine ? "You: " : ""}{contact.last_message.content}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Chat Interface */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "var(--bg-base)" }}>
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div style={{ 
                  padding: "1rem 2rem", 
                  backgroundColor: "var(--bg-elevated)", 
                  borderBottom: "1px solid var(--border-faint)",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem"
                }}>
                  <div style={{ 
                    width: "40px", 
                    height: "40px", 
                    borderRadius: "50%", 
                    backgroundColor: "var(--color-accent)", 
                    color: "white", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontWeight: "bold"
                  }}>
                    {selectedContact.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: "var(--text-primary)" }}>{selectedContact.name}</h3>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-dim)", textTransform: "capitalize" }}>{selectedContact.role}</p>
                  </div>
                </div>

                {/* Messages Area */}
                <div style={{ flex: 1, overflowY: "auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {loadingMessages ? (
                    <div style={{ textAlign: "center", color: "var(--text-dim)" }}><i className="fas fa-spinner fa-spin"></i> Fetching history...</div>
                  ) : messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "var(--text-dim)", marginTop: "auto", marginBottom: "auto" }}>
                      Send a message to start the conversation!
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        style={{ 
                          alignSelf: msg.is_mine ? "flex-end" : "flex-start",
                          maxWidth: "70%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: msg.is_mine ? "flex-end" : "flex-start"
                        }}
                      >
                        <div style={{
                          backgroundColor: msg.is_mine ? "var(--color-accent)" : "var(--bg-elevated)",
                          color: msg.is_mine ? "white" : "var(--text-primary)",
                          padding: "0.8rem 1.2rem",
                          borderRadius: "18px",
                          borderBottomRightRadius: msg.is_mine ? "4px" : "18px",
                          borderBottomLeftRadius: !msg.is_mine ? "4px" : "18px",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                        }}>
                          {msg.content}
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: "0.3rem" }}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: "1.5rem 2rem", backgroundColor: "var(--bg-elevated)", borderTop: "1px solid var(--border-faint)" }}>
                  <form onSubmit={handleSend} style={{ display: "flex", gap: "1rem" }}>
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type your message..." 
                      style={{ 
                        flex: 1, 
                        padding: "1rem", 
                        borderRadius: "30px", 
                        border: "1px solid var(--border-deep)",
                        backgroundColor: "var(--bg-base)",
                        color: "var(--text-primary)",
                        outline: "none"
                      }} 
                    />
                    <button 
                      type="submit" 
                      disabled={!inputText.trim()}
                      style={{ 
                        width: "50px", 
                        height: "50px", 
                        borderRadius: "50%", 
                        backgroundColor: inputText.trim() ? "var(--color-accent)" : "var(--border-deep)", 
                        color: "white", 
                        border: "none", 
                        cursor: inputText.trim() ? "pointer" : "default",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background 0.2s"
                      }}
                    >
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-dim)" }}>
                <i className="fas fa-comments" style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.5 }}></i>
                <h2>Your Messages</h2>
                <p>Select a conversation or start a new one.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
