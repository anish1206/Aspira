import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Your Firebase config file
import { useAuth } from '../auth'; // Your auth context hook

const MentorBooking = () => {
    const { mentorId } = useParams(); // Get mentor ID from the URL (e.g., /mentors/anish)
    const { user } = useAuth(); // Get the currently logged-in user

    // State for the mentor's profile data
    const [mentorData, setMentorData] = useState(null);
    // State for the mentor's available time slots
    const [availabilityData, setAvailabilityData] = useState(null);
    // State for the page's initial loading status
    const [loading, setLoading] = useState(true);
    // State for any errors during data fetching
    const [error, setError] = useState(null);

    // State to manage the status of the booking API call
    const [bookingStatus, setBookingStatus] = useState({
        loading: false,
        error: null,
        success: false,
    });

    // A function to fetch all necessary data from Firestore
    const fetchData = useCallback(async () => {
        if (!mentorId) return;
        setLoading(true);
        try {
            // Fetch mentor's profile
            const mentorRef = doc(db, 'mentors', mentorId);
            const mentorSnap = await getDoc(mentorRef);

            // Fetch mentor's availability
            const availabilityRef = doc(db, 'mentorAvailability', mentorId);
            const availabilitySnap = await getDoc(availabilityRef);

            if (mentorSnap.exists() && availabilitySnap.exists()) {
                setMentorData(mentorSnap.data());
                setAvailabilityData(availabilitySnap.data());
            } else {
                throw new Error('Mentor not found or availability not set.');
            }
        } catch (err) {
            console.error('Error fetching mentor data:', err);
            setError('Could not load mentor details. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [mentorId]);

    // Run the data fetching function when the component mounts
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // This is the main function called when a user clicks "Book Now"
    const handleBookNow = async (slot) => {
        if (!user) {
            alert('Please log in or sign up to book a session.');
            return;
        }

        // Set the state to show a loading indicator
        setBookingStatus({ loading: true, error: null, success: false });

        try {
            // Call our Vercel serverless function
            const response = await fetch('/api/bookSession', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mentorId: mentorId,
                    slot: slot,
                    userId: user.uid,
                    userEmail: user.email, // Passing the user's email for the confirmation
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // If the server returns an error, throw it to the catch block
                throw new Error(data.message || 'An unknown error occurred.');
            }

            // On success, update the state and show a confirmation
            setBookingStatus({ loading: false, error: null, success: true });
            alert(`Booking successful! A confirmation email has been sent to ${user.email}.`);

            // Refresh the availability data to show the slot as booked
            fetchData();

        } catch (err) {
            // On failure, update the state and show the error
            console.error('Frontend booking error:', err);
            setBookingStatus({ loading: false, error: err.message, success: false });
            alert(`Booking Failed: ${err.message}`);
        }
    };

    // --- Render Logic ---

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-foreground text-lg">Loading mentor details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-destructive text-lg">{error}</div>
            </div>
        );
    }

    if (!mentorData || !availabilityData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-foreground text-lg">No mentor data available.</div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-green-50/50 to-white overflow-hidden">
            {/* Nature-inspired Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Abstract Tree/Leaf Shapes */}
                <svg className="absolute top-10 right-20 w-32 h-32 text-green-200 opacity-30" viewBox="0 0 100 100">
                    <path d="M50 10 Q60 30 50 50 Q40 30 50 10" fill="currentColor" />
                    <path d="M50 50 Q70 60 60 80 Q50 70 50 50" fill="currentColor" />
                    <path d="M50 50 Q30 60 40 80 Q50 70 50 50" fill="currentColor" />
                </svg>
                <svg className="absolute bottom-20 left-10 w-40 h-40 text-emerald-200 opacity-20" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="currentColor" />
                    <circle cx="30" cy="30" r="20" fill="currentColor" opacity="0.5" />
                </svg>

                {/* Floating Orbs */}
                <div className="absolute top-20 left-10 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute top-20 right-10 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto p-6 pt-24">
                {/* Profile Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-green-100 p-8 mb-8 text-center shadow-sm">
                    <div className="w-32 h-32 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm">
                        <span className="text-5xl">👤</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{mentorData.name}</h1>
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {mentorData.specialties && mentorData.specialties.map((specialty, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-sm font-medium"
                            >
                                {specialty}
                            </span>
                        ))}
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">{mentorData.bio}</p>
                </div>

                {/* Sessions Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-green-100 p-8 shadow-sm">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Available Sessions</h2>
                    {availabilityData.slots && availabilityData.slots.length > 0 ? (
                        <div className="space-y-4">
                            {availabilityData.slots.map((slot, index) => {
                                const startTime = new Date(slot.startTime.seconds * 1000);
                                const endTime = new Date(slot.endTime.seconds * 1000);

                                return (
                                    <div key={index} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-green-200 hover:shadow-md transition-all duration-300">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-900 mb-1">
                                                📅 {startTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                            <p className="text-gray-500">
                                                🕐 {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <button
                                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 min-w-[120px] ${slot.isBooked || bookingStatus.loading
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'
                                                }`}
                                            onClick={() => handleBookNow(slot)}
                                            disabled={slot.isBooked || bookingStatus.loading}
                                        >
                                            {bookingStatus.loading ? (
                                                <div className="flex items-center space-x-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    <span>Booking...</span>
                                                </div>
                                            ) : (slot.isBooked ? 'Booked ✓' : 'Book Now')}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📅</div>
                            <p className="text-gray-900 text-xl mb-2">No available sessions</p>
                            <p className="text-gray-500">This mentor has no available sessions at the moment. Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MentorBooking;