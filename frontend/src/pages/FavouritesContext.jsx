import React, { createContext, useContext, useState } from 'react';

const FavouritesContext = createContext(null);

export function FavouritesProvider({ children }) {
  const [favourites, setFavourites] = useState({}); // { [postId]: postObject }

  const toggleFavourite = (post) => {
    setFavourites(prev => {
      if (prev[post.id]) {
        const next = { ...prev };
        delete next[post.id];
        return next;
      }
      return { ...prev, [post.id]: post };
    });
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
