import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth';

const MentorBooking = () => {
    const { mentorId } = useParams();
    const { user } = useAuth();

    const [mentorData, setMentorData] = useState(null);
    const [availabilityData, setAvailabilityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [bookingStatus, setBookingStatus] = useState({
        loading: false,
        error: null,
        success: false,
    });

    const fetchData = useCallback(async () => {
        if (!mentorId) return;
        setLoading(true);
        try {
            const mentorRef = doc(db, 'mentors', mentorId);
            const mentorSnap = await getDoc(mentorRef);

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

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleBookNow = async (slotToBook) => {
        if (!user) {
            alert("Please log in to book a session.");
            return;
        }
        setBookingStatus({ loading: true, error: null, success: false });

        try {
            const availabilityRef = doc(db, 'mentorAvailability', mentorId);

            // Create a new array with the updated slot
            const updatedSlots = availabilityData.slots.map(slot => {
                // Compare timestamps to identify the correct slot
                if (slot.startTime.seconds === slotToBook.startTime.seconds &&
                    slot.endTime.seconds === slotToBook.endTime.seconds) {
                    return { ...slot, isBooked: true, bookedBy: user.uid };
                }
                return slot;
            });

            await updateDoc(availabilityRef, {
                slots: updatedSlots
            });

            // Save to bookings collection for easy retrieval on Dashboard
            await addDoc(collection(db, 'bookings'), {
                userId: user.uid,
                mentorId: mentorId,
                mentorName: mentorData.name,
                startTime: slotToBook.startTime,
                endTime: slotToBook.endTime,
                status: 'confirmed',
                createdAt: serverTimestamp()
            });

            setBookingStatus({ loading: false, error: null, success: true });
            setShowSuccessModal(true);

            // Refresh data
            fetchData();
        } catch (err) {
            console.error("Error booking session:", err);
            setBookingStatus({ loading: false, error: "Failed to book session. Please try again.", success: false });
        }
    };

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
                <svg className="absolute top-10 right-20 w-32 h-32 text-green-200 opacity-30" viewBox="0 0 100 100">
                    <path d="M50 10 Q60 30 50 50 Q40 30 50 10" fill="currentColor" />
                    <path d="M50 50 Q70 60 60 80 Q50 70 50 50" fill="currentColor" />
                    <path d="M50 50 Q30 60 40 80 Q50 70 50 50" fill="currentColor" />
                </svg>
                <svg className="absolute bottom-20 left-10 w-40 h-40 text-emerald-200 opacity-20" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="currentColor" />
                    <circle cx="30" cy="30" r="20" fill="currentColor" opacity="0.5" />
                </svg>

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
                                        <div className="flex flex-col items-end gap-2">
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
                                            {bookingStatus.error && !bookingStatus.success && (
                                                <p className="text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">
                                                    {bookingStatus.error}
                                                </p>
                                            )}
                                        </div>
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

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-emerald-100 text-center relative overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>

                        <div className="mb-6 bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-4xl">✅</span>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                        <p className="text-gray-600 mb-6">
                            You've taken a great step for yourself. A confirmation email has been sent to {user.email}.
                        </p>

                        <div className="bg-emerald-50 rounded-xl p-4 mb-8 border border-emerald-100">
                            <p className="text-emerald-800 italic font-medium">
                                "Invest in yourself, you are worth it."
                            </p>
                        </div>

                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                        >
                            Wonderful, thanks!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorBooking;