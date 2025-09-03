// src/pages/MentorBooking.js
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth";

function formatSlotRange(slot) {
  try {
    const start = new Date(slot.startTime.seconds * 1000);
    const end = new Date(slot.endTime.seconds * 1000);
    const dateStr = start.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const startStr = start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    const endStr = end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    return `${startStr} - ${endStr} on ${dateStr}`;
  } catch (e) {
    return "Invalid time";
  }
}

function MentorBooking() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentor, setMentor] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingStatus, setBookingStatus] = useState({ loading: false, error: null, success: false });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const mentorRef = doc(db, "mentors", mentorId);
        const availRef = doc(db, "mentorAvailability", mentorId);
        const [mentorSnap, availSnap] = await Promise.all([
          getDoc(mentorRef),
          getDoc(availRef),
        ]);

        if (!mentorSnap.exists()) {
          throw new Error("Mentor not found");
        }
        setMentor({ id: mentorSnap.id, ...mentorSnap.data() });

        if (availSnap.exists()) {
          setAvailability({ id: availSnap.id, ...availSnap.data() });
        } else {
          setAvailability({ id: mentorId, slots: [] });
        }
      } catch (err) {
        setError(err.message || "Failed to load mentor data");
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (mentorId) {
      fetchData();
    }
  }, [mentorId]);

  const slots = useMemo(() => (availability?.slots ? availability.slots : []), [availability]);

  // src/pages/MentorBooking.js

// ... (keep all your other imports and component code) ...

const handleBookNow = async (slot) => {
    if (!user) {
        navigate("/login", { replace: true });
        return;
    }

    setBookingStatus({ loading: true, error: null, success: false });

    try {
        const apiBase = process.env.REACT_APP_API_BASE || '';
        const response = await fetch(`${apiBase}/api/bookSession`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mentorId: mentorId,
                slot: slot,
                userId: user.uid,
                userEmail: user.email,
            }),
        });

        // Try to parse JSON; if not JSON, read as text and throw a clearer error
        const contentType = response.headers.get('content-type') || '';
        let data;
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          throw new Error(text || `Unexpected response (${response.status}) from booking API`);
        }

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to book the session.");
        }

        setBookingStatus({ loading: false, error: null, success: true });

        // Optimistically mark the slot as booked in local state
        setAvailability((prev) => {
          if (!prev) return prev;
          const updated = (prev.slots || []).map((s) =>
            s?.startTime?.seconds === slot.startTime?.seconds
              ? { ...s, isBooked: true, bookedBy: user.uid }
              : s
          );
          return { ...prev, slots: updated };
        });

        alert(`Booking successful! A calendar invite has been sent.${data.meetLink ? ` Meet link: ${data.meetLink}` : ''}`);

    } catch (error) {
        console.error("Frontend booking error:", error);
        setBookingStatus({ loading: false, error: error.message, success: false });
        alert(`Error: ${error.message}`);
    }
};

// In your JSX, you can use the bookingStatus to show messages to the user
// e.g., if (bookingStatus.loading) return <p>Booking your session...</p>;
// And remember to disable the button when booking is in progress
// <button onClick={() => handleBookNow(slot)} disabled={bookingStatus.loading}>

  if (loading) {
    return <div className="p-5 text-gray-600">Loading mentor...</div>;
  }

  if (error) {
    return <div className="p-5 text-red-600">{error}</div>;
  }

  if (!mentor) {
    return <div className="p-5 text-gray-600">Mentor not found.</div>;
  }

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-start gap-4 bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
        {mentor.photoURL ? (
          <img
            src={mentor.photoURL}
            alt={mentor.name}
            className="w-24 h-24 object-cover rounded-full border"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200" />
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{mentor.name}</h2>
          {mentor.email && (
            <p className="text-sm text-gray-600 mt-1">{mentor.email}</p>
          )}
          {Array.isArray(mentor.specialties) && mentor.specialties.length > 0 && (
            <p className="text-sm text-gray-700 mt-2">
              Specialties: {mentor.specialties.join(", ")}
            </p>
          )}
          {mentor.bio && (
            <p className="text-gray-800 mt-3">{mentor.bio}</p>
          )}
        </div>
      </div>

      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Available Time Slots</h3>
        {slots.length === 0 ? (
          <div className="text-gray-600">No available slots.</div>
        ) : (
          <ul className="space-y-3">
            {slots.map((slot, idx) => (
              <li
                key={`${slot.startTime?.seconds || ""}-${idx}`}
                className="flex items-center justify-between p-3 border border-gray-100 rounded hover:bg-gray-50"
              >
                <div className="text-gray-800">{formatSlotRange(slot)}</div>
                {slot.isBooked ? (
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded cursor-not-allowed"
                  >
                    Booked
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleBookNow(slot)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Book Now
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MentorBooking;


