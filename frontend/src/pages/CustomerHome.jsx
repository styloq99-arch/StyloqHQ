import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFavourites } from "./FavouritesContext";
import CustomerSidebar from "../Components/CustomerSidebar";
import {
  getFeed,
  toggleLike,
  addComment,
  toggleSave,
  deletePost,
  getComments,
} from "../api/feedApi";

export default function CustomerHome() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toggleFavourite, isFavourite } = useFavourites();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  // Posts and pagination state
  const [posts, setPosts] = useState([]);
  const [postStates, setPostStates] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(3);
  const [shareToast, setShareToast] = useState(null);
  const [bookmarkToast, setBookmarkToast] = useState(null);

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH FEED POSTS ON MOUNT AND PAGINATION
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getFeed({ page, limit: 5 });

        // getFeed returns { success, data, message } from the API helper
        if (!response.success) {
          setError(response.message || "Failed to load feed");
          return;
        }

        const rawPosts = Array.isArray(response.data) ? response.data : [];

        // DEBUG: log raw backend data for liked/saved
        console.log('[DEBUG] Raw feed data:', rawPosts.map(p => ({ id: p.id, likes: p.likes, liked: p.liked, saved: p.saved })));

        // Normalize backend snake_case to camelCase
        const newPosts = rawPosts.map((p) => ({
          id: p.id,
          barber_id: p.barber_id,
          barberName: p.barberName || p.barber_name || "Unknown",
          imageUrl: p.imageUrl || p.image_url || "",
          caption: p.caption || "",
          likes: p.likes || 0,
          commentsCount: p.commentsCount ?? p.comments_count ?? 0,
          liked: p.liked || false,
          saved: p.saved || false,
          createdAt: p.createdAt || p.created_at || "",
        }));

        if (page === 1) {
          setPosts(newPosts);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
        }

        const newStates = {};
        newPosts.forEach((post) => {
          // Always update liked/saved status from backend, even if post exists
          newStates[post.id] = {
            liked: post.liked || false,
            likes: post.likes || 0,
            commentsCount: post.commentsCount || 0,
            saved: post.saved || false,
            showComments: postStates[post.id]?.showComments || false,
            commentText: postStates[post.id]?.commentText || "",
            commentList: postStates[post.id]?.commentList || [],
          };
        });

        if (Object.keys(newStates).length > 0) {
          setPostStates((prev) => ({ ...prev, ...newStates }));
        }

        setHasMore(newPosts.length === 5);
      } catch (err) {
        setError(err.message || "Failed to load feed");
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [page]);

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS FOR INTERACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const handleLike = async (postId) => {
    try {
      const currentState = postStates[postId];
      const isLiked = currentState.liked;

      // Optimistic update
      setPostStates(prev => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          liked: !isLiked,
          likes: isLiked ? prev[postId].likes - 1 : prev[postId].likes + 1,
        }
      }));

      const response = await toggleLike(postId);
      console.log('Like API response:', response);

      // Revert on error
      if (!response.success) {
        console.error('Like failed:', response.message);
        setPostStates(prev => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            liked: isLiked,
            likes: isLiked ? prev[postId].likes + 1 : prev[postId].likes - 1,
          }
        }));
      }

    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleBookmark = async (post) => {
    try {
      const wasBookmarked = isFavourite(post.id);
      const wasPostSaved = postStates[post.id]?.saved;

      // Optimistic updates (both UI and local state)
      toggleFavourite(post);
      setPostStates((prev) => ({
        ...prev,
        [post.id]: {
          ...prev[post.id],
          saved: !wasPostSaved,
        },
      }));

      // API call
      const response = await toggleSave(post.id);
      console.log('Save API response:', response);

      if (!response.success) {
        console.error('Save failed:', response.message);
        // Revert on error
        toggleFavourite(post);
        setPostStates((prev) => ({
          ...prev,
          [post.id]: {
            ...prev[post.id],
            saved: wasPostSaved,
          },
        }));
      }

      setBookmarkToast(
        wasBookmarked ? "Removed from Favourites" : "Saved to Favourites!",
      );
      setTimeout(() => setBookmarkToast(null), 2200);
    } catch (err) {
      console.error("Error saving post:", err);
    }
  };

  const handleToggleComments = async (postId) => {
    const isOpening = !postStates[postId]?.showComments;

    setPostStates((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], showComments: !prev[postId].showComments },
    }));

    // Fetch comments from backend when opening
    if (isOpening) {
      try {
        const response = await getComments(postId);
        if (response.success && Array.isArray(response.data)) {
          const comments = response.data.map((c) => ({
            id: c.id,
            author: c.username || "Unknown",
            text: c.content,
          }));
          setPostStates((prev) => ({
            ...prev,
            [postId]: { ...prev[postId], commentList: comments },
          }));
        }
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    }
  };

  const handleCommentChange = (postId, value) => {
    setPostStates((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], commentText: value },
    }));
  };

  const handleCommentSubmit = async (postId) => {
    const text = postStates[postId].commentText.trim();
    if (!text) return;

    try {
      // Optimistic update
      setPostStates((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          commentText: "",
          commentsCount: prev[postId].commentsCount + 1,
          commentList: [
            ...prev[postId].commentList,
            {
              id: Date.now(),
              author: "You",
              text,
            },
          ],
        },
      }));

      // API call - backend expects { comment: "text" }
      const response = await addComment(postId, text);

      if (response.success && response.data) {
        // Update with real comment data from backend
        setPostStates((prev) => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            commentList: [
              ...prev[postId].commentList.slice(0, -1),
              {
                id: response.data.id,
                author: response.data.username,
                text: response.data.content,
              },
            ],
          },
        }));
      }

      if (!response.success) {
        // Revert on error
        setPostStates((prev) => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            commentText: text,
            commentsCount: prev[postId].commentsCount - 1,
            commentList: prev[postId].commentList.slice(0, -1),
          },
        }));
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      // Revert on error
      setPostStates((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          commentText: text,
          commentsCount: prev[postId].commentsCount - 1,
          commentList: prev[postId].commentList.slice(0, -1),
        },
      }));
    }
  };

  const handleShare = (postId, postName) => {
    const url = `${window.location.origin}/post/${postId}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => { });
    setShareToast(`Link to ${postName}'s post copied!`);
    setTimeout(() => setShareToast(null), 2500);
  };

  const handleDeletePost = async (postId) => {
    try {
      if (!window.confirm("Are you sure you want to delete this post?")) return;

      // Optimistic update
      setPosts((prev) => prev.filter((p) => p.id !== postId));

      // API call
      const response = await deletePost(postId);

      if (!response.success) {
        // Revert on error - fetch posts again
        const feedResponse = await getFeed({ page: 1, limit: 5 });
        if (feedResponse.success) {
          setPosts(Array.isArray(feedResponse.data) ? feedResponse.data : []);
          setPostStates({});
          const newStates = {};
          feedResponse.data.forEach((post) => {
            newStates[post.id] = {
              liked: post.liked || false,
              likes: post.likes || 0,
              commentsCount: post.commentsCount || 0,
              saved: post.saved || false,
              showComments: false,
              commentText: "",
              commentList: [],
            };
          });
          setPostStates(newStates);
        }
      }
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleNotifOpen = () => {
    setNotifOpen((prev) => !prev);
    if (!notifOpen) setNotifCount(0);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="app-layout">
      {/* Toasts */}
      {shareToast && (
        <div className="cp-toast" style={{ bottom: "80px", zIndex: 9999 }}>
          <i className="fas fa-check-circle"></i> {shareToast}
        </div>
      )}
      {bookmarkToast && (
        <div
          className="cp-toast"
          style={{
            bottom: "80px",
            zIndex: 9999,
            background: bookmarkToast.startsWith("Removed")
              ? "#555"
              : "var(--color-accent)",
          }}
        >
          <i
            className={`fas ${bookmarkToast.startsWith("Removed") ? "fa-bookmark" : "fa-bookmark"}`}
          ></i>
          {bookmarkToast}
          {!bookmarkToast.startsWith("Removed") && (
            <Link
              to="/favourites"
              style={{
                color: "#fff",
                marginLeft: "8px",
                fontWeight: 700,
                textDecoration: "underline",
              }}
            >
              View
            </Link>
          )}
        </div>
      )}

      {/* Notification Dropdown */}
      {notifOpen && (
        <div
          onClick={() => setNotifOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 150,
          }}
        />
      )}
      {notifOpen && (
        <div
          style={{
            position: "fixed",
            top: "70px",
            right: "16px",
            zIndex: 200,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-faint)",
            borderRadius: "16px",
            width: "300px",
            boxShadow: "var(--shadow-modal)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--border-deep)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "var(--text-primary)",
                fontWeight: 700,
                fontSize: "15px",
              }}
            >
              Notifications
            </span>
            <button
              onClick={() => setNotifOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-faint)",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          {notifCount > 0 ? (
            <div style={{ padding: "12px 16px" }}>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  margin: 0,
                }}
              >
                You have {notifCount} new notifications
              </p>
            </div>
          ) : (
            <div
              style={{
                padding: "12px 16px",
                textAlign: "center",
                color: "var(--text-dim)",
                fontSize: "13px",
              }}
            >
              No new notifications
            </div>
          )}
        </div>
      )}

      {/* Desktop Sidebar */}
      <CustomerSidebar activePage="Home" />

      {/* Main Content */}
      <div className="main-content">
        <header
          className="customer-barber-header"
          style={{ paddingBottom: "5px" }}
        >
          <div className="header-top">
            <div className="mobile-brandContent">
              <h1 className="mobile-brand">StyloQ</h1>
            </div>
            <button
              className="notification-bell"
              onClick={handleNotifOpen}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
              aria-label="Notifications"
            >
              <i className="far fa-bell"></i>
              {notifCount > 0 && <span className="badge">{notifCount}</span>}
            </button>
          </div>
        </header>

        <div className="page-body">
          <section>
            <div className="feed-container">
              {/* AI Recommendation Promotion Banner */}
              <div style={{
                background: "linear-gradient(135deg, var(--color-accent) 0%, #ff8a65 100%)",
                borderRadius: "16px",
                padding: "1.5rem 2rem",
                color: "white",
                marginBottom: "2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 4px 15px rgba(255, 87, 34, 0.3)"
              }}>
                <div>
                  <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.4rem", fontWeight: 700, color: "white" }}>
                    <i className="fas fa-magic" style={{ marginRight: "0.5rem" }}></i>
                    Try the New AI Hairstylist
                  </h3>
                  <p style={{ margin: 0, opacity: 0.9, fontSize: "1rem" }}>
                    Upload your photo and let our AI recommend the perfect haircut for your face shape!
                  </p>
                </div>
                <Link
                  to="/ai-recommendation"
                  style={{
                    background: "white",
                    color: "var(--color-accent)",
                    padding: "0.8rem 1.5rem",
                    borderRadius: "30px",
                    fontWeight: 700,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    transition: "transform 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  Try Now
                </Link>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  style={{
                    padding: "1rem",
                    background: "#fee",
                    color: "#c00",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    border: "1px solid #fcc",
                  }}
                >
                  <i className="fas fa-exclamation-circle"></i> {error}
                </div>
              )}

              {/* Loading State */}
              {loading && posts.length === 0 && (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  <i
                    className="fas fa-spinner fa-spin"
                    style={{ marginRight: "0.5rem" }}
                  ></i>
                  Loading feed...
                </div>
              )}

              {/* No Posts */}
              {!loading && posts.length === 0 && !error && (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  <i
                    className="fas fa-inbox"
                    style={{
                      fontSize: "2rem",
                      marginBottom: "1rem",
                      display: "block",
                    }}
                  ></i>
                  No posts yet. Follow barbers to see their latest posts!
                </div>
              )}

              {/* Posts List */}
              {posts.map((post) => {
                const state = postStates[post.id];
                const bookmarked = isFavourite(post.id);

                if (!state) return null; // Skip if state not yet initialized

                return (
                  <div key={post.id} className="feed-card">
                    {/* Card Header */}
                    <div className="card-header">
                      <div className="header-left">
                        <img
                          src={post.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23333'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='20'%3E%3F%3C/text%3E%3C/svg%3E"}
                          alt="Avatar"
                          className="profile-avatar"
                          onError={(e) => {
                            if (!e.target.dataset.fallback) {
                              e.target.dataset.fallback = '1';
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23333'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='20'%3E%3F%3C/text%3E%3C/svg%3E";
                            }
                          }}
                        />
                        <div className="header-text">
                          <h4 className="barber-name">{post.barberName}</h4>
                          <div className="stars-container">
                            {[...Array(5)].map((_, i) => (
                              <i
                                key={i}
                                className={`fas fa-star ${i < (post.rating || 5) ? "filled" : "empty"}`}
                              ></i>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/barber-profile-view/${post.barber_id}`}
                        className="btn btn-secondary"
                        style={{
                          width: "40%",
                          height: "45px",
                          marginTop: "2rem",
                          borderRadius: "20px",
                        }}
                      >
                        View Profile
                      </Link>
                    </div>

                    {/* Image */}
                    <div className="image-container">
                      <img
                        src={
                          post.imageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23222'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E"
                        }
                        alt="Post"
                        className="feed-image"
                        onError={(e) => {
                          if (!e.target.dataset.fallback) {
                            e.target.dataset.fallback = '1';
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23222'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }
                        }}
                      />
                    </div>

                    {/* Like count */}
                    {state.likes > 0 && (
                      <div
                        style={{
                          padding: "8px 16px 0",
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                          fontWeight: 600,
                        }}
                      >
                        {state.likes} {state.likes === 1 ? "like" : "likes"}
                      </div>
                    )}

                    {/* Caption */}
                    <div className="card-content">
                      <p className="caption-text">{post.caption}</p>
                      {post.createdAt && (
                        <p
                          style={{
                            fontSize: "12px",
                            color: "var(--text-dim)",
                            marginTop: "0.5rem",
                          }}
                        >
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="card-actions">
                      <div className="action-left">
                        {/* Like */}
                        <button
                          onClick={() => handleLike(post.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                          aria-label={state.liked ? "Unlike" : "Like"}
                        >
                          <i
                            className={`${state.liked ? "fas" : "far"} fa-heart action-icon`}
                            style={{
                              color: state.liked
                                ? "var(--color-accent)"
                                : undefined,
                            }}
                          ></i>
                        </button>

                        {/* Comment */}
                        <button
                          onClick={() => handleToggleComments(post.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                          aria-label="Toggle comments"
                        >
                          <i
                            className={`${state.showComments ? "fas" : "far"} fa-comment action-icon`}
                            style={{
                              color: state.showComments
                                ? "var(--color-accent)"
                                : undefined,
                            }}
                          ></i>
                        </button>

                        {/* Share */}
                        <button
                          onClick={() => handleShare(post.id, post.barberName)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                          aria-label="Share"
                        >
                          <i className="far fa-paper-plane action-icon"></i>
                        </button>
                      </div>

                      <div
                        className="action-right"
                        style={{ display: "flex", gap: "0.5rem" }}
                      >
                        {/* Bookmark → Favourites */}
                        <button
                          onClick={() => handleBookmark(post)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                          aria-label={
                            bookmarked
                              ? "Remove from favourites"
                              : "Save to favourites"
                          }
                        >
                          <i
                            className={`${bookmarked ? "fas" : "far"} fa-bookmark action-icon`}
                            style={{
                              color: bookmarked
                                ? "var(--color-accent)"
                                : undefined,
                            }}
                          ></i>
                        </button>

                        {/* Delete (if owner) */}
                        {/* Note: Backend checks if user is owner or admin */}
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                          aria-label="Delete post"
                          title="Delete post"
                        >
                          <i
                            className="far fa-trash-alt action-icon"
                            style={{ color: "#ff6b6b" }}
                          ></i>
                        </button>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {state.showComments && (
                      <div
                        style={{
                          padding: "12px 16px 4px",
                          borderTop: "1px solid var(--border-deep)",
                        }}
                      >
                        {state.commentList.length > 0 && (
                          <div
                            style={{
                              marginBottom: "10px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            {state.commentList.map((c) => (
                              <div
                                key={c.id}
                                style={{
                                  fontSize: "13px",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: 700,
                                    color: "var(--text-primary)",
                                    marginRight: "6px",
                                  }}
                                >
                                  {c.author}
                                </span>
                                {c.text}
                              </div>
                            ))}
                          </div>
                        )}
                        {state.commentList.length === 0 && (
                          <p
                            style={{
                              fontSize: "12px",
                              color: "var(--text-dim)",
                              marginBottom: "10px",
                            }}
                          >
                            {state.commentsCount} comment
                            {state.commentsCount !== 1 ? "s" : ""} — be the
                            first to reply
                          </p>
                        )}
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          <input
                            type="text"
                            placeholder="Add a comment…"
                            value={state.commentText}
                            onChange={(e) =>
                              handleCommentChange(post.id, e.target.value)
                            }
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleCommentSubmit(post.id)
                            }
                            style={{
                              flex: 1,
                              background: "var(--fill-glass-mid)",
                              border: "1px solid var(--border-default)",
                              borderRadius: "20px",
                              padding: "8px 14px",
                              color: "var(--text-primary)",
                              fontSize: "13px",
                              outline: "none",
                              fontFamily: "Poppins, sans-serif",
                            }}
                          />
                          <button
                            onClick={() => handleCommentSubmit(post.id)}
                            disabled={!state.commentText.trim()}
                            style={{
                              background: state.commentText.trim()
                                ? "var(--color-accent)"
                                : "var(--border-subtle)",
                              border: "none",
                              borderRadius: "50%",
                              width: "34px",
                              height: "34px",
                              color: "#fff",
                              cursor: state.commentText.trim()
                                ? "pointer"
                                : "default",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "background 0.2s",
                              flexShrink: 0,
                            }}
                          >
                            <i
                              className="fas fa-paper-plane"
                              style={{ fontSize: "13px" }}
                            ></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Load More Button */}
              {hasMore && posts.length > 0 && (
                <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    style={{
                      padding: "0.75rem 1.5rem",
                      background: "var(--color-accent)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "20px",
                      cursor: loading ? "default" : "pointer",
                      opacity: loading ? 0.6 : 1,
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    {loading ? "Loading..." : "Load More Posts"}
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        <Link to="/home" className="nav-item active">
          <i className="fas fa-home"></i>
          <span>Home</span>
        </Link>
        <Link to="/customer-search" className="nav-item">
          <i className="fas fa-search"></i>
          <span>Search</span>
        </Link>
        <Link to="/favourites" className="nav-item">
          <i className="fas fa-heart"></i>
          <span>Favourites</span>
        </Link>
        <Link to="/message" className="nav-item">
          <i className="fas fa-comments"></i>
          <span>Message</span>
        </Link>
        <Link to="/profile" className="nav-item">
          <i className="fas fa-user"></i>
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
