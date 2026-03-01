import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock Data
const INITIAL_POSTS = [
  {
    id: 1,
    name: "S.S.K. Perera",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    caption: "Another transformation in the chair 2 days ago",
    image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 124,
    comments: 15
  },
  {
    id: 2,
    name: "D.H.Pathirana",
    rating: 4.5,
    avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    caption: "Classic fade for the weekend. 1 day ago",
    image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 89,
    comments: 8
  }
];


export default function CustomerHome() {

  return (
    <div className="app-layout">

      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <h1 className="brand-title" style={{ fontSize: '40px' }}>StyloQ</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/customer-home" className="sidebar-link active"><i className="fas fa-home"></i> <span>Home</span></Link>
          <Link to="/customer-search" className="sidebar-link"><i className="fas fa-search"></i> <span>Search</span></Link>
          <Link to="/favourites" className="sidebar-link"><i className="fas fa-heart"></i> <span>Favourites</span></Link>
          <Link to="/profile" className="sidebar-link"><i className="fas fa-user"></i> <span>Profile</span></Link>
        </nav>
        <div className="sidebar-user">
          <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="User" className="user-avatar" />
          <div className="user-info">
            <p className="user-name">John Doe</p>
            <p className="user-status">Customer</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="customer-barber-header" style={{ paddingBottom: '5px' }}>
          <div className="header-top">
            <div className="mobile-brandContent">
              <h1 className="mobile-brand">StyloQ</h1>
            </div>
          </div>
        </header>

        <div className="page-body">
          <section>
            <div className="feed-container">
              {INITIAL_POSTS.map((post) => {
                
                return (
                  <div key={post.id} className="feed-card">

                    {/* Card Header */}
                    <div className="card-header">
                      <div className="header-left">
                        <img src={post.avatar} alt="Avatar" className="profile-avatar" />
                        <div className="header-text">
                          <h4 className="barber-name">{post.name}</h4>
                          <div className="stars-container">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`fas fa-star ${i < post.rating ? 'filled' : 'empty'}`}></i>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Link to="/barber-profile" className="btn btn-secondary"
                        style={{ width: '40%', height: '45px', marginTop: '2rem', borderRadius: '20px' }}>
                        View Profile
                      </Link>
                    </div>

                    {/* Image */}
                    <div className="image-container">
                      <img src={post.image} alt="Haircut" className="feed-image" />
                    </div>

                    {/* Caption */}
                    <div className="card-content">
                      <p className="caption-text">{post.caption}</p>
                    </div>

                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        <Link to="/customer-home" className="nav-item active"><i className="fas fa-home"></i><span>Home</span></Link>
        <Link to="/customer-search" className="nav-item"><i className="fas fa-search"></i><span>Search</span></Link>
        <Link to="/favourites" className="nav-item"><i className="fas fa-heart"></i><span>Favourites</span></Link>
        <Link to="/profile" className="nav-item"><i className="fas fa-user"></i><span>Profile</span></Link>
      </nav>

    </div>
  );
}
