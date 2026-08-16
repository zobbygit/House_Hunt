import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";

// export default function ProfilePopup({ onClose }) {

export default function ProfilePopup({
  onClose,
  onProfileUpdated,
}) {

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const localUser = JSON.parse(localStorage.getItem("user") || "null");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    fetchProfile();

    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

async function fetchProfile() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load profile");
      setProfile(data.user);
      setName(data.user.name || "");
      setPhone(data.user.phone || "");
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  function handleAvatarSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      if (avatarFile) formData.append("profilePicture", avatarFile);

        const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save profile");

      setProfile(data.user);

      // Keep localStorage in sync so the header/avatar-initial elsewhere
      // reflect the new name immediately without a full reload.
    //   const updatedLocalUser = { ...localUser, name: data.user.name };
    //   localStorage.setItem("user", JSON.stringify(updatedLocalUser));
    const updatedLocalUser = {
  ...localUser,
  name: data.user.name,
  phone: data.user.phone,
  profilePicture: data.user.profilePicture,
};

localStorage.setItem(
  "user",
  JSON.stringify(updatedLocalUser)
);
onProfileUpdated(updatedLocalUser);

      setEditing(false);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarFile(null);
      setAvatarPreview("");
    } catch (err) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  function handleViewSaved() {
    onClose();
    navigate("/saved");
  }

  const avatarSrc = avatarPreview || profile?.profilePicture?.url;

  return (
    <div
      className="profile-popup-overlay"
      onClick={onClose}>
      <div
        className="profile-popup-panel"
        onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="profile-popup-close"
          aria-label="Close">
          ×
        </button>

        {loading && <div>Loading...</div>}
        {error && (
          <div
            className="empty-state"
            style={{ color: "#b91c1c" }}>
            {error}
          </div>
        )}

        {profile && !loading && (
          <>
            <div className="profile-popup-avatar-row">
              <div className="profile-popup-avatar">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={profile.name}
                  />
                ) : (
                  <span>{profile.name?.charAt(0).toUpperCase() || "U"}</span>
                )}
              </div>
              <div>
                <h3 className="profile-popup-name">{profile.name}</h3>
                <span className="role-badge">{profile.role}</span>
              </div>
            </div>

            {!editing ? (
              <>
                <div className="profile-popup-field">
                  <div className="muted">Email</div>
                  <div>{profile.email}</div>
                </div>
                <div className="profile-popup-field">
                  <div className="muted">Phone</div>
                  <div>{profile.phone || "Not added"}</div>
                </div>

                <div className="profile-popup-actions">
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="button button-secondary">
                    Edit Profile
                  </button>
                  {profile.role === "tenant" && (
                    <button
                      type="button"
                      onClick={handleViewSaved}
                      className="button button-secondary">
                      Saved Properties
                    </button>
                  )}
                </div>
              </>
            ) : (
              <form
                onSubmit={handleSave}
                className="listing-form">
                <input
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <div>
                  <label
                    htmlFor="avatar-input"
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
                      {avatarFile ? avatarFile.name : "Change photo"}
                    </span>
                  </label>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="visually-hidden-input"
                  />
                </div>

                <div className="profile-popup-actions">
                  <button
                    type="submit"
                    disabled={saving}
                    className="button button-primary">
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="button button-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}