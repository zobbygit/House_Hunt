

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const HeartIcon = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    <path d="M12 20.25c-.3 0-.6-.1-.8-.3C7.1 16.6 3 13 3 8.9 3 6.2 5.1 4 7.8 4c1.7 0 3.2.9 4.2 2.3C13 4.9 14.5 4 16.2 4 18.9 4 21 6.2 21 8.9c0 4.1-4.1 7.7-8.2 11.05-.2.2-.5.3-.8.3Z" />
  </svg>
);

export default function PropertyCard({
  property,
  onBook,
  isFavorited,
  onToggleFavorite,
}) {
  const [activeImage, setActiveImage] = useState(0);
  const touchStartX = useRef(null);
  const navigate = useNavigate();

  if (!property) return null;

  const {
    propertyAddress,
    propertyType,
    propertyAdType,
    propertyAmt,
    ownerName,
    ownerContact,
    additionalInfo,
    isAvailable,
    propertyImages,
  } = property;

  const adTypeKey =
    String(propertyAdType || "Rent").trim().toLowerCase() === "sale"
      ? "sale"
      : "rent";

  const isUnavailable = isAvailable === false;
  const images = propertyImages || [];

  function goToDetails() {
    navigate(`/property/${property._id}`, { state: { property } });
  }

  function prevImage(e) {
    e.stopPropagation();
    setActiveImage((i) => (i - 1 + images.length) % images.length);
  }

  function nextImage(e) {
    e.stopPropagation();
    setActiveImage((i) => (i + 1) % images.length);
  }

  function selectImage(e, index) {
    e.stopPropagation();
    setActiveImage(index);
  }

  function handleFavoriteClick(e) {
    e.stopPropagation();
    onToggleFavorite(property);
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null || images.length <= 1) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        setActiveImage((i) => (i + 1) % images.length);
      } else {
        setActiveImage((i) => (i - 1 + images.length) % images.length);
      }
    }
    touchStartX.current = null;
  }

  return (
    <article
      onClick={goToDetails}
      className={`listing-card property-card property-card--${adTypeKey}${
        isUnavailable ? " property-card--unavailable" : ""
      }`}>
      {isUnavailable && (
        <span className="property-card__unavailable-tag">Unavailable</span>
      )}
      {propertyAdType && (
        <span className="property-card__ribbon">{propertyAdType}</span>
      )}

      {onToggleFavorite && (
        <button
          type="button"
          onClick={handleFavoriteClick}
          className={`property-card__favorite${
            isFavorited ? " is-favorited" : ""
          }`}
          aria-label={isFavorited ? "Remove from saved" : "Save property"}
          aria-pressed={!!isFavorited}>
          <HeartIcon filled={!!isFavorited} />
        </button>
      )}

      {images.length > 0 ? (
        <div
          className="property-card__gallery"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}>
          <img
            src={images[activeImage]?.url}
            alt={propertyType}
            className="property-card__image"
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
              <div className="property-card__dots">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`property-card__dot${
                      i === activeImage ? " is-active" : ""
                    }`}
                    onClick={(e) => selectImage(e, i)}
                    aria-label={`Show photo ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="property-card__gallery property-card__gallery--empty">
          <span>No photo yet</span>
        </div>
      )}

      <div className="listing-card__header">
        {propertyType} — {ownerName || "Owner"}
      </div>

      <div className="listing-card__meta property-card__meta">
        <span
          className="property-card__pin"
          aria-hidden="true"
        />
        {propertyAddress}
      </div>

      <div className="listing-card__price">₹ {propertyAmt || 0}</div>

      {additionalInfo && (
        <div className="listing-card__info">{additionalInfo}</div>
      )}

      {ownerContact && (
        <div className="property-card__footer">
          <div className="listing-card__contact">Contact: {ownerContact}</div>
        </div>
      )}

      {onBook && (
        <button
          className="button button-success listing-card__action"
          onClick={(e) => {
            e.stopPropagation();
            onBook(property);
          }}>
          Book Now
        </button>
      )}
    </article>
  );
}