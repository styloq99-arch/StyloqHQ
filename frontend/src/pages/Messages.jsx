import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getConversations, getChatHistory, sendMessage, getAvailableContacts } from "../api/messageApi";
import CustomerSidebar from "../Components/CustomerSidebar";
import BarberSidebar from "../Components/BarberSidebar";
import SalonSidebar from "../Components/SalonSidebar";

export default function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // New Chat modal
  const [showNewChat, setShowNewChat] = useState(false);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");

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
  const initialLoadDone = useRef(false);

  const fetchContacts = async () => {
    if (!initialLoadDone.current) setLoadingContacts(true);
    const res = await getConversations();
    if (res.success) {
      setContacts(res.data || []);
      // Only auto-select first contact on initial load
      if (!initialLoadDone.current && (res.data || []).length > 0 && !selectedContact && !location.state) {
        setSelectedContact({
          id: res.data[0].id,
          name: res.data[0].name,
          role: res.data[0].role
        });
      }
    }
    if (!initialLoadDone.current) {
      setLoadingContacts(false);
      initialLoadDone.current = true;
    }
  };

  useEffect(() => {
    fetchContacts();
    const interval = setInterval(fetchContacts, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch chat history
  const selectedContactRef = useRef(selectedContact);
  selectedContactRef.current = selectedContact;

  const fetchMessages = async (forceLoad = false) => {
    const contact = selectedContactRef.current;
    if (!contact) return;
    if (forceLoad) setLoadingMessages(true);

    const res = await getChatHistory(contact.id);
    if (res.success) {
      setMessages(res.data || []);
    }
    if (forceLoad) setLoadingMessages(false);
  };

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(true);
      const interval = setInterval(() => fetchMessages(false), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedContact]);

  const prevMsgLength = useRef(0);
  const prevContactId = useRef(null);

  useEffect(() => {
    const isNewContact = prevContactId.current !== selectedContact?.id;
    const hasNewMessages = messages.length > prevMsgLength.current;

    if (messagesEndRef.current && (isNewContact || hasNewMessages)) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    prevMsgLength.current = messages.length;
    prevContactId.current = selectedContact?.id;
  }, [messages, selectedContact]);

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

    const res = await sendMessage(selectedContact.id, tempMsg.content);
    if (res.success) {
      fetchMessages(false);
      fetchContacts();
    } else {
      fetchMessages(false);
    }
  };

  // New Chat handlers
  const openNewChat = async () => {
    setShowNewChat(true);
    setLoadingAvailable(true);
    setNewChatSearch("");
    const res = await getAvailableContacts();
    if (res.success) {
      setAvailableContacts(res.data || []);
    }
    setLoadingAvailable(false);
  };

  const startChatWith = (contact) => {
    setSelectedContact({
      id: contact.id,
      name: contact.name,
      role: contact.role
    });
    setShowNewChat(false);
    setMessages([]);
  };

  const filteredAvailable = availableContacts.filter(c =>
    c.name.toLowerCase().includes(newChatSearch.toLowerCase())
  );

  // Sidebar
  const getSidebar = () => {
    if (user?.role === "barber") return <BarberSidebar activePage="Message" />;
    if (user?.role === "salon") return <SalonSidebar activePage="Message" />;
    return <CustomerSidebar activePage="Message" />;
  };

  // Bottom nav
  const getBottomNav = () => {
    if (user?.role === "barber") {
      return (
        <nav className="bottom-nav">
          <Link to="/barber-home" className="nav-item"><i className="fas fa-home"></i><span>Home</span></Link>
          <Link to="/barber-dashboard" className="nav-item"><i className="fas fa-chart-bar"></i><span>Dashboard</span></Link>
          <Link to="/message" className="nav-item active"><i className="fas fa-comments"></i><span>Message</span></Link>
          <Link to="/barber-OwnProfile" className="nav-item"><i className="fas fa-user"></i><span>Profile</span></Link>
        </nav>
      );
    }
    return (
      <nav className="bottom-nav">
        <Link to="/home" className="nav-item"><i className="fas fa-home"></i><span>Home</span></Link>
        <Link to="/customer-search" className="nav-item"><i className="fas fa-search"></i><span>Search</span></Link>
        <Link to="/favourites" className="nav-item"><i className="fas fa-heart"></i><span>Favourites</span></Link>
        <Link to="/message" className="nav-item active"><i className="fas fa-comments"></i><span>Message</span></Link>
        <Link to="/customer-profile" className="nav-item"><i className="fas fa-user"></i><span>Profile</span></Link>
      </nav>
    );
  };

  return (
    <div className="app-layout" style={{ height: "100vh", overflow: "hidden" }}>
      {getSidebar()}

      <div className="main-content" style={{ display: "flex", flexDirection: "column", height: "100vh", padding: 0 }}>
        {/* Header */}
        <header style={{
          padding: "1rem 2rem",
          borderBottom: "1px solid var(--border-deep)",
          backgroundColor: "var(--bg-elevated)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10
        }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem", color: "var(--text-on-accent)", fontFamily: "Poppins, sans-serif" }}>Messages</h1>
          <button
            onClick={openNewChat}
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              backgroundColor: "var(--color-accent)",
              color: "var(--text-on-btn)",
              border: "none",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "opacity 0.2s"
            }}
          >
            <i className="fas fa-plus"></i> New Chat
          </button>
        </header>

        <div style={{ 
          display: "flex", 
          flex: 1, 
          overflow: "hidden",
          margin: isMobile ? "0" : "1.5rem",
          border: isMobile ? "none" : "1px solid var(--border-default)",
          borderRadius: isMobile ? "0" : "20px",
          boxShadow: isMobile ? "none" : "var(--shadow-card)",
          backgroundColor: "var(--bg-card)"
        }}>
          {/* ─── Contacts Sidebar ─── */}
          <div style={{
            width: isMobile ? "100%" : "350px",
            minWidth: isMobile ? "100%" : "280px",
            borderRight: "1px solid var(--border-deep)",
            backgroundColor: "var(--bg-card)",
            display: isMobile && selectedContact ? "none" : "flex",
            flexDirection: "column",
            overflowY: "auto"
          }}>
            {loadingContacts ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-dim)" }}>
                <i className="fas fa-spinner fa-spin"></i> Loading...
              </div>
            ) : contacts.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-dim)", fontFamily: "Poppins, sans-serif" }}>
                <i className="fas fa-comments" style={{ fontSize: "2.5rem", marginBottom: "1rem", display: "block", opacity: 0.3 }}></i>
                <p style={{ marginBottom: "1rem" }}>No conversations yet.</p>
                <button
                  onClick={openNewChat}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    backgroundColor: "var(--color-accent)",
                    color: "var(--text-on-btn)",
                    border: "none",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Start a Chat
                </button>
              </div>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  style={{
                    padding: "1rem 1.2rem",
                    borderBottom: "1px solid var(--border-deep)",
                    cursor: "pointer",
                    backgroundColor: selectedContact?.id === contact.id ? "rgba(255,87,34,0.08)" : "transparent",
                    borderLeft: selectedContact?.id === contact.id ? "3px solid var(--color-accent)" : "3px solid transparent",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* Avatar */}
                    <div style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-accent)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "16px",
                      flexShrink: 0,
                      fontFamily: "Poppins, sans-serif"
                    }}>
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ margin: 0, color: "var(--text-on-accent)", fontSize: "14px", fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>
                          {contact.name}
                        </h4>
                        {contact.last_message && (
                          <span style={{ fontSize: "0.7rem", color: "var(--text-dim)", flexShrink: 0 }}>
                            {new Date(contact.last_message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                        {contact.last_message && (
                          <p style={{
                            margin: 0,
                            fontSize: "12px",
                            color: contact.unread_count > 0 ? "var(--text-on-accent)" : "var(--text-dim)",
                            fontWeight: contact.unread_count > 0 ? "bold" : "normal",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            flex: 1,
                            fontFamily: "Poppins, sans-serif"
                          }}>
                            {contact.last_message.is_mine ? "You: " : ""}{contact.last_message.content}
                          </p>
                        )}
                        {contact.unread_count > 0 && (
                          <span style={{
                            backgroundColor: "var(--color-accent)",
                            color: "white",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            fontWeight: "bold",
                            flexShrink: 0,
                            marginLeft: "8px"
                          }}>
                            {contact.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ─── Chat Area ─── */}
          <div style={{ flex: 1, display: isMobile && !selectedContact ? "none" : "flex", flexDirection: "column", backgroundColor: "var(--bg-base)" }}>
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div style={{
                  padding: "1rem 2rem",
                  backgroundColor: "var(--bg-card)",
                  borderBottom: "1px solid var(--border-deep)",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem"
                }}>
                  {isMobile && (
                    <button 
                      onClick={() => setSelectedContact(null)}
                      style={{
                        background: "none", border: "none", color: "var(--text-on-accent)",
                        fontSize: "18px", cursor: "pointer", marginRight: "8px"
                      }}>
                      <i className="fas fa-arrow-left"></i>
                    </button>
                  )}
                  <div style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-accent)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "16px",
                    fontFamily: "Poppins, sans-serif"
                  }}>
                    {selectedContact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: "var(--text-on-accent)", fontFamily: "Poppins, sans-serif", fontSize: "15px" }}>{selectedContact.name}</h3>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-dim)", textTransform: "capitalize", fontFamily: "Poppins, sans-serif" }}>{selectedContact.role}</p>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 2rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                  {loadingMessages ? (
                    <div style={{ textAlign: "center", color: "var(--text-dim)", margin: "auto" }}>
                      <i className="fas fa-spinner fa-spin" style={{ fontSize: "1.5rem" }}></i>
                      <p>Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "var(--text-dim)", margin: "auto", fontFamily: "Poppins, sans-serif" }}>
                      <i className="fas fa-paper-plane" style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3, display: "block" }}></i>
                      <p>Send a message to start the conversation!</p>
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
                          backgroundColor: msg.is_mine ? "var(--color-accent)" : "var(--bg-card)",
                          color: msg.is_mine ? "white" : "var(--text-on-accent)",
                          padding: "0.7rem 1.1rem",
                          borderRadius: "18px",
                          borderBottomRightRadius: msg.is_mine ? "4px" : "18px",
                          borderBottomLeftRadius: !msg.is_mine ? "4px" : "18px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                          fontSize: "14px",
                          lineHeight: "1.4",
                          fontFamily: "Poppins, sans-serif"
                        }}>
                          {msg.content}
                        </div>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-dim)", marginTop: "0.25rem", fontFamily: "Poppins, sans-serif" }}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{ padding: "1rem 2rem", backgroundColor: "var(--bg-card)", borderTop: "1px solid var(--border-deep)" }}>
                  <form onSubmit={handleSend} style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type your message..."
                      style={{
                        flex: 1,
                        padding: "0.9rem 1.2rem",
                        borderRadius: "30px",
                        border: "1px solid var(--border-deep)",
                        backgroundColor: "var(--bg-base)",
                        color: "var(--text-on-accent)",
                        outline: "none",
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "14px"
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "50%",
                        backgroundColor: inputText.trim() ? "var(--color-accent)" : "var(--border-deep)",
                        color: "white",
                        border: "none",
                        cursor: inputText.trim() ? "pointer" : "default",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background 0.2s",
                        fontSize: "16px"
                      }}
                    >
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontFamily: "Poppins, sans-serif" }}>
                <i className="fas fa-comments" style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.3 }}></i>
                <h2 style={{ color: "var(--text-on-accent)", marginBottom: "0.5rem" }}>Your Messages</h2>
                <p style={{ marginBottom: "1.5rem" }}>Select a conversation or start a new one.</p>
                <button
                  onClick={openNewChat}
                  style={{
                    padding: "12px 28px",
                    borderRadius: "12px",
                    backgroundColor: "var(--color-accent)",
                    color: "var(--text-on-btn)",
                    border: "none",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <i className="fas fa-plus"></i> Start New Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Nav for Mobile */}
      {getBottomNav()}

      {/* ─── New Chat Modal ─── */}
      {showNewChat && (
        <div
          onClick={() => setShowNewChat(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-card)",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "480px",
              maxHeight: "70vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
              overflow: "hidden"
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: "1.2rem 1.5rem",
              borderBottom: "1px solid var(--border-deep)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <h3 style={{ margin: 0, color: "var(--text-on-accent)", fontFamily: "Poppins, sans-serif", fontSize: "18px" }}>
                Start New Chat
              </h3>
              <button
                onClick={() => setShowNewChat(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-dim)",
                  fontSize: "18px",
                  cursor: "pointer",
                  padding: "4px"
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: "1rem 1.5rem 0" }}>
              <div style={{ position: "relative" }}>
                <i className="fas fa-search" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)", fontSize: "13px" }}></i>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={newChatSearch}
                  onChange={(e) => setNewChatSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 12px 12px 40px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-deep)",
                    backgroundColor: "var(--bg-base)",
                    color: "var(--text-on-accent)",
                    outline: "none",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "14px"
                  }}
                />
              </div>
            </div>

            {/* Contact List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
              {loadingAvailable ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-dim)" }}>
                  <i className="fas fa-spinner fa-spin"></i> Loading...
                </div>
              ) : filteredAvailable.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-dim)", fontFamily: "Poppins, sans-serif" }}>
                  <p>No contacts found.</p>
                </div>
              ) : (
                filteredAvailable.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => startChatWith(contact)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      marginBottom: "4px"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,87,34,0.08)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      flexShrink: 0,
                      backgroundColor: "var(--color-accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {contact.profile_image ? (
                        <img src={contact.profile_image} alt={contact.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ color: "white", fontWeight: "bold", fontSize: "16px", fontFamily: "Poppins, sans-serif" }}>
                          {contact.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, color: "var(--text-on-accent)", fontSize: "14px", fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>
                        {contact.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: "12px", color: "var(--text-dim)", textTransform: "capitalize", fontFamily: "Poppins, sans-serif" }}>
                        {contact.role}
                        {contact.location && ` · ${contact.location}`}
                      </p>
                    </div>
                    <i className="fas fa-comment-dots" style={{ color: "var(--color-accent)", fontSize: "16px" }}></i>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}