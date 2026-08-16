import  { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/header.css";
import ProfilePopup from "./ProfilePopup";
import { API_BASE } from "../config/api";

export default function LoginHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  // const user = JSON.parse(localStorage.getItem("user") || "null");
  const [user, setUser] = useState(() =>
  JSON.parse(localStorage.getItem("user") || "null")
);
  const token = localStorage.getItem("token");

  const [pendingCount, setPendingCount] = useState(0);
  const [showProfile, setShowProfile] = useState(false);

  //  const hideAuthLinks = ["/login", "/register"].includes(
  //   location.pathname
  // );

  useEffect(() => {
  if (!token) return;

  async function loadUserProfile() {
    try {
      const res = await fetch(
        `${API_BASE}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!res.ok) return;

      const data = await res.json();

      if (data.user) {
        setUser(data.user);
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }
    } catch (error) {
      console.error(
        "Failed to load user profile:",
        error
      );
    }
  }

  loadUserProfile();
}, [token]);

  const hideAuthLinks = ["/login", "/register"].includes(
    location.pathname
  );

  useEffect(() => {
    if (!user || !token) return;

    fetchPendingCount();
    const intervalId = setInterval(fetchPendingCount, 10000);

    return () => clearInterval(intervalId);
  }, [user?.id, user?.role]);

  async function fetchPendingCount() {
    if (!user || !token) return;

    try {
      const url =
        user.role === "owner"
          ? `${API_BASE}/api/bookings/owner`
          : `${API_BASE}/api/bookings/mine`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();

      const count = (data.bookings || []).filter(
        (b) => b.bookingStatus === "pending"
      ).length;

      setPendingCount(count);
    } catch (_) {}
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  return (
    <header className="login-header">
      <div className="login-header-container">
        <Link to="/dashboard" className="login-brand-link">
          <div className="brand-wrapper">
            <div className="brand-icon">⌂</div>

            <div>
              <h1 className="login-brand">HOUSE HUNT</h1>
              <span className="brand-tagline">
                Find your perfect place
              </span>
            </div>
          </div>
        </Link>

        <nav className="login-nav">
          {!user && !hideAuthLinks && (
            <>
              <Link className="nav-link" to="/dashboard">
                Home
              </Link>

              <Link className="nav-link" to="/login">
                Login
              </Link>

              <Link className="register-btn" to="/register">
                Register
              </Link>
            </>
          )}

          {user && (
            <>
              <Link className="nav-link" to="/dashboard">
                Dashboard
              </Link>

              {user.role === "owner" && (
                <Link className="nav-link" to="/owner/bookings">
                  Bookings
                  {pendingCount > 0 && (
                    <span className="nav-badge">{pendingCount}</span>
                  )}
                </Link>
              )}

              {user.role === "tenant" && (
                <Link className="nav-link" to="/bookings">
                  My Bookings
                  {pendingCount > 0 && (
                    <span className="nav-badge">{pendingCount}</span>
                  )}
                </Link>
              )}

              {user.role === "tenant" && (
                <Link
                  to="/saved"
                  className="nav-heart-link"
                  aria-label="Saved properties"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill={
                      location.pathname === "/saved"
                        ? "currentColor"
                        : "none"
                    }
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 20.25c-.3 0-.6-.1-.8-.3C7.1 16.6 3 13 3 8.9 3 6.2 5.1 4 7.8 4c1.7 0 3.2.9 4.2 2.3C13 4.9 14.5 4 16.2 4 18.9 4 21 6.2 21 8.9c0 4.1-4.1 7.7-8.2 11.05-.2.2-.5.3-.8.3Z" />
                  </svg>
                </Link>
              )}

              <div className="user-profile-wrapper">
                <button
                  type="button"
                  className="user-menu"
                  onClick={() =>
                    setShowProfile((prev) => !prev)
                  }
                >
                  {/* <div className="user-avatar">
                    {user.name
                      ? user.name.charAt(0).toUpperCase()
                      : "U"}
                  </div> */}


<div className="user-avatar">
  {user.profilePicture?.url ? (
    <img
      src={user.profilePicture.url}
      alt={user.name || "User"}
    />
  ) : (
    user.name
      ? user.name.slice(0, 3)
      : "Use"
  )}
</div>

                  <span className="user-name">
                    {user.name || "User"}
                  </span>

                  <span
                    className={`profile-chevron ${
                      showProfile ? "open" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>
{/* 
                {showProfile && (
                  <ProfilePopup
                    onClose={() => setShowProfile(false)}
                  />
                )} */}


{showProfile && (
  <ProfilePopup
    onClose={() => setShowProfile(false)}
    onProfileUpdated={(updatedUser) => {
      setUser(updatedUser);
    }}
  />
)}

              </div>

              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}










