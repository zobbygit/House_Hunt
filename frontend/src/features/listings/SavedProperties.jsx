import { useEffect, useState } from "react";
import LoginHeader from "../../components/LoginHeader";
import PropertyCard from "../../components/PropertyCard";
import { API_BASE } from "../../config/api";

export default function SavedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toasts, setToasts] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  function pushToast(toast) {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 4000);
  }

  function dismissToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchFavorites() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/favorites/mine`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch saved properties");
      setProperties(data.properties || []);
    } catch (err) {
      setError(err.message || "Failed to fetch saved properties");
    } finally {
      setLoading(false);
    }
  }

  // Unsaving here means removing it from this page entirely, not just
  // toggling a heart icon — this list is specifically "what I've saved".
   async function handleRemove(property) {
    const id = String(property._id);
    setProperties((prev) => prev.filter((p) => String(p._id) !== id));
 
    pushToast({
      id: `fav-${id}-${Date.now()}`,
      status: "deleted",
      text: "Removed from favorites",
    });
 
    try {
      const res = await fetch(`${API_BASE}/api/favorites/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
    } catch (_) {
      // If the request failed, refetch to restore accurate state.
      fetchFavorites();
      pushToast({
        id: `fav-error-${id}-${Date.now()}`,
        status: "rejected",
        text: "Couldn't remove — try again",
      });
    }
  }

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <LoginHeader />
        <p>Please log in to view saved properties.</p>
      </div>
    );
  }

  if (user.role !== "tenant") {
    return (
      <div style={{ padding: 20 }}>
        <LoginHeader />
        <p>This page is for tenants only.</p>
      </div>
    );
  }

  return (
    <>
      <LoginHeader />

      <div
        className="toast-stack"
        aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast--${t.status}`}>
            <span>{t.text}</span>
            <button
              onClick={() => dismissToast(t.id)}
              className="toast__close"
              aria-label="Dismiss">
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="page-shell section-card">
        <div>
          <div className="eyebrow">Wishlist</div>
          <h2 className="page-title">Saved Properties</h2>
          <p className="muted">Places you've bookmarked while browsing.</p>
        </div>

        {loading && <div>Loading...</div>}
        {error && (
          <div
            className="empty-state"
            style={{ color: "#b91c1c" }}>
            {error}
          </div>
        )}

        {!loading && properties.length === 0 && !error ? (
          <div className="empty-state">
            You haven't saved any properties yet — tap the heart on a listing
            to add it here.
          </div>
        ) : (
          <div className="tenant-listings-grid">
            {properties.map((p) => (
              <PropertyCard
                key={p._id}
                property={p}
                isFavorited={true}
                onToggleFavorite={handleRemove}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}