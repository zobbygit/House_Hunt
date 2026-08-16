import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const year = currentTime.getFullYear();

  const formattedDate = currentTime.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <footer className="site-footer">
      {/* Animated background elements */}
      <div className="site-footer__orb site-footer__orb--one" />
      <div className="site-footer__orb site-footer__orb--two" />

      <div className="site-footer__glass">
        <div className="site-footer__shine" />

        <div className="site-footer__inner">

          {/* ================= BRAND ================= */}
          <div className="site-footer__brand-section">
            <Link to="/dashboard" className="site-footer__brand">
              <div className="site-footer__logo">
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 11.5 12 4l9 7.5" />
                  <path d="M5.5 10.5V20h13v-9.5" />
                  <path d="M9.5 20v-5h5v5" />
                </svg>
              </div>

              <div>
                <h2>HOUSE HUNT</h2>
                <p>Find your perfect place.</p>
              </div>
            </Link>

            <p className="site-footer__description">
              A modern property platform built to make finding,
              listing and saving your perfect place simple.
            </p>
          </div>

          {/* ================= NAVIGATION ================= */}
          <div className="site-footer__column">
            <span className="site-footer__heading">
              Explore
            </span>

            <Link to="/dashboard" className="site-footer__link">
              <span>Dashboard</span>
              <span className="site-footer__arrow">↗</span>
            </Link>

            <Link to="/dashboard" className="site-footer__link">
              <span>Properties</span>
              <span className="site-footer__arrow">↗</span>
            </Link>

            <Link to="/bookings" className="site-footer__link">
              <span>My Bookings</span>
              <span className="site-footer__arrow">↗</span>
            </Link>

            {/* <Link to="/saved" className="site-footer__link">
              <span>Saved Properties</span>
              <span className="site-footer__arrow">↗</span>
            </Link> */}
          </div>

          {/* ================= DEVELOPER ================= */}
          <div className="site-footer__column site-footer__developer">
            <span className="site-footer__heading">
              Developer
            </span>

            <div className="developer-card">
              <div className="developer-avatar">
                Z
              </div>

              <div>
                <strong>Zohaib</strong>
                <span>Full-Stack Developer</span>
              </div>
            </div>

            <div className="developer-links">

              {/* GitHub */}
              <a
                href="https://github.com/zobbygit"
                target="_blank"
                rel="noreferrer"
                className="developer-social"
                aria-label="GitHub"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="currentColor"
                >
                  <path d="M12 .7a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.3-1.3-1.6-1.3-1.6-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.3 11.3 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A12 12 0 0 0 12 .7Z" />
                </svg>

                <span>GitHub</span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/zohaib-aslam-245a40253/"
                target="_blank"
                rel="noreferrer"
                className="developer-social"
                aria-label="LinkedIn"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="currentColor"
                >
                  <path d="M5.2 3.5a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4ZM3.3 9h3.8v11.7H3.3V9Zm6.2 0h3.6v1.6h.1c.5-.9 1.7-2 3.6-2 3.8 0 4.5 2.5 4.5 5.8v6.3h-3.8v-5.6c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9v5.7H9.5V9Z" />
                </svg>

                <span>LinkedIn</span>
              </a>

              {/* Email */}
              <a
                href="mailto:iamzohaib777@gmail.com"
                className="developer-social"
                aria-label="Email"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />
                  <path d="m3 7 9 6 9-6" />
                </svg>

                <span>Email</span>
              </a>

            </div>
          </div>

        </div>

        {/* ================= BOTTOM BAR ================= */}
        <div className="site-footer__bottom">

          <div className="site-footer__copyright">
            <span className="copyright-symbol">©</span>

            <span>
              {year} House Hunt. All rights reserved.
            </span>
          </div>

          <div className="site-footer__time">
            <span className="live-indicator" />

            <div>
              <span>{formattedDate}</span>
              <strong>{formattedTime}</strong>
            </div>
          </div>

          <div className="site-footer__made">
            Built with <span>♥</span> by
            <strong> Zohaib</strong>
          </div>

        </div>

      </div>
    </footer>
  );
}