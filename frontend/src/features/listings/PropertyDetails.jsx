import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import LoginHeader from "../../components/LoginHeader";
import { API_BASE } from "../../config/api";

const PersonIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    <circle
      cx="12"
      cy="8"
      r="3.5"
    />
    <path d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6" />
  </svg>
);

const PhoneIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2C10.5 20 4 13.5 4 6a2 2 0 0 1 1-2Z" />
  </svg>
);

const TagIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    <path d="M12 3h6a2 2 0 0 1 2 2v6l-9 9-8-8 9-9Z" />
    <circle
      cx="15.5"
      cy="8.5"
      r="1.2"
    />
  </svg>
);

const BedIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
    <path d="M3 18v2M21 18v2" />
    <path d="M3 12V8a2 2 0 0 1 2-2h6v4" />
  </svg>
);

const BathIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    <path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2Z" />
    <path d="M6 12V6a2 2 0 0 1 3.2-1.6" />
    <path d="M4 19l-1 2M20 19l1 2" />
  </svg>
);

const SofaIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    <path d="M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5" />
    <path d="M3 12h18v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4Z" />
    <path d="M5 18v2M19 18v2" />
  </svg>
);

const CarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    <path d="M4 16V11l2-5h12l2 5v5" />
    <path d="M4 16h16v2a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2Z" />
    <circle
      cx="7.5"
      cy="16"
      r="1.2"
    />
    <circle
      cx="16.5"
      cy="16"
      r="1.2"
    />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    <path d="M12 20.25c-.3 0-.6-.1-.8-.3C7.1 16.6 3 13 3 8.9 3 6.2 5.1 4 7.8 4c1.7 0 3.2.9 4.2 2.3C13 4.9 14.5 4 16.2 4 18.9 4 21 6.2 21 8.9c0 4.1-4.1 7.7-8.2 11.05-.2.2-.5.3-.8.3Z" />
  </svg>
);

export default function PropertyDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [property, setProperty] = useState(location.state?.property || null);
  const [loading, setLoading] = useState(!location.state?.property);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  function pushToast(toast) {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 4000);
  }

  function dismissToast(toastId) {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }

  useEffect(() => {
    fetchProperty();
    if (user?.role === "tenant") {
      checkFavoriteStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function checkFavoriteStatus() {
    try {
      const res = await fetch(`${API_BASE}/api/favorites/mine/ids`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) return;
      setIsFavorited((data.ids || []).includes(String(id)));
    } catch (_) {
      // Non-critical; leave as not-favorited on failure.
    }
  }

  async function toggleFavorite() {
    setFavoriteLoading(true);
    const wasFavorited = isFavorited;
    const willBeFavorited = !wasFavorited;
    setIsFavorited(willBeFavorited);

    pushToast({
      id: `fav-${id}-${Date.now()}`,
      status: willBeFavorited ? "sent" : "deleted",
      text: willBeFavorited ? "Added to favorites" : "Removed from favorites",
    });

    try {
     const res = await fetch(`${API_BASE}/api/favorites/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
    } catch (_) {
      setIsFavorited(wasFavorited);
      pushToast({
        id: `fav-error-${id}-${Date.now()}`,
        status: "rejected",
        text: "Couldn't update favorite — try again",
      });
    } finally {
      setFavoriteLoading(false);
    }
  }

  async function fetchProperty() {
    setError("");
    try {
     const res = await fetch(`${API_BASE}/api/properties/${id}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load property");
      setProperty(data.property);
      setActiveImage(0);
    } catch (err) {
      if (!location.state?.property) {
        setError(err.message || "Failed to load property");
      }
    } finally {
      setLoading(false);
    }
  }

  const images = property?.propertyImages || [];

  function prevImage() {
    setActiveImage((i) => (i - 1 + images.length) % images.length);
  }

  function nextImage() {
    setActiveImage((i) => (i + 1) % images.length);
  }

  if (loading) {
    return (
      <>
        <LoginHeader />
        <div className="page-shell">
          <div>Loading...</div>
        </div>
      </>
    );
  }

  if (error || !property) {
    return (
      <>
        <LoginHeader />
        <div className="page-shell">
          <div
            className="empty-state"
            style={{ color: "#b91c1c" }}>
            {error || "Property not found"}
          </div>
        </div>
      </>
    );
  }

  const adTypeKey =
    String(property.propertyAdType || "Rent").trim().toLowerCase() === "sale"
      ? "sale"
      : "rent";
  const isUnavailable = property.isAvailable === false;

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

      <div className="page-shell property-details">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="property-details__back-link">
          <span aria-hidden="true">←</span> Back to listings
        </button>

        <div
          className={`property-details__layout property-details__layout--${adTypeKey}`}>
          <div className="property-details__media">
            <div className="property-details__gallery">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[activeImage]?.url}
                    alt={property.propertyType}
                    className="property-details__image"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevImage}
                        className="property-card__nav property-card__nav--prev"
                        aria-label="Previous photo">
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={nextImage}
                        className="property-card__nav property-card__nav--next"
                        aria-label="Next photo">
                        ›
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="property-details__gallery-empty">
                  No photos yet
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="property-details__thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`property-details__thumb${
                      i === activeImage ? " is-active" : ""
                    }`}
                    aria-label={`Show photo ${i + 1}`}>
                    <img
                      src={img.url}
                      alt=""
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="property-details__info surface-card">
            <div className="property-details__top-row">
              <div>
                <div className="eyebrow">{property.propertyType}</div>
                <h1 className="property-details__price">
                  ₹ {property.propertyAmt || 0}
                </h1>
              </div>
              <span
                className={`status-badge status-badge--${
                  isUnavailable ? "rejected" : "accepted"
                } property-details__status`}>
                {isUnavailable ? "Unavailable" : "Available"}
              </span>
            </div>

            {property.propertyAdType && (
              <span className="property-card__ribbon property-details__ribbon">
                {property.propertyAdType}
              </span>
            )}

            <div className="property-details__row">
              <span
                className="property-card__pin"
                aria-hidden="true"
              />
              {property.propertyAddress}
            </div>

            <div className="property-details__divider" />

            <div className="property-details__grid">
              <div className="property-details__detail">
                <span className="property-details__detail-icon">
                  <PersonIcon />
                </span>
                <div>
                  <div className="muted">Owner</div>
                  <div className="property-details__value">
                    {property.ownerName || "—"}
                  </div>
                </div>
              </div>

              <div className="property-details__detail">
                <span className="property-details__detail-icon">
                  <PhoneIcon />
                </span>
                <div>
                  <div className="muted">Contact</div>
                  <div className="property-details__value">
                    {property.ownerContact || "—"}
                  </div>
                </div>
              </div>

              <div className="property-details__detail">
                <span className="property-details__detail-icon">
                  <TagIcon />
                </span>
                <div>
                  <div className="muted">Listing type</div>
                  <div className="property-details__value">
                    {property.propertyAdType || "—"}
                  </div>
                </div>
              </div>
            </div>



{/* 
            {(property.bedrooms ||
              property.bathrooms ||
              property.furnished ||
              property.parking) && (
              <>
                <div className="property-details__divider" />
                <div className="muted">Amenities</div>
                <div className="property-details__amenities">
                  {property.bedrooms ? (
                    <span className="amenity-chip">
                      <BedIcon /> {property.bedrooms} Bed
                      {property.bedrooms > 1 ? "s" : ""}
                    </span>
                  ) : null}
                  {property.bathrooms ? (
                    <span className="amenity-chip">
                      <BathIcon /> {property.bathrooms} Bath
                      {property.bathrooms > 1 ? "s" : ""}
                    </span>
                  ) : null}
                  {property.furnished ? (
                    <span className="amenity-chip">
                      <SofaIcon /> {property.furnished}
                    </span>
                  ) : null}
                  {property.parking ? (
                    <span className="amenity-chip">
                      <CarIcon /> Parking
                    </span>
                  ) : null}
                </div>
              </>
            )}
 */}



{(property.bedrooms ||
  property.bathrooms ||
  property.furnished ||
  property.parking) && (
  <>
    <div className="property-details__divider" />

    <div className="property-details__amenities-section">
      <div className="property-details__amenities-title">
        Amenities
      </div>

      <div className="property-details__amenities">
        {property.bedrooms ? (
          <span className="amenity-chip">
            <BedIcon className="amenity-icon" />
            <span>
              {property.bedrooms} Bed{property.bedrooms > 1 ? "s" : ""}
            </span>
          </span>
        ) : null}

        {property.bathrooms ? (
          <span className="amenity-chip">
            <BathIcon className="amenity-icon" />
            <span>
              {property.bathrooms} Bath{property.bathrooms > 1 ? "s" : ""}
            </span>
          </span>
        ) : null}

        {property.furnished ? (
          <span className="amenity-chip">
            <SofaIcon className="amenity-icon" />
            <span>{property.furnished}</span>
          </span>
        ) : null}

        {property.parking ? (
          <span className="amenity-chip">
            <CarIcon className="amenity-icon" />
            <span>Parking</span>
          </span>
        ) : null}
      </div>
    </div>
  </>
)}




            {property.additionalInfo && (
              <>
                <div className="property-details__divider" />
                <div className="muted">Additional info</div>
                <p>{property.additionalInfo}</p>
              </>
            )}

            {property.ownerContact && (
              <div className="property-details__actions">
                <a
                  href={`tel:${property.ownerContact}`}
                  className="button button-primary">
                  Call Owner
                </a>
                {user?.role === "tenant" && (
                  <button
                    type="button"
                    onClick={toggleFavorite}
                    disabled={favoriteLoading}
                    className={`button button-secondary property-details__save${
                      isFavorited ? " is-favorited" : ""
                    }`}>
                    <HeartIcon filled={isFavorited} />
                    {isFavorited ? "Saved" : "Save"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}