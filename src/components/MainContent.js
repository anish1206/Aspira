// src/components/MainContent.js
import React from "react";
import { Link } from "react-router-dom";

export const MainContent = () => {
  return (
    <main className="relative z-10 flex-1 flex items-center justify-center px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Title */}
        <h1 className="text-6xl md:text-8xl font-pp-editorial font-light text-foreground mb-6 leading-tight">
          Trans<i>f</i>orm Yo<i>u</i>r
          <br />
          Mental{" "}
          <span className="font-berkeley-mono font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Wellness
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Unlock the power of AI-driven mental health support, connect with caring peers, 
          and track your emotional journey with personalized insights.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link 
            to="/login" 
            className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground px-10 py-4 rounded-xl text-lg font-medium hover:opacity-90 transition-all duration-200 transform hover:scale-105 shadow-xl"
          >
            Start Your Journey
          </Link>
          <button className="text-foreground px-8 py-4 rounded-xl text-lg font-medium border border-border hover:bg-accent transition-all duration-200 backdrop-blur-sm">
            Discover Features
          </button>
        </div>
        
        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 hover:bg-card/70 transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">�</span>
            </div>
            <h3 className="text-xl font-medium text-foreground mb-4">AI Mental Health Assistant</h3>
            <p className="text-muted-foreground leading-relaxed">
              Get instant support with our advanced AI companion that understands your emotions and provides personalized guidance 24/7.
            </p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 hover:bg-card/70 transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">�</span>
            </div>
            <h3 className="text-xl font-medium text-foreground mb-4">Supportive Community</h3>
            <p className="text-muted-foreground leading-relaxed">
              Connect with like-minded individuals in a safe, moderated environment where you can share experiences and find support.
            </p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 hover:bg-card/70 transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">�</span>
            </div>
            <h3 className="text-xl font-medium text-foreground mb-4">Smart Mood Tracking</h3>
            <p className="text-muted-foreground leading-relaxed">
              Monitor your emotional patterns with intelligent analytics that help you understand your mental health journey better.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};
