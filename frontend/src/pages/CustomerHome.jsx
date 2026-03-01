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

  const [postStates, setPostStates] = useState(
    Object.fromEntries(
      INITIAL_POSTS.map(post => [
        post.id,
        {
          liked: false,
          likes: post.likes,
        }
      ])
    )
  );

  const handleLike = (postId) => {
    setPostStates(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        liked: !prev[postId].liked,
        likes: prev[postId].liked ? prev[postId].likes - 1 : prev[postId].likes + 1,
      }
    }));
  };

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
                const state = postStates[post.id];
                
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

                    {/* Like count */}
                    {state.likes > 0 && (
                      <div style={{ padding: '8px 16px 0', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {state.likes} {state.likes === 1 ? 'like' : 'likes'}
                      </div>
                    )}

                    {/* Caption */}
                    <div className="card-content">
                      <p className="caption-text">{post.caption}</p>
                    </div>

                    {/* Actions */}
                    <div className="card-actions">
                      <div className="action-left">

                        {/* Like */}
                        <button onClick={() => handleLike(post.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          aria-label={state.liked ? 'Unlike' : 'Like'}>
                          <i className={`${state.liked ? 'fas' : 'far'} fa-heart action-icon`}
                            style={{ color: state.liked ? 'var(--color-accent)' : undefined }}></i>
                        </button>
                      </div>

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
