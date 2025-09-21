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
    return (
      <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full opacity-60" style={{background: 'radial-gradient(circle, #0f2027 0%, #203a43 40%, rgba(44,83,100,0.25) 70%, transparent 100%)'}} />
        </div>
        <div className="relative z-10 text-muted-foreground text-lg">Loading mentors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full opacity-60" style={{background: 'radial-gradient(circle, #0f2027 0%, #203a43 40%, rgba(44,83,100,0.25) 70%, transparent 100%)'}} />
        </div>
        <div className="relative z-10 text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full opacity-60" style={{background: 'radial-gradient(circle, #0f2027 0%, #203a43 40%, rgba(44,83,100,0.25) 70%, transparent 100%)'}} />
        <div className="absolute top-1/3 -right-40 w-[560px] h-[560px] rounded-full opacity-80" style={{background: 'radial-gradient(circle, #b91c1c 0%, #dc2626 25%, #f97316 45%, #fbbf24 65%, rgba(251,191,36,0.25) 80%, transparent 100%)'}} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-24">
        <h1 className="text-4xl md:text-5xl font-light leading-tight text-foreground mb-2">
          Meet Your <span className="font-semibold">Mentors</span>
        </h1>
        <p className="text-muted-foreground mb-10">Connect with experienced guides ready to support your journey</p>
        
        {mentors.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4ZM12 14c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4Z" />
              </svg>
            </div>
            <p className="text-muted-foreground text-lg">No mentors available at the moment</p>
            <p className="text-muted-foreground text-sm mt-2">Check back soon for new mentors joining our community</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Link
                key={mentor.id}
                to={`/mentors/${mentor.id}`}
                className="group relative overflow-hidden rounded-2xl p-[1px] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {/* Gradient border */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/40 via-orange-300/40 to-pink-300/40 opacity-60 group-hover:opacity-80 blur-sm transition-opacity" />
                <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.05)] group-hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15)] transition-shadow h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4ZM12 14c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4Z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground truncate">{mentor.name}</h3>
                      {Array.isArray(mentor.specialties) && mentor.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {mentor.specialties.slice(0, 2).map((specialty, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium"
                            >
                              {specialty}
                            </span>
                          ))}
                          {mentor.specialties.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                              +{mentor.specialties.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {mentor.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{mentor.bio}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200/50">
                    <span className="text-xs font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
                      Book Session
                    </span>
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17 17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MentorList;


