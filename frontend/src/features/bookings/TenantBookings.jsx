import  { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LoginHeader from "../../components/LoginHeader";
import PropertyMiniGallery from "../../components/PropertyMiniGallery";
import { API_BASE } from "../../config/api";

export default function TenantBookings({ showHeader = true }) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [sendingId, setSendingId] = useState(null);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const previousStatusesRef = useRef(null);

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
      const res = await fetch(`${API_BASE}/api/bookings/mine`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await readApiResponse(res);
      if (!res.ok) throw new Error(data.message || "Failed to fetch bookings");
      const nextBookings = data.bookings || [];
 
      detectStatusChanges(nextBookings);
 
      setBookings(nextBookings);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || "Failed to fetch bookings");
    } finally {
      if (!quiet) {
        setLoading(false);
      }
    }
  }

  function detectStatusChanges(nextBookings) {
    const previousMap = previousStatusesRef.current;

    // First fetch after mount: just record the baseline, don't notify.
    if (previousMap) {
      nextBookings.forEach((b) => {
        const prevStatus = previousMap[b._id];
        if (
          prevStatus &&
          prevStatus !== b.bookingStatus &&
          (b.bookingStatus === "accepted" || b.bookingStatus === "rejected")
        ) {
          const propertyLabel = b.property?.propertyType
            ? `${b.property.propertyType} — ${b.property.propertyAddress || ""}`
            : "your booking";
          pushToast({
            id: `${b._id}-${b.bookingStatus}`,
            status: b.bookingStatus,
            text:
              b.bookingStatus === "accepted"
                ? `Accepted: ${propertyLabel}`
                : `Declined: ${propertyLabel}`,
          });
        }
      });
    }

    const nextMap = {};
    nextBookings.forEach((b) => {
      nextMap[b._id] = b.bookingStatus;
    });
    previousStatusesRef.current = nextMap;
  }

  function pushToast(toast) {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 6000);
  }

  function dismissToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleCancel(id) {
    if (!window.confirm("Withdraw this booking request?")) return;
 
    setCancellingId(id);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readApiResponse(res);
      if (!res.ok) throw new Error(data.message || "Failed to cancel booking");
      fetchBookings();
    } catch (err) {
      setError(err.message || "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  }

  async function handleSendMessage(id) {
    const text = (replyDrafts[id] || "").trim();
    if (!text) return;
 
    setSendingId(id);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/api/bookings/${id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text }),
        },
      );
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
        <div>
          <div className="eyebrow">Bookings</div>
          <h2 className="page-title">My Bookings</h2>
        </div>
        {lastUpdated && !loading && (
          <div className="muted live-status">
            <span
              className="live-dot"
              aria-hidden="true"
            />
            Auto-updated at {lastUpdated}
          </div>
        )}
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
          bookings.map((booking) => (
            <div
              key={booking._id}
              className={`booking-card booking-ticket booking-ticket--${booking.bookingStatus}`}>
              <div className="booking-ticket__body">
                <div className="booking-ticket__name">{booking.userName}</div>
                <div className="muted">Phone: {booking.phone}</div>
                {booking.message && (
                  <div className="booking-ticket__message">
                    {booking.message}
                  </div>
                )}
                {booking.property && (
                  <div
                    className="booking-ticket__property booking-ticket__property--clickable"
                    onClick={() =>
                      navigate(`/property/${booking.property._id}`, {
                        state: { property: booking.property },
                      })
                    }>
                    <PropertyMiniGallery
                      images={booking.property.propertyImages}
                    />
                    <div className="booking-ticket__property-text">
                      <div className="booking-ticket__property-type">
                        {booking.property.propertyType} -{" "}
                        {booking.property.ownerName}
                      </div>
                      <div className="muted">
                        {booking.property.propertyAddress}
                      </div>
                    </div>
                  </div>
                )}

                <div className="booking-thread">
                  <div className="booking-thread__list">
                    {(booking.messages || []).length === 0 ? (
                      <div className="muted booking-thread__empty">
                        No messages yet.
                      </div>
                    ) : (
                      booking.messages.map((m) => (
                        <div
                          key={m._id}
                          className={`booking-message ${
                            m.senderRole === "tenant"
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
                        {String(m.senderId) === String(user?.id || user?._id) && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteMessage(booking._id, m._id)
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
                      handleSendMessage(booking._id);
                    }}>
                    <input
                      placeholder="Message the owner..."
                      value={replyDrafts[booking._id] || ""}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({
                          ...prev,
                          [booking._id]: e.target.value,
                        }))
                      }
                    />
                    <button
                      type="submit"
                      disabled={sendingId === booking._id}
                      className="button button-secondary button-sm">
                      {sendingId === booking._id ? "Sending..." : "Send"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="booking-ticket__stub">
                <span
                  className={`status-badge status-badge--${booking.bookingStatus}`}>
                  {booking.bookingStatus}
                </span>

                {booking.bookingStatus === "pending" && (
                  <button
                    onClick={() => handleCancel(booking._id)}
                    disabled={cancellingId === booking._id}
                    className="button button-danger button-sm">
                    {cancellingId === booking._id
                      ? "Cancelling..."
                      : "Cancel request"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}