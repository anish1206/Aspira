// src/pages/Groups.js
import React from "react";

const GroupItem = ({ name, members, description, color = "blue" }) => {
    return (
        <div className="group relative overflow-hidden rounded-2xl transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <div className="bg-card rounded-2xl border border-border p-6 hover:shadow-md transition-all duration-300 h-full">
                <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm`}>
                        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M7 10.5a3.5 3.5 0 1 1 3.5 3.5M3 20a5 5 0 0 1 5-5h2c.6 0 1.18.11 1.71.31M16 11a3.5 3.5 0 1 0-3.5-3.5M19 21a5 5 0 0 0-5-5h-.5" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{name}</h3>
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{description}</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">{members} members</span>
                            <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                            <span className="text-xs text-green-500 font-medium">Active</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-xs font-medium text-primary group-hover:text-primary/80 transition-colors">
                        Join Group
                    </span>
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" strokeWidth="2">
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
        <div className="min-h-[calc(100vh-80px)] bg-background overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 pt-10 pb-24">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-light leading-tight text-foreground mb-4">
                        Support <span className="font-semibold">Groups</span>
                    </h1>
                    <p className="text-xl text-muted-foreground">Connect with others who understand your journey</p>
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
                <div className="bg-card rounded-3xl border border-border p-8 text-center mb-12 shadow-sm">
                    <div className="mb-6">
                        <div className="text-4xl mb-4">🤝</div>
                        <h3 className="text-2xl font-semibold text-foreground mb-3">Can't find what you're looking for?</h3>
                        <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
                            Let us know what kind of support group would help you most. We're always looking to create new communities.
                        </p>
                    </div>
                    <button className="bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                        <span className="flex items-center justify-center space-x-2">
                            <span>✨</span>
                            <span>Suggest a Group</span>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
