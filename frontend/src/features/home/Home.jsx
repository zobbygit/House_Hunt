
import { Link } from "react-router-dom";

const MiniKey = () => (
  <svg
    viewBox="0 0 48 48"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    <circle cx="16" cy="24" r="9" />
    <line x1="23" y1="24" x2="41" y2="24" />
    <line x1="34" y1="24" x2="34" y2="30" />
    <line x1="39" y1="24" x2="39" y2="29" />
  </svg>
);

const TwinKeyArt = () => (
  <svg
    viewBox="0 0 120 84"
    width="100%"
    height="100%"
    fill="none"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    <g
      style={{ stroke: "var(--accent)" }}
      transform="rotate(-18 40 34)">
      <circle
        cx="26"
        cy="34"
        r="14"
      />
      <line
        x1="38"
        y1="34"
        x2="70"
        y2="34"
      />
      <line
        x1="58"
        y1="34"
        x2="58"
        y2="44"
      />
      <line
        x1="66"
        y1="34"
        x2="66"
        y2="42"
      />
    </g>
    <g
      style={{ stroke: "var(--accent-2)" }}
      transform="rotate(14 70 50) translate(14 14)">
      <circle
        cx="26"
        cy="34"
        r="14"
      />
      <line
        x1="38"
        y1="34"
        x2="70"
        y2="34"
      />
      <line
        x1="58"
        y1="34"
        x2="58"
        y2="44"
      />
      <line
        x1="66"
        y1="34"
        x2="66"
        y2="42"
      />
    </g>
  </svg>
);

export default function Home() {
  return (
    <div className="page-shell">
      <main className="dashboard-page">
        <section className="hero surface-card">
          <div
            className="hero__art"
            aria-hidden="true">
            <TwinKeyArt />
          </div>

          <div className="eyebrow">HouseHunt</div>
          <h2 className="hero__title">
            Find and manage rental homes faster
          </h2>
          <p className="lead muted">
            Search by location, budget, and amenities. Owners can list
            properties and manage inquiries from one simple dashboard.
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <strong>Simple</strong>
              <span>Clean owner and tenant flows</span>
            </div>
            <div className="hero-stat">
              <strong>Fast</strong>
              <span>Bookings and listings in one place</span>
            </div>
            <div className="hero-stat">
              <strong>Secure</strong>
              <span>Login, roles, and protected dashboards</span>
            </div>
          </div>

          <div className="cta-row">
            <Link
              to="/register"
              className="button button-primary">
              Get Started
            </Link>
            <Link
              to="/login"
              className="button button-secondary">
              Login
            </Link>
          </div>
        </section>

        <div
          className="home-fork"
          aria-hidden="true">
          <span className="home-fork__line" />
          <span className="home-fork__dot" />
        </div>

        <section className="feature-grid">
          <article className="listing-card destination-card destination-card--owner">
            <div className="destination-card__icon">
              <MiniKey />
            </div>
            <div className="listing-card__header">For Property Owners</div>
            <div className="listing-card__info">
              List properties, track applicants, and manage agreements in one
              place.
            </div>
          </article>

          <article className="listing-card destination-card destination-card--tenant">
            <div className="destination-card__icon">
              <MiniKey />
            </div>
            <div className="listing-card__header">For Tenants</div>
            <div className="listing-card__info">
              Browse homes, send booking requests, and track your booking
              history.
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}