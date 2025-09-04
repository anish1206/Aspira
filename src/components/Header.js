// src/components/Header.js
import React from "react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="relative z-50 w-full px-6 py-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <span className="text-3xl font-berkeley-mono font-bold text-foreground">Aspira</span>
        </div>
        
        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
          <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </a>
        </nav>
        
        {/* Auth toggle buttons */}
        <div className="flex items-center bg-muted rounded-full p-1">
          <Link 
            to="/login" 
            className="px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 bg-primary text-primary-foreground shadow-sm"
          >
            Login
          </Link>
          <Link 
            to="/login" 
            className="px-6 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
};
