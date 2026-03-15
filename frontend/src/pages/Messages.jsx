import React, { useState } from 'react';
import { Link } from 'react-router-dom';

//Mock contacts for now..
const CONTACTS = {
  yourNote: ["S.S.K.Perera", "G.D.H.Thejan", "T.T.H.Rehan", "W.S.R.Perera"],
  messages: ["S.S.K.Perera", "G.D.H.Thejan", "T.T.H.Rehan", "W.S.R.Perera", "R.R.T.Alwis", "T.E.R.Sahan", "A.D.D.Mohan"]
};

export default function Messages() {
  const [activeTab, setActiveTab] = useState('messages');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = CONTACTS[activeTab].filter(contact =>
    contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

 return (
    <div className="app-layout">


      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <h1 className="brand-title" style={{ fontSize: '40px' }}>StyloQ</h1>
        </div>

        <nav className="sidebar-nav">
          <Link to="/customer-home" className="sidebar-link">
            <i className="fas fa-home"></i> <span>Home</span>
          </Link>
          <Link to="/customer-search" className="sidebar-link">
            <i className="fas fa-search"></i> <span>Search</span>
          </Link>
          <Link to="/messages" className="sidebar-link active">
            <i className="fas fa-comment"></i> <span>Messages</span>
          </Link>
          <Link to="/profile" className="sidebar-link">
            <i className="fas fa-user"></i> <span>Profile</span>
          </Link>
        </nav>

        <div className="sidebar-user">
          <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="User" className="user-avatar" />
          <div className="user-info">
            <p className="user-name">ruwan_d</p>
            <p className="user-status">Online</p>
          </div>
        </div>
      </aside>


      <div className="main-content" style={{ backgroundColor: 'var(--bg-base)' }}>


        <header className="customer-barber-header" style={{ paddingBottom: '10px' }}>
          <div className="header-top">
            <div className="mobile-brandContent">
              <h1 className="mobile-brand">StyloQ</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button className="messages-icon-btn">
                <i className="fas fa-search"></i>
              </button>
              <button className="messages-icon-btn">
                <i className="fas fa-robot"></i>
              </button>
            </div>
          </div>

          <div style={{ padding: '10px 0 5px 0' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 700, margin: 0 }}>
              ruwan_d
            </h2>
          </div>


          <div style={{ display: 'flex', gap: '20px', marginTop: '15px', borderBottom: '1px solid var(--border-deep)' }}>
            <button
              onClick={() => setActiveTab('yourNote')}
              className={`messages-tab ${activeTab === 'yourNote' ? 'active' : ''}`}
            >
              Your Note
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`messages-tab ${activeTab === 'messages' ? 'active' : ''}`}
            >
              Messages
            </button>
          </div>


          <div style={{ marginTop: '15px', position: 'relative' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }}></i>
            <input
              type="text"
              placeholder={`Search ${activeTab === 'yourNote' ? 'notes' : 'messages'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="messages-search-input"
            />
          </div>
        </header>


        <div className="page-body">
          <section style={{ padding: '0 24px' }}>
            <div className="messages-contacts-list">
              {filteredContacts.map((contact, index) => (
                <div
                  key={index}
                  className="messages-contact-item"
                  onClick={() => console.log(`Open chat with ${contact}`)}
                >
                  <div className="messages-contact-avatar">
                    {contact.charAt(0)}
                  </div>

                  <div className="messages-contact-info">
                    <p className="messages-contact-name">{contact}</p>
                    <p className="messages-contact-preview">
                      {activeTab === 'yourNote' ? 'Note • ' : ''}Last message preview...
                    </p>
                  </div>

                  <div className="messages-contact-time">
                    {index % 2 === 0 ? '2m' : '1h'}
                  </div>
                </div>
              ))}

              {filteredContacts.length === 0 && (
                <div className="messages-no-results">
                  <i className="fas fa-search"></i>
                  <p>No contacts found</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>


      <nav className="bottom-nav">
        <Link to="/favourite" className="nav-item">
          <i className="fas fa-heart"></i>
          <span>Favorite</span>
        </Link>
        <Link to="/customer-home" className="nav-item">
          <i className="fas fa-home"></i>
          <span>Home</span>
        </Link>
        <Link to="/customer-search" className="nav-item">
          <i className="fas fa-search"></i>
          <span>Search</span>
        </Link>
        <Link to="/profile" className="nav-item active">
          <i className="fas fa-user"></i>
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}