





import  { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginHeader from "../../components/LoginHeader";
import "../../styles/auth.css";
import { API_BASE } from "../../config/api";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const [userTypeOpen, setUserTypeOpen] = useState(false);

const userTypeRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      userTypeRef.current &&
      !userTypeRef.current.contains(event.target)
    ) {
      setUserTypeOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("touchstart", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
    document.removeEventListener("touchstart", handleClickOutside);
  };
}, []);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

  try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          role: userType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      navigate("/login", {
        state: {
          message: data.message,
        },
      });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoginHeader />

      <div className="register-scene">

        {/* 3D Background */}
        <div className="register-orb register-orb-one"></div>
        <div className="register-orb register-orb-two"></div>
        <div className="register-orb register-orb-three"></div>

        <div className="register-grid-floor"></div>

        {/* 3D Register Card */}
        <div className="register-3d-card">

          <div className="register-card-shine"></div>

          <div className="register-content">

            {/* Icon */}
            <div className="register-icon-3d">
              <span>✨</span>
            </div>

            <h1 className="register-title-3d">
              Create Account
            </h1>

            <p className="register-subtitle">
              Join us and find your perfect place
            </p>

            <form
              className="register-form-3d"
              onSubmit={handleSubmit}
            >

              {/* Full Name */}
              <div className="register-input-3d">
                <span className="register-input-icon">
                  👤
                </span>

                <input
                  type="text"
                  placeholder="Renter Full Name / Owner Name"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  required
                />
              </div>

              {/* Email */}
              <div className="register-input-3d">
                <span className="register-input-icon">
                  ✉
                </span>

                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />
              </div>

              {/* Password */}
              <div className="register-input-3d">
                <span className="register-input-icon">
                  🔑
                </span>

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />
              </div>









              {/* User Type */}
              {/* <div className="register-select-wrapper">

                <span className="register-input-icon">
                  🏠
                </span>

                <select
                  className="register-select-3d"
                  value={userType}
                  onChange={(e) =>
                    setUserType(e.target.value)
                  }
                  required
                >
                  <option value="">
                    Select User Type
                  </option>

                  <option value="owner">
                    Owner
                  </option>

                  <option value="tenant">
                    Renter
                  </option>
                </select>

                <span className="select-arrow">
                  ▾
                </span>

              </div>
 */}








{/* User Type */}
<div
  className={`custom-select-3d ${
    userTypeOpen ? "custom-select-open" : ""
  }`}
  ref={userTypeRef}
>
  <button
    type="button"
    className="custom-select-trigger"
    onClick={() => setUserTypeOpen((prev) => !prev)}
  >
    <span className="register-input-icon">
      🏠
    </span>

    <span
      className={
        userType
          ? "custom-select-value"
          : "custom-select-placeholder"
      }
    >
      {userType === "owner"
        ? "Owner"
        : userType === "tenant"
        ? "Renter"
        : "Select User Type"}
    </span>

    <span
      className={`custom-select-arrow ${
        userTypeOpen ? "arrow-up" : ""
      }`}
    >
      ▾
    </span>
  </button>

  {userTypeOpen && (
    <div className="custom-select-menu">

      <button
        type="button"
        className="custom-select-option"
        onClick={() => {
          setUserType("owner");
          setUserTypeOpen(false);
        }}
      >
        <span>👨‍💼</span>
        <span>Owner</span>
      </button>

      <button
        type="button"
        className="custom-select-option"
        onClick={() => {
          setUserType("tenant");
          setUserTypeOpen(false);
        }}
      >
        <span>🏠</span>
        <span>Renter</span>
      </button>

    </div>
  )}
</div>












              {/* Button */}
              <button
                className="register-button-3d"
                type="submit"
                disabled={loading}
              >
                <span>
                  {loading
                    ? "CREATING ACCOUNT..."
                    : "CREATE ACCOUNT"}
                </span>
              </button>

              {/* Error */}
              {error && (
                <div className="register-message register-error">
                  {error}
                </div>
              )}

              {/* Footer */}
              <div className="register-footer-3d">
                Already have an account?

                <Link to="/login">
                  Sign In
                </Link>
              </div>

            </form>

          </div>
        </div>
      </div>
    </>
  );
}