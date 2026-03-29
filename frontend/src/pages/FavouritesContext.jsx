import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiGet, apiPost } from '../utils/api';

const FavouritesContext = createContext(null);

export function FavouritesProvider({ children }) {
  const [favourites, setFavourites] = useState({}); // { [postId]: postObject }

  // Fetch saved posts from backend on mount
  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await apiGet('/customers/saved-posts');
        if (res.success && Array.isArray(res.data)) {
          const map = {};
          res.data.forEach(post => { 
            // Normalize so it matches CustomerHome feed format
            map[post.id] = {
              ...post,
              barberName: post.barber_name || post.barberName || "Unknown",
              imageUrl: post.image_url || post.imageUrl || "",
              commentsCount: post.comments_count || post.commentsCount || 0,
            }; 
          });
          setFavourites(map);
        }
      } catch (_) { /* use local state */ }
    };
    fetchSaved();
  }, []);

  const toggleFavourite = async (post) => {
    setFavourites(prev => {
      if (prev[post.id]) {
        const next = { ...prev };
        delete next[post.id];
        return next;
      }
      return { ...prev, [post.id]: post };
    });
    // Sync with backend
    try {
      await apiPost(`/feed/${post.id}/save`);
    } catch (_) { /* UI already updated */ }
  };

  const isFavourite = (postId) => Boolean(favourites[postId]);

  const favouriteList = Object.values(favourites);

  return (
    <FavouritesContext.Provider value={{ favourites, favouriteList, toggleFavourite, isFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error('useFavourites must be used inside FavouritesProvider');
  return ctx;
}
