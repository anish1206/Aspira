// src/components/Header.js
import React from "react";
import { Link } from "react-router-dom";

export const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <header className="relative z-50 w-full px-6 py-6">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                    <span className="text-4xl md:text-6xl jersey-15-regular text-foreground">Aspira</span>
                </div>

                {/* Desktop Navigation */}
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

                {/* Desktop Auth toggle buttons */}
                <div className="hidden md:flex items-center bg-muted rounded-full p-1">
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

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-foreground"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"} />
                    </svg>
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border p-6 md:hidden flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top-5">
                    <a
                        href="#features"
                        className="text-lg font-medium text-foreground py-2 border-b border-border/50"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Features
                    </a>
                    <a
                        href="#about"
                        className="text-lg font-medium text-foreground py-2 border-b border-border/50"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        About
                    </a>
                    <a
                        href="#contact"
                        className="text-lg font-medium text-foreground py-2 border-b border-border/50"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Contact
                    </a>
                    <div className="flex flex-col gap-3 mt-2">
                        <Link
                            to="/login"
                            className="w-full text-center px-6 py-3 rounded-xl text-base font-medium bg-primary text-primary-foreground shadow-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Login
                        </Link>
                        <Link
                            to="/login"
                            className="w-full text-center px-6 py-3 rounded-xl text-base font-medium bg-muted text-foreground"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};
