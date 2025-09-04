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
    return <div style={styles.container}><p>Loading mentor details...</p></div>;
  }

  if (error) {
    return <div style={styles.container}><p style={styles.errorText}>{error}</p></div>;
  }

  if (!mentorData || !availabilityData) {
    return <div style={styles.container}><p>No mentor data available.</p></div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.profileSection}>
        <img src={mentorData.photoURL} alt={mentorData.name} style={styles.profileImage} />
        <h1>{mentorData.name}</h1>
        <p style={styles.specialties}>Specialties: {mentorData.specialties.join(', ')}</p>
        <p>{mentorData.bio}</p>
      </div>

      <div style={styles.slotsSection}>
        <h2>Available Sessions</h2>
        {availabilityData.slots && availabilityData.slots.length > 0 ? (
          availabilityData.slots.map((slot, index) => {
            const startTime = new Date(slot.startTime.seconds * 1000);
            const endTime = new Date(slot.endTime.seconds * 1000);
            
            return (
              <div key={index} style={styles.slotCard}>
                <div style={styles.slotTime}>
                  <p><strong>Date:</strong> {startTime.toLocaleDateString()}</p>
                  <p>
                    <strong>Time:</strong>{' '}
                    {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  style={slot.isBooked || bookingStatus.loading ? styles.bookedButton : styles.bookButton}
                  onClick={() => handleBookNow(slot)}
                  disabled={slot.isBooked || bookingStatus.loading}
                >
                  {bookingStatus.loading ? 'Booking...' : (slot.isBooked ? 'Booked' : 'Book Now')}
                </button>
              </div>
            );
          })
        ) : (
          <p>This mentor has no available sessions at the moment.</p>
        )}
      </div>
    </div>
  );
};

// --- Basic CSS-in-JS for Styling ---

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: 'auto',
  },
  profileSection: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  profileImage: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  specialties: {
    color: '#555',
    fontStyle: 'italic',
  },
  slotsSection: {
    marginTop: '20px',
  },
  slotCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    border: '1px solid #eee',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  slotTime: {
    margin: 0,
  },
  bookButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  bookedButton: {
    padding: '10px 20px',
    backgroundColor: '#ccc',
    color: '#666',
    border: 'none',
    borderRadius: '5px',
    cursor: 'not-allowed',
  },
  errorText: {
    color: 'red',
  },
};

export default MentorBooking;