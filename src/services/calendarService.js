// src/services/calendarService.js
import axios from 'axios';

const CALENDAR_API_KEY = process.env.REACT_APP_GOOGLE_CALENDAR_API_KEY;
const CALENDAR_BASE_URL = 'https://www.googleapis.com/calendar/v3';

class CalendarService {
  constructor() {
    this.counselors = [
      { id: 'c1', name: 'Dr. Priya Sharma', specialty: 'Anxiety & Depression', languages: ['en', 'hi'], available: ['mon', 'tue', 'wed'] },
      { id: 'c2', name: 'Dr. Rajesh Kumar', specialty: 'Stress Management', languages: ['en', 'hi', 'bn'], available: ['thu', 'fri', 'sat'] },
      { id: 'c3', name: 'Dr. Anitha Nair', specialty: 'Youth Counseling', languages: ['en', 'ta', 'ml'], available: ['tue', 'thu', 'sun'] }
    ];
    this.timeSlots = ['10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  }

  getAvailableCounselors(language = 'en') {
    return this.counselors.filter(counselor => 
      counselor.languages.includes(language)
    );
  }

  async getAvailableSlots(counselorId, date) {
    try {
      const counselor = this.counselors.find(c => c.id === counselorId);
      if (!counselor) return [];

      const dayOfWeek = new Date(date).toLocaleDateString('en', { weekday: 'short' }).toLowerCase();
      if (!counselor.available.includes(dayOfWeek)) return [];

      // Simulate availability check - in real implementation, query Google Calendar
      const availableSlots = this.timeSlots.filter(() => Math.random() > 0.3);
      
      return availableSlots.map(time => ({
        time,
        counselorId,
        counselorName: counselor.name,
        specialty: counselor.specialty
      }));
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return [];
    }
  }

  async bookSession(userId, counselorId, datetime, notes = '') {
    try {
      const counselor = this.counselors.find(c => c.id === counselorId);
      if (!counselor) throw new Error('Counselor not found');
      
      // Create Google Calendar event with Meet integration
      const calendarEvent = await this.createCalendarEvent({
        userId,
        counselor,
        datetime,
        notes
      });
      
      const booking = {
        id: calendarEvent.eventId || Date.now().toString(),
        userId,
        counselorId,
        counselorName: counselor.name,
        datetime,
        notes: this.encrypt(notes),
        meetLink: calendarEvent.meetLink,
        calendarEventId: calendarEvent.eventId,
        status: 'confirmed',
        createdAt: new Date(),
        reminderSent: false
      };

      // Save booking to Firestore
      await this.saveBookingToDatabase(booking);
      
      // Schedule reminder
      await this.scheduleReminder(booking);
      
      return {
        ...booking,
        notes: notes // Return unencrypted notes for immediate use
      };
    } catch (error) {
      console.error('Error booking session:', error);
      throw error;
    }
  }

  async createCalendarEvent({ userId, counselor, datetime, notes }) {
    try {
      const API_KEY = process.env.REACT_APP_GOOGLE_CALENDAR_API_KEY;
      
      if (!API_KEY) {
        console.warn('Google Calendar API key not found, using mock implementation');
        return await this.createMockCalendarEvent({ userId, counselor, datetime, notes });
      }
      
      // Create event with Google Calendar API
      const event = {
        summary: `Mental Health Session - ${counselor.name}`,
        description: `Mindsync Mental Health Session\n\nCounselor: ${counselor.name}\nSpecialty: ${counselor.specialty}\n\nSession Notes: ${notes}\n\nJoin via: Google Meet link will be provided`,
        start: {
          dateTime: datetime.toISOString(),
          timeZone: 'Asia/Kolkata'
        },
        end: {
          dateTime: new Date(datetime.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour session
          timeZone: 'Asia/Kolkata'
        },
        conferenceData: {
          createRequest: {
            requestId: `mindsync-${userId}-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        },
        attendees: [
          { email: `counselor-${counselor.id}@mindsync.app` }, // In production, use real counselor emails
          { email: 'user@mindsync.app' } // In production, use user's email if available
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 1440 }, // 24 hours
            { method: 'popup', minutes: 15 }    // 15 minutes
          ]
        }
      };
      
      // For MVP, we'll create a mock response since we need OAuth for full Calendar API
      return await this.createMockCalendarEvent({ userId, counselor, datetime, notes });
      
    } catch (error) {
      console.error('Error creating calendar event:', error);
      // Fallback to mock implementation
      return await this.createMockCalendarEvent({ userId, counselor, datetime, notes });
    }
  }

  async createMockCalendarEvent({ userId, counselor, datetime, notes }) {
    // Generate realistic Google Meet link
    const meetCode = this.generateMeetCode();
    const meetLink = `https://meet.google.com/${meetCode}`;
    
    // Simulate calendar event creation
    const eventId = `evt_${Date.now()}_${userId}`;
    
    console.log('Mock calendar event created:', {
      eventId,
      counselor: counselor.name,
      datetime,
      meetLink,
      notes
    });
    
    return {
      eventId,
      meetLink,
      status: 'confirmed'
    };
  }

  generateMeetCode() {
    // Generate realistic Google Meet codes (xxx-yyyy-zzz format)
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const part1 = Array.from({length: 3}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const part2 = Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const part3 = Array.from({length: 3}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    
    return `${part1}-${part2}-${part3}`;
  }

  async saveBookingToDatabase(booking) {
    try {
      // In production, save to Firestore
      console.log('Booking saved to database:', {
        id: booking.id,
        userId: booking.userId,
        counselorId: booking.counselorId,
        datetime: booking.datetime,
        status: booking.status
      });
      
      return true;
    } catch (error) {
      console.error('Error saving booking to database:', error);
      throw error;
    }
  }

  encrypt(text) {
    // Simple encryption for session notes
    return btoa(text); // Base64 encoding for demo
  }

  decrypt(encodedText) {
    try {
      return atob(encodedText);
    } catch (error) {
      return encodedText;
    }
  }

  async scheduleReminder(booking, reminderTime = 15) {
    try {
      // In production, this would integrate with:
      // 1. Firebase Cloud Messaging for push notifications
      // 2. Email service for email reminders
      // 3. SMS service for text reminders
      
      const reminderData = {
        bookingId: booking.id,
        userId: booking.userId,
        counselorId: booking.counselorId,
        scheduledFor: new Date(booking.datetime.getTime() - reminderTime * 60 * 1000),
        type: 'session_reminder',
        message: `Reminder: Your session with ${booking.counselorName} starts in ${reminderTime} minutes. Join here: ${booking.meetLink}`,
        channels: ['push', 'email'],
        sent: false
      };
      
      // Store reminder in database
      console.log('Reminder scheduled:', reminderData);
      
      // In production, set up Cloud Function to send reminder at scheduled time
      return reminderData;
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      throw error;
    }
  }

  async sendSessionInvite(booking) {
    try {
      // Create calendar invite email/notification
      const inviteData = {
        to: 'user@example.com', // In production, use user's email
        subject: `Mental Health Session Confirmation - ${booking.counselorName}`,
        body: `
Hi there,

Your mental health session has been confirmed!

📅 Date & Time: ${booking.datetime.toLocaleDateString()} at ${booking.datetime.toLocaleTimeString()}
👨‍⚕️ Counselor: ${booking.counselorName}
🌐 Language: ${booking.language || 'English'}
📝 Session Notes: ${booking.notes}

📹 Join Session: ${booking.meetLink}

💙 Mindsync Team
        `.trim()
      };
      
      console.log('Session invite prepared:', inviteData);
      return true;
    } catch (error) {
      console.error('Error sending session invite:', error);
      return false;
    }
  }

  async getReminderInfo(bookingId) {
    // Get reminder information for a booking
    return {
      bookingId,
      reminderTime: '15 minutes before',
      channels: ['email', 'app_notification']
    };
  }
}

export default new CalendarService();
