import  { useState } from "react";

export default function PropertyMiniGallery({ images }) {
  const [index, setIndex] = useState(0);
  const list = images || [];

  if (list.length === 0) {
    return (
      <div className="booking-property-gallery booking-property-gallery--empty">
        <span>No photo</span>
      </div>
    );
  }

  function prev(e) {
    e.stopPropagation();
    setIndex((i) => (i - 1 + list.length) % list.length);
  }

  function next(e) {
    e.stopPropagation();
    setIndex((i) => (i + 1) % list.length);
  }

  function select(e, i) {
    e.stopPropagation();
    setIndex(i);
  }

  return (
    <div className="booking-property-gallery">
      <img
        src={list[index]?.url}
        alt="Property"
        className="booking-property-gallery__image"
      />
      {list.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="property-card__nav property-card__nav--prev"
            aria-label="Previous photo">
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            className="property-card__nav property-card__nav--next"
            aria-label="Next photo">
            ›
          </button>
          <div className="property-card__dots">
            {list.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`property-card__dot${i === index ? " is-active" : ""}`}
                onClick={(e) => select(e, i)}
                aria-label={`Show photo ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}