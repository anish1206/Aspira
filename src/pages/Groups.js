// src/pages/Groups.js
import React from "react";
import { Link } from "react-router-dom";

const GroupItem = ({ name, members, description, color = "blue" }) => {
  const colorMap = {
    blue: "from-blue-400 to-blue-600",
    green: "from-green-400 to-green-600", 
    purple: "from-purple-400 to-purple-600",
    orange: "from-orange-400 to-orange-600"
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl transition-transform hover:scale-[1.02] active:scale-[0.98]">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 h-full">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white shadow-lg`}>
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 10.5a3.5 3.5 0 1 1 3.5 3.5M3 20a5 5 0 0 1 5-5h2c.6 0 1.18.11 1.71.31M16 11a3.5 3.5 0 1 0-3.5-3.5M19 21a5 5 0 0 0-5-5h-.5" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">{name}</h3>
            <p className="text-sm text-purple-200 mb-3 leading-relaxed">{description}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-purple-300">{members} members</span>
              <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
              <span className="text-xs text-green-400 font-medium">Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          <span className="text-xs font-medium text-purple-300 group-hover:text-white transition-colors">
            Join Group
          </span>
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-purple-300 group-hover:translate-x-1 group-hover:text-white transition-all" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17 17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default function Groups() {
  const groups = [
    {
      name: "Anxiety Support",
      members: 24,
      description: "A safe space to share experiences and coping strategies for anxiety management.",
      color: "blue"
    },
    {
      name: "Exam Stress",
      members: 18,
      description: "Support group for students dealing with academic pressure and exam anxiety.",
      color: "green"
    },
    {
      name: "Sleep & Calm",
      members: 31,
      description: "Tips and techniques for better sleep hygiene and relaxation practices.",
      color: "purple"
    },
    {
      name: "Mindful Living",
      members: 42,
      description: "Exploring mindfulness practices and incorporating them into daily life.",
      color: "orange"
    }
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-y-auto">
      <div className="min-h-full p-6 pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-4">
              Support <span className="font-light">Groups</span>
            </h1>
            <p className="text-xl text-purple-200">Connect with others who understand your journey</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {groups.map((group, index) => (
              <GroupItem 
                key={index}
                name={group.name}
                members={group.members}
                description={group.description}
                color={group.color}
              />
            ))}
          </div>

          {/* Call to action */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 text-center mb-12">
            <div className="mb-6">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-2xl font-semibold text-white mb-3">Can't find what you're looking for?</h3>
              <p className="text-purple-200 text-lg mb-6 max-w-2xl mx-auto">
                Let us know what kind of support group would help you most. We're always looking to create new communities.
              </p>
            </div>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <span className="flex items-center justify-center space-x-2">
                <span>✨</span>
                <span>Suggest a Group</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


