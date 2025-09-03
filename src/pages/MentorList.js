// src/pages/MentorList.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function MentorList() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMentors() {
      try {
        const mentorsCol = collection(db, "mentors");
        const snapshot = await getDocs(mentorsCol);
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMentors(items);
      } catch (err) {
        setError("Failed to load mentors");
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMentors();
  }, []);

  if (loading) {
    return <div className="p-5 text-gray-600">Loading mentors...</div>;
  }

  if (error) {
    return <div className="p-5 text-red-600">{error}</div>;
  }

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Mentors</h2>
      {mentors.length === 0 && (
        <div className="text-gray-600">No mentors found.</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {mentors.map((mentor) => (
          <Link
            key={mentor.id}
            to={`/mentors/${mentor.id}`}
            className="block border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex items-start gap-4 p-4">
              {mentor.photoURL ? (
                <img
                  src={mentor.photoURL}
                  alt={mentor.name}
                  className="w-20 h-20 object-cover rounded-full border"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200" />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                {Array.isArray(mentor.specialties) && mentor.specialties.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {mentor.specialties.join(", ")}
                  </p>
                )}
                {mentor.bio && (
                  <p className="text-sm text-gray-700 mt-2 line-clamp-3">{mentor.bio}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MentorList;


