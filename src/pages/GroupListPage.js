import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function GroupListPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadGroups = async () => {
      try {
        const snap = await getDocs(collection(db, "peerGroups"));
        if (!isMounted) return;
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setGroups(data);
      } catch (err) {
        setError("Failed to load groups. Please try again.");
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadGroups();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-600">Loading groups…</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 mb-3">{error}</div>
        <button className="px-4 py-2 bg-gray-900 text-white rounded" onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Peer Support Groups</h2>
      {groups.length === 0 ? (
        <div className="text-gray-600">No groups available yet.</div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <Link
              key={g.id}
              to={`/groups/${g.id}`}
              className="group block rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-800">{g.name || g.id}</h3>
              </div>
              {g.description && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{g.description}</p>
              )}
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-blue-600">Open
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17 17 7M7 7h10v10" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


