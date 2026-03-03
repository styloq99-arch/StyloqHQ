import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock Data for Search Results
const BARBERS = [
  {
    id: 1,
    name: "S.S.K. Perera",
    salon: "Royal Cuts Studio",
    rating: 4.8,
    reviews: 120,
    distance: "1.2 km",
    price: "LKR 1500",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 2,
    name: "D.H.Pathirana",
    salon: "Urban Style Lounge",
    rating: 4.5,
    reviews: 85,
    distance: "3.5 km",
    price: "LKR 1200",
    avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 3,
    name: "Kamal Jayasinghe",
    salon: "The Gentleman's Bar",
    rating: 4.9,
    reviews: 210,
    distance: "0.8 km",
    price: "LKR 2000",
    avatar: "https://randomuser.me/api/portraits/men/85.jpg",
    image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 4,
    name: "Nimal Silva",
    salon: "Quick Clips",
    rating: 4.2,
    reviews: 40,
    distance: "5.0 km",
    price: "LKR 800",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    image: "https://images.unsplash.com/photo-1503951914875-452162b7f306?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  }
];

const CATEGORIES = ["All", "Top Rated", "Near Me", "Price Low to High", "Beard Specialist"];


export default function CustomerSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Filter Logic
  const filteredBarbers = BARBERS.filter(barber => {
    const matchesSearch = barber.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          barber.salon.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Basic category filtering logic
    const matchesCategory = activeCategory === "All" ? true :
                           activeCategory === "Top Rated" ? barber.rating >= 4.8 :
                           true; // Simplified for demo
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app-layout">
      
      {/* --- 1. DESKTOP SIDEBAR --- */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <h1 className="brand-title" style={{fontSize : '40px'}}>StyloQ</h1>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/customer-home" className="sidebar-link">
            <i className="fas fa-home"></i> <span>Home</span>
          </Link>
          <Link to="/customer-search" className="sidebar-link active">
            <i className="fas fa-search"></i> <span>Search</span>
          </Link>
          <Link to="/favourites" className="sidebar-link">
            <i className="fas fa-heart"></i> <span>Favourites</span>
          </Link>
          <Link to="/profile" className="sidebar-link">
            <i className="fas fa-user"></i> <span>Profile</span>
          </Link>
        </nav>

        <div className="sidebar-user">
          <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="User" className="user-avatar" />
          <div className="user-info">
            <p className="user-name">John Doe</p>
            <p className="user-status">Customer</p>
          </div>
        </div>
      </aside>


      {/* --- 2. MAIN CONTENT AREA --- */}
      <div className="main-content">
        
        {/* --- Header (Identical to Home) --- */}
        <header className="customer-barber-header">
          <div className="header-top">
            <div className="mobile-brandContent">
              <h1 className="mobile-brand">StyloQ</h1>
            </div>
            <div className="notification-bell">
              <i className="far fa-bell"></i>
              <span className="badge">3</span>
            </div>
          </div>
        </header>

        {/* --- Scrollable Page Content --- */}
        <div className="page-body">
          
          {/* Search Bar Section */}
          <section className="search-section">
            <div className="search-bar-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input 
                type="text" 
                className="search-input-field" 
                placeholder="Search barbers, salons, or styles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </section>

          {/* Categories Section */}
          <section className="categories-section">
            <div className="categories-scroll">
              {CATEGORIES.map((cat) => (
                <button 
                  key={cat} 
                  className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

        </div>
      </div>


      {/* --- 3. MOBILE BOTTOM NAV  --- */}
      <nav className="bottom-nav">
        <Link to="/customer-home" className="nav-item">
          <i className="fas fa-home"></i>
          <span>Home</span>
        </Link>
        <Link to="/customer-search" className="nav-item active">
          <i className="fas fa-search"></i>
          <span>Search</span>
        </Link>
        <Link to="/favourites" className="nav-item">
          <i className="fas fa-heart"></i>
          <span>Favourites</span>
        </Link>
        <Link to="/profile" className="nav-item">
          <i className="fas fa-user"></i>
          <span>Profile</span>
        </Link>
      </nav>

    </div>
  );
}