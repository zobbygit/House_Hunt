import React, { useState, useEffect, useRef } from "react";
import LoginHeader from "../../components/LoginHeader";
import PropertyCard from "../../components/PropertyCard";
import { API_BASE } from "../../config/api";

export default function OwnerListings({ showHeader = true }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef(null);
  const gridRef = useRef(null);
  const [form, setForm] = useState({
    propertyType: "",
    propertyAdType: "Rent",
    propertyAddress: "",
    ownerContact: "",
    propertyAmt: "",
    additionalInfo: "",
    bedrooms: "",
    bathrooms: "",
    furnished: "",
    parking: false,
  });
  const [editId, setEditId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  async function readApiResponse(res) {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return res.json();
    }

    const text = await res.text();
    return {
      message: text.slice(0, 200) || "Unexpected non-JSON response",
      raw: text,
    };
  }

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
    fetchMine();
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAnalytics() {
    try {
      const res = await fetch(
         `${API_BASE}/api/properties/analytics/owner`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        },
      );
      const data = await res.json();
      if (res.ok) setAnalytics(data);
    } catch (_) {
      // Non-critical — dashboard still works without the stat cards.
    }
  }

  function handleImageSelect(e) {
    const files = Array.from(e.target.files || []).slice(0, 3);
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  }

  function removeSelectedImage(index) {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function fetchMine() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/properties/mine`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await readApiResponse(res);
      if (!res.ok) throw new Error(data.message || "Failed to fetch");
      setListings(data.properties || []);
    } catch (err) {
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!form.propertyType || !form.propertyAddress || !form.ownerContact) {
        setError("Please fill property type, address and owner contact");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("propertyType", form.propertyType);
      formData.append("propertyAdType", form.propertyAdType);
      formData.append("propertyAddress", form.propertyAddress);
      formData.append("ownerContact", Number(form.ownerContact) || 0);
      formData.append("propertyAmt", Number(form.propertyAmt) || 0);
      formData.append("additionalInfo", form.additionalInfo || "");
      if (form.bedrooms !== "") formData.append("bedrooms", form.bedrooms);
      if (form.bathrooms !== "") formData.append("bathrooms", form.bathrooms);
      if (form.furnished) formData.append("furnished", form.furnished);
      formData.append("parking", form.parking ? "true" : "false");
      imageFiles.forEach((file) => formData.append("images", file));

let res;
      if (editId) {
        res = await fetch(`${API_BASE}/api/properties/${editId}`, {
          method: "PUT",
          headers: {
            // No Content-Type here — the browser sets the multipart
            // boundary automatically when the body is FormData.
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        res = await fetch(`${API_BASE}/api/properties`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }

      const data = await readApiResponse(res);
      if (!res.ok) throw new Error(data.message || "Failed to save");

      const wasCreate = !editId;

      pushToast({
        id: `property-${wasCreate ? "added" : "saved"}-${Date.now()}`,
        status: wasCreate ? "sent" : "accepted",
        text: wasCreate ? "Property added" : "Property saved",
      });

      setForm({
        propertyType: "",
        propertyAdType: "Rent",
        propertyAddress: "",
        ownerContact: "",
        propertyAmt: "",
        additionalInfo: "",
        bedrooms: "",
        bathrooms: "",
        furnished: "",
        parking: false,
      });
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setImageFiles([]);
      setImagePreviews([]);
      setExistingImages([]);
      setEditId(null);
      await fetchMine();
      fetchAnalytics();

      if (wasCreate) {
        gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (err) {
      setError(err.message || "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  function handleCancelEdit() {
    setEditId(null);
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setForm({
      propertyType: "",
      propertyAdType: "Rent",
      propertyAddress: "",
      ownerContact: "",
      propertyAmt: "",
      additionalInfo: "",
      bedrooms: "",
      bathrooms: "",
      furnished: "",
      parking: false,
    });
  }

 async function handleDelete(id) {
    if (!window.confirm("Delete this listing?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/properties/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await readApiResponse(res);
        throw new Error(data.message || "Failed to delete");
      }
      fetchMine();
      fetchAnalytics();
    } catch (err) {
      setError(err.message || "Failed to delete");
    }
  }

async function handleToggleAvailability(property) {
    const nextValue = !(property.isAvailable !== false);
    try {
      const res = await fetch(
        `${API_BASE}/api/properties/${property._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isAvailable: nextValue }),
        },
      );
      const data = await readApiResponse(res);
      if (!res.ok)
        throw new Error(data.message || "Failed to update availability");
      fetchMine();
    } catch (err) {
      setError(err.message || "Failed to update availability");
    }
  }

  if (!user || user.role !== "owner") {
    return (
      <div style={{ padding: 20 }}>
        <LoginHeader />
        <p>Owners only.</p>
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
        {loading && <div>Loading...</div>}
        {error && (
          <div
            className="empty-state"
            style={{ color: "#b91c1c" }}>
            {error}
          </div>
        )}

        {analytics && (
          <div className="analytics-grid">
            <div className="analytics-card">
              <span className="analytics-card__icon">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                  />
                </svg>
              </span>
              <div>
                <div className="analytics-card__value">
                  {analytics.summary.totalViews}
                </div>
                <div className="muted">Property Views</div>
              </div>
            </div>

            <div className="analytics-card">
              <span className="analytics-card__icon">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M12 20.25c-.3 0-.6-.1-.8-.3C7.1 16.6 3 13 3 8.9 3 6.2 5.1 4 7.8 4c1.7 0 3.2.9 4.2 2.3C13 4.9 14.5 4 16.2 4 18.9 4 21 6.2 21 8.9c0 4.1-4.1 7.7-8.2 11.05-.2.2-.5.3-.8.3Z" />
                </svg>
              </span>
              <div>
                <div className="analytics-card__value">
                  {analytics.summary.totalFavorites}
                </div>
                <div className="muted">Favorites</div>
              </div>
            </div>

            <div className="analytics-card analytics-card--wide">
              <span className="analytics-card__icon">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <div>
                <div className="analytics-card__value">
                  {analytics.summary.totalBooked}
                </div>
                <div className="muted">Already Booked</div>
                {analytics.properties.some((p) => p.bookedBy.length > 0) && (
                  <div className="analytics-card__names">
                    {[
                      ...new Set(
                        analytics.properties.flatMap((p) => p.bookedBy),
                      ),
                    ].join(", ")}
                  </div>
                )}
              </div>
            </div>

            <div className="analytics-card">
              <span className="analytics-card__icon">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />
                  <path d="M12 7v5l3 3" />
                </svg>
              </span>
              <div>
                <div className="analytics-card__value">
                  {analytics.summary.totalPending}
                </div>
                <div className="muted">Pending Approval</div>
              </div>
            </div>

            <div className="analytics-card">
              <span className="analytics-card__icon">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M12 3h6a2 2 0 0 1 2 2v6l-9 9-8-8 9-9Z" />
                  <circle
                    cx="15.5"
                    cy="8.5"
                    r="1.2"
                  />
                </svg>
              </span>
              <div>
                <div className="analytics-card__value">
                  {analytics.summary.forSaleCount}
                </div>
                <div className="muted">For Sale</div>
              </div>
            </div>

            <div className="analytics-card">
              <span className="analytics-card__icon">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <circle
                    cx="8"
                    cy="12"
                    r="4.5"
                  />
                  <line
                    x1="12"
                    y1="12"
                    x2="21"
                    y2="12"
                  />
                  <line
                    x1="17"
                    y1="12"
                    x2="17"
                    y2="16"
                  />
                </svg>
              </span>
              <div>
                <div className="analytics-card__value">
                  {analytics.summary.forRentCount}
                </div>
                <div className="muted">For Rent</div>
              </div>
            </div>
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div className="empty-state">You do not have any listings yet.</div>
        )}

        <div
          ref={gridRef}
          className="owner-listings-grid">
          {listings.map((p) => (
            <div
              key={p._id}
              className="owner-listing-item">
              <PropertyCard property={p} />
              <div className="owner-listing-actions">
                <button
                  onClick={() => {
                    setForm({
                      propertyType: p.propertyType || "",
                      propertyAdType: p.propertyAdType || "Rent",
                      propertyAddress: p.propertyAddress || "",
                      ownerContact: p.ownerContact || "",
                      propertyAmt: p.propertyAmt || "",
                      additionalInfo: p.additionalInfo || "",
                      bedrooms: p.bedrooms ?? "",
                      bathrooms: p.bathrooms ?? "",
                      furnished: p.furnished || "",
                      parking: p.parking || false,
                    });
                    setEditId(p._id);
                    setExistingImages(p.propertyImages || []);
                    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
                    setImageFiles([]);
                    setImagePreviews([]);
                    formRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                  className="button button-secondary">
                  Edit
                </button>
                
                <button
                  onClick={() => handleToggleAvailability(p)}
                  className="button button-secondary">
                  {p.isAvailable === false ? "Mark Available" : "Mark Rented/Sold"}
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="button button-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <form
          ref={formRef}
          onSubmit={handleCreate}
          className="listing-form surface-card">
          <div className="eyebrow">
            {editId ? "Edit listing" : "Add a new listing"}
          </div>

          <input
            placeholder="Property Type"
            value={form.propertyType}
            onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
          />

          <select
            value={form.propertyAdType}
            onChange={(e) =>
              setForm({ ...form, propertyAdType: e.target.value })
            }>
            <option value="Rent">Rent</option>
            <option value="Sale">Sale</option>
          </select>

          <input
            placeholder="Address"
            value={form.propertyAddress}
            onChange={(e) =>
              setForm({ ...form, propertyAddress: e.target.value })
            }
          />

          <input
            placeholder="Owner Contact"
            value={form.ownerContact}
            onChange={(e) => setForm({ ...form, ownerContact: e.target.value })}
          />

          <input
            placeholder="Amount"
            value={form.propertyAmt}
            onChange={(e) => setForm({ ...form, propertyAmt: e.target.value })}
          />

          <div className="amenities-fields">
            <input
              type="number"
              min="0"
              placeholder="Bedrooms"
              value={form.bedrooms}
              onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
            />
            <input
              type="number"
              min="0"
              placeholder="Bathrooms"
              value={form.bathrooms}
              onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
            />
            <select
              value={form.furnished}
              onChange={(e) =>
                setForm({ ...form, furnished: e.target.value })
              }>
              <option value="">Furnishing (optional)</option>
              <option value="Furnished">Furnished</option>
              <option value="Semi-furnished">Semi-furnished</option>
              <option value="Unfurnished">Unfurnished</option>
            </select>

            <label className="amenities-checkbox">
              <input
                type="checkbox"
                checked={form.parking}
                onChange={(e) =>
                  setForm({ ...form, parking: e.target.checked })
                }
              />

              <span className="amenities-checkbox__box">
                <span className="amenities-checkbox__check">✓</span>
              </span>

              <span className="amenities-checkbox__text">
                Parking available
              </span>
            </label>
          </div>


          <div>
            <label
              htmlFor="property-images-input"
              className="glass-upload-btn">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true">
                <path d="M4 16.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5" />
                <path d="M7 9l5-5 5 5" />
                <path d="M12 4v12" />
              </svg>
              <span>
                {imageFiles.length > 0
                  ? `${imageFiles.length} photo${imageFiles.length > 1 ? "s" : ""} selected`
                  : "Add photos (up to 3)"}
              </span>
            </label>
            <input
              id="property-images-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="visually-hidden-input"
            />
          </div>

          {editId && existingImages.length > 0 && imageFiles.length === 0 && (
            <div className="image-preview-row">
              {existingImages.map((img, i) => (
                <div
                  key={i}
                  className="image-preview-thumb">
                  <img
                    src={img.url}
                    alt="Current"
                  />
                </div>
              ))}
              <span className="muted image-preview-note">
                Current photos — pick new ones above to replace them
              </span>
            </div>
          )}

          {imagePreviews.length > 0 && (
            <div className="image-preview-row">
              {imagePreviews.map((src, i) => (
                <div
                  key={i}
                  className="image-preview-thumb">
                  <img
                    src={src}
                    alt={`Selected ${i + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeSelectedImage(i)}
                    className="image-preview-remove"
                    aria-label="Remove image">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="button button-primary">
            {editId ? "Save" : "Add"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="button button-secondary">
              Cancel
            </button>
          )}
        </form>
      </div>
    </>
  );
}