import React, { useEffect, useState } from "react";
import { API_BASE } from "../../config/api";
import { useNavigate } from "react-router-dom";
import LoginHeader from "../../components/LoginHeader";
import PropertyMiniGallery from "../../components/PropertyMiniGallery";

export default function OwnerBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [sendingId, setSendingId] = useState(null);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [toasts, setToasts] = useState([]);

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

  useEffect(() => {
    fetchBookings();
    const intervalId = setInterval(() => {
      fetchBookings({ quiet: true });
    }, 5000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchBookings(options = {}) {
    const { quiet = false } = options;
    if (!quiet) {
      setLoading(true);
    }
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/bookings/owner`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await readApiResponse(res);
      if (!res.ok) throw new Error(data.message || "Failed to fetch bookings");
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message || "Failed to fetch bookings");
    } finally {
      if (!quiet) {
        setLoading(false);
      }
    }
  }

  async function updateStatus(id, status) {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await readApiResponse(res);
      if (!res.ok) throw new Error(data.message || "Failed to update");
      fetchBookings();
    } catch (err) {
      setError(err.message || "Failed to update booking");
    }
  }

  async function handleSendMessage(id) {
    const text = (replyDrafts[id] || "").trim();
    if (!text) return;

    setSendingId(id);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      const data = await readApiResponse(res);
      if (!res.ok) throw new Error(data.message || "Failed to send message");
      setReplyDrafts((prev) => ({ ...prev, [id]: "" }));
      pushToast({
        id: `msg-sent-${id}-${Date.now()}`,
        status: "sent",
        text: "Message sent",
      });
      fetchBookings();
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setSendingId(null);
    }
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

  async function handleDeleteMessage(bookingId, messageId) {
    setDeletingMessageId(messageId);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/api/bookings/${bookingId}/messages/${messageId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await readApiResponse(res);
      if (!res.ok) throw new Error(data.message || "Failed to delete message");
      pushToast({
        id: `msg-deleted-${messageId}-${Date.now()}`,
        status: "deleted",
        text: "Message deleted",
      });
      fetchBookings();
    } catch (err) {
      setError(err.message || "Failed to delete message");
    } finally {
      setDeletingMessageId(null);
    }
  }

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

      <div className="page-shell section-card">
        <div>
          <div className="eyebrow">Owner bookings</div>
          <h2 className="page-title">Your Bookings</h2>
        </div>
        {loading && <div>Loading...</div>}
        {error && (
          <div
            className="empty-state"
            style={{ color: "#b91c1c" }}>
            {error}
          </div>
        )}
        {bookings.length === 0 && !loading ? (
          <div className="empty-state">No bookings yet.</div>
        ) : (
          bookings.map((b) => (
            <div
              key={b._id}
              className={`booking-card booking-ticket booking-ticket--${b.bookingStatus}`}>
              <div className="booking-ticket__body">
                <div className="booking-ticket__name">
                  {b.userName} <span className="muted">— {b.phone}</span>
                </div>
                {b.message && (
                  <div className="booking-ticket__message">{b.message}</div>
                )}
                {b.property && (
                  <div
                    className="booking-ticket__property booking-ticket__property--clickable"
                    onClick={() =>
                      navigate(`/property/${b.property._id}`, {
                        state: { property: b.property },
                      })
                    }>
                    <PropertyMiniGallery images={b.property.propertyImages} />
                    <div className="booking-ticket__property-text">
                      <div className="booking-ticket__property-type">
                        {b.property.propertyType} — {b.property.ownerName}
                      </div>
                      <div className="muted">
                        {b.property.propertyAddress}
                      </div>
                    </div>
                  </div>
                )}

                <div className="booking-thread">
                  <div className="booking-thread__list">
                    {(b.messages || []).length === 0 ? (
                      <div className="muted booking-thread__empty">
                        No messages yet.
                      </div>
                    ) : (
                      b.messages.map((m) => (
                        <div
                          key={m._id}
                          className={`booking-message ${
                            m.senderRole === "owner"
                              ? "booking-message--mine"
                              : "booking-message--theirs"
                          }`}>
                          <div className="booking-message__meta">
                            {m.senderName || m.senderRole}
                            {m.createdAt
                              ? ` · ${new Date(m.createdAt).toLocaleString()}`
                              : ""}
                          </div>
                          <div className="booking-message__text">
                            {m.text}
                          </div>
                          {/* {String(m.senderId) === String(user?.id) && ( */}
                          {String(m.senderId) === String(user?.id || user?._id) && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteMessage(b._id, m._id)
                              }
                              disabled={deletingMessageId === m._id}
                              className="booking-message__delete"
                              aria-label="Delete message">
                              ×
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <form
                    className="booking-thread__form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage(b._id);
                    }}>
                    <input
                      placeholder="Reply to tenant..."
                      value={replyDrafts[b._id] || ""}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({
                          ...prev,
                          [b._id]: e.target.value,
                        }))
                      }
                    />
                    <button
                      type="submit"
                      disabled={sendingId === b._id}
                      className="button button-secondary button-sm">
                      {sendingId === b._id ? "Sending..." : "Send"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="booking-ticket__stub">
                <span
                  className={`status-badge status-badge--${b.bookingStatus}`}>
                  {b.bookingStatus}
                </span>

                {b.bookingStatus === "pending" ? (
                  <div className="booking-ticket__actions">
                    <button
                      onClick={() => updateStatus(b._id, "accepted")}
                      className="button button-success button-sm">
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(b._id, "rejected")}
                      className="button button-danger button-sm">
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="booking-ticket__decided muted">
                    Decision recorded
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}