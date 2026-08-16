import React, { useState, useEffect } from "react";
import PropertyCard from "../../components/PropertyCard";
import LoginHeader from "../../components/LoginHeader";
import { API_BASE } from "../../config/api";

export default function TenantListings({ showHeader = true }) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    adType: "",
    minPrice: "",
    maxPrice: "",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    userName: "",
    phone: "",
    message: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [favoriteIds, setFavoriteIds] = useState(new Set());
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
    fetchListings();
    fetchFavoriteIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

 async function fetchFavoriteIds() {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/favorites/mine/ids`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) return;
      setFavoriteIds(new Set(data.ids || []));
    } catch (_) {
      // Non-critical for the search page; silently skip.
    }
  }

  async function handleToggleFavorite(property) {
    const id = String(property._id);
    const wasFavorited = favoriteIds.has(id);
    const willBeFavorited = !wasFavorited;

    // Optimistic update — flip immediately, revert only if the request fails.
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (wasFavorited) next.delete(id);
      else next.add(id);
      return next;
    });

    pushToast({
      id: `fav-${id}-${Date.now()}`,
      status: willBeFavorited ? "sent" : "deleted",
      text: willBeFavorited ? "Added to favorites" : "Removed from favorites",
    });

  try {
      const res = await fetch(
        `${API_BASE}/api/favorites/${id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to update favorite");
    } catch (_) {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorited) next.add(id);
        else next.delete(id);
        return next;
      });
      pushToast({
        id: `fav-error-${id}-${Date.now()}`,
        status: "rejected",
        text: "Couldn't update favorite — try again",
      });
    }
  }

  async function fetchListings(q = "", currentFilters = filters) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (currentFilters.type) params.set("type", currentFilters.type);
      if (currentFilters.adType) params.set("adType", currentFilters.adType);
      if (currentFilters.minPrice)
        params.set("minPrice", currentFilters.minPrice);
      if (currentFilters.maxPrice)
        params.set("maxPrice", currentFilters.maxPrice);

          const url = `${API_BASE}/api/properties?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch listings");
      setResults(data.properties || []);
    } catch (err) {
      setError(err.message || "Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchListings(query, filters);
  }

  function handleFilterChange(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function handleClearFilters() {
    const cleared = { type: "", adType: "", minPrice: "", maxPrice: "" };
    setFilters(cleared);
    fetchListings(query, cleared);
  }

  function handleBook(property) {
    setSelectedProperty(property);
    setBookingError("");
    setBookingSuccess("");
    setBookingForm({
      userName: user?.name || "",
      phone: "",
      message: "",
    });
  }

  function closeBookingForm() {
    setSelectedProperty(null);
    setBookingError("");
    setBookingSuccess("");
  }

  async function submitBooking(e) {
    e.preventDefault();
    if (!selectedProperty) return;

    setBookingLoading(true);
    setBookingError("");
    setBookingSuccess("");

 try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: selectedProperty._id,
          userName: bookingForm.userName,
          phone: bookingForm.phone,
          message: bookingForm.message,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { message: await res.text() };

      if (!res.ok) throw new Error(data.message || "Failed to create booking");

      setBookingSuccess("Booking request sent. The owner will review it soon.");
      setBookingForm({
        userName: user?.name || "",
        phone: "",
        message: "",
      });
    } catch (err) {
      setBookingError(err.message || "Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  }

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <LoginHeader />
        <p>Please log in to view listings.</p>
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
      {showHeader && <LoginHeader />}

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
          <div className="eyebrow">Browse</div>
          <h2 className="page-title">Search Listings</h2>
          <p className="muted">Find a place and send a request to the owner.</p>
        </div>
        <form
          onSubmit={handleSearch}
          className="listing-form">
          <input
            placeholder="Search by address, type, or info"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}>
            <input
              placeholder="Property type (e.g. Apartment)"
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              style={{ flex: "1 1 180px" }}
            />
            <select
              value={filters.adType}
              onChange={(e) => handleFilterChange("adType", e.target.value)}
              style={{ flex: "1 1 140px" }}>
              <option value="">Any (Rent/Sale)</option>
              <option value="Rent">Rent</option>
              <option value="Sale">Sale</option>
            </select>
            <input
              type="number"
              placeholder="Min price"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              style={{ flex: "1 1 120px" }}
            />
            <input
              type="number"
              placeholder="Max price"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              style={{ flex: "1 1 120px" }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="submit"
              className="button button-primary">
              Search
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="button button-secondary">
              Clear filters
            </button>
          </div>
        </form>

        {error && (
          <div
            className="empty-state"
            style={{ color: "#b91c1c" }}>
            {error}
          </div>
        )}

        <h3 className="section-title">All Available Listings</h3>
        {loading && <div>Loading...</div>}
        {results.length === 0 && !loading ? (
          <div className="empty-state">No listings found.</div>
        ) : (
          <div className="tenant-listings-grid">
            {results.map((p) => (
              <PropertyCard
                key={p._id}
                property={p}
                onBook={handleBook}
                isFavorited={favoriteIds.has(String(p._id))}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}

        {selectedProperty && (
          <div className="booking-modal">
            <div className="booking-modal__panel">
              <h3 style={{ marginTop: 0 }}>Book this property</h3>
              <div
                className="muted"
                style={{ marginBottom: 12 }}>
                {selectedProperty.propertyType} -{" "}
                {selectedProperty.propertyAddress}
              </div>
              <form onSubmit={submitBooking}>
                <input
                  placeholder="Your name"
                  value={bookingForm.userName}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, userName: e.target.value })
                  }
                  className="auth-field"
                  required
                />
                <input
                  placeholder="Phone number"
                  value={bookingForm.phone}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, phone: e.target.value })
                  }
                  className="auth-field"
                  required
                />
                <textarea
                  placeholder="Message to owner"
                  value={bookingForm.message}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, message: e.target.value })
                  }
                  className="auth-field"
                  style={{ minHeight: 100 }}
                />

                {bookingError && (
                  <div style={{ color: "#c62828", marginBottom: 10 }}>
                    {bookingError}
                  </div>
                )}
                {bookingSuccess && (
                  <div style={{ color: "#2e7d32", marginBottom: 10 }}>
                    {bookingSuccess}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="button button-primary booking-action">
                    {bookingLoading ? "Sending..." : "Send Request"}
                  </button>
                  <button
                    type="button"
                    onClick={closeBookingForm}
                    className="button button-secondary booking-action">
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}