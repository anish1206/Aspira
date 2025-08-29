// src/services/notificationService.js
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Import getDoc
import { db } from '../firebase';

class NotificationService {
  constructor() {
    this.messaging = null;
    this.token = null;
    this.isSupported = false;
    this.navigate = null; // To hold the router's navigation function

    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        this.messaging = getMessaging();
        this.isSupported = true;
      }
    } catch (error) {
      console.warn('Firebase Messaging not supported:', error);
    }

    // FIXED: Removed invalid newline characters and corrected string formatting
    this.notificationTypes = {
      MOOD_REMINDER: {
        title: '🌡️ Daily Check-in Reminder',
        body: 'How are you feeling today? Take a moment to check in with yourself.',
        icon: '/logo192.png',
        tag: 'mood-reminder'
      },
      SESSION_REMINDER: {
        title: '👨‍⚕️ Session Starting Soon',
        body: 'Your counseling session starts in 15 minutes. Click to join.',
        icon: '/logo192.png',
        tag: 'session-reminder'
      },
      CRISIS_ALERT: {
        title: '🚨 Immediate Support Available',
        body: 'We noticed you might need support right now. Tap for immediate help.',
        icon: '/logo192.png',
        tag: 'crisis-alert',
        requireInteraction: true
      },
      ACHIEVEMENT_UNLOCK: {
        title: '🏆 Achievement Unlocked!',
        body: "You've earned a new achievement! Check your progress.",
        icon: '/logo192.png',
        tag: 'achievement'
      },
      PEER_SUPPORT: {
        title: '👥 Someone Needs Support',
        body: 'A peer in your support group could use encouragement.',
        icon: '/logo192.png',
        tag: 'peer-support'
      },
      WEEKLY_CHALLENGE: {
        title: '🎯 New Weekly Challenge',
        body: 'A new community challenge is available! Join others in wellness activities.',
        icon: '/logo192.png',
        tag: 'challenge'
      }
    };
  }
  
  /**
   * IMPROVEMENT: Sets the navigation function from the app's router.
   * This should be called once when your app initializes.
   * @param {function} navigateFn - The navigation function (e.g., from useNavigate hook in React).
   */
  setNavigateFunction(navigateFn) {
    this.navigate = navigateFn;
  }

  async initializeNotifications(userId) {
    try {
      if (!this.isSupported) {
        console.warn('Push notifications not supported');
        return false;
      }

      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const token = await getToken(this.messaging, {
          vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
        });
        
        if (token) {
          this.token = token;
          await this.saveTokenToDatabase(userId, token);
          this.setupMessageListener();
          return true;
        }
      } else {
        console.warn('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
    return false; // Ensure a boolean is always returned
  }

  setupMessageListener() {
    if (!this.messaging) return;
    
    onMessage(this.messaging, (payload) => {
      console.log('Foreground notification received:', payload);
      const { notification, data } = payload;
      
      // Use the robust showCustomNotification method for all notifications
      this.showCustomNotification({
        title: notification?.title || 'Mindsync',
        body: notification?.body || 'You have a new notification',
        icon: notification?.icon || '/logo192.png',
        data: data || {}
      });
    });
  }

  async saveTokenToDatabase(userId, token) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        fcmToken: token,
        notificationsEnabled: true,
        tokenUpdatedAt: new Date()
      });
      console.log('FCM token saved for user:', userId);
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  }

  // CONSOLIDATED: This is now the primary method for showing notifications.
  async showCustomNotification(options) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    try {
      const serviceWorkerRegistration = await navigator.serviceWorker.ready;
      serviceWorkerRegistration.showNotification(options.title, {
        body: options.body,
        icon: options.icon,
        tag: options.data?.tag || options.tag, // Allow tag from top level or data
        requireInteraction: options.data?.requireInteraction || false,
        actions: this.getNotificationActions(options.data?.type),
        data: options.data // Pass data to the service worker
      });
    } catch (error) {
      console.error('Error showing notification via Service Worker:', error);
    }
  }

  getNotificationActions(type) {
    const actions = {
      CRISIS_ALERT: [
        { action: 'get-help', title: 'Get Help Now' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      SESSION_REMINDER: [
        { action: 'join-session', title: 'Join Session' },
        { action: 'snooze', title: 'Remind in 5 min' }
      ],
      MOOD_REMINDER: [
        { action: 'check-in', title: 'Quick Check-in' },
        { action: 'later', title: 'Later' }
      ]
    };
    return actions[type] || [];
  }

  // IMPROVEMENT: Uses the injected navigate function instead of full page reloads.
  handleNotificationClick(data) {
    if (!this.navigate) {
      console.warn('Navigate function not set. Falling back to window.location.');
      // Fallback for environments where navigate isn't set
      window.location.href = data?.url || '/';
      return;
    }

    const { type, sessionId } = data || {};
    
    switch (type) {
      case 'MOOD_REMINDER':
        this.navigate('/checkins');
        break;
      case 'SESSION_REMINDER':
        if (sessionId) {
          this.navigate(`/checkins?session=${sessionId}`);
        } else {
          this.navigate('/checkins?tab=expert');
        }
        break;
      case 'CRISIS_ALERT':
        this.navigate('/chat?support=crisis');
        break;
      case 'ACHIEVEMENT_UNLOCK':
        this.navigate('/'); // Or navigate to a profile/achievements page
        break;
      case 'PEER_SUPPORT':
        this.navigate('/groups');
        break;
      default:
        this.navigate('/');
    }
  }
  
  // NOTE: Client-side scheduling is unreliable. This logic should be moved
  // to a server environment (e.g., Firebase Cloud Functions with Cloud Scheduler).
  // The client-side implementation is removed to prevent flawed behavior.
  async scheduleMoodReminder(userId, preferences) {
     console.log('Mood reminder scheduling should be handled by the backend.');
     // In a real app, you would make an API call here to your backend
     // to set up the scheduled notification via Cloud Functions.
     // For example: await api.scheduleReminder({ userId, time: preferences.preferredTime });
     return true;
  }


  // These methods are for triggering immediate notifications from the client.
  // In most real-world scenarios, these would be triggered by backend events.
  async sendCrisisAlert(userId, crisisData) {
    try {
      const notification = {
        ...this.notificationTypes.CRISIS_ALERT,
        // FIXED: Corrected escape character
        body: "We're concerned about your recent activity. Immediate support is available.",
        data: {
          type: 'CRISIS_ALERT',
          userId,
          crisisLevel: crisisData.level,
          timestamp: new Date().toISOString()
        }
      };
      await this.showCustomNotification(notification);
      return true;
    } catch (error) {
      console.error('Error sending crisis alert:', error);
      return false;
    }
  }

  async sendSessionReminder(userId, sessionData, minutesBefore = 15) {
    try {
      const notification = {
        ...this.notificationTypes.SESSION_REMINDER,
        body: `Your session with ${sessionData.counselorName} starts in ${minutesBefore} minutes.`,
        data: {
          type: 'SESSION_REMINDER',
          sessionId: sessionData.id,
          meetLink: sessionData.meetLink,
          counselor: sessionData.counselorName
        }
      };
      await this.showCustomNotification(notification);
      return true;
    } catch (error) {
      console.error('Error sending session reminder:', error);
      return false;
    }
  }

  async sendAchievementNotification(userId, achievement) {
    try {
      const notification = {
        ...this.notificationTypes.ACHIEVEMENT_UNLOCK,
        body: `You earned "${achievement.title}"! +${achievement.points} points`,
        data: {
          type: 'ACHIEVEMENT_UNLOCK',
          achievementId: achievement.id,
          points: achievement.points
        }
      };
      await this.showCustomNotification(notification);
      return true;
    } catch (error) {
      console.error('Error sending achievement notification:', error);
      return false;
    }
  }

  async updateNotificationPreferences(userId, preferences) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        notificationPreferences: {
          moodReminders: preferences.moodReminders ?? true,
          sessionReminders: preferences.sessionReminders ?? true,
          crisisAlerts: preferences.crisisAlerts ?? true,
          achievements: preferences.achievements ?? true,
          peerSupport: preferences.peerSupport ?? false,
          weeklyChallenges: preferences.weeklyChallenges ?? true,
          preferredTime: preferences.preferredTime || '20:00'
        },
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }

  // FIXED: Actually fetches data from Firestore.
  async getNotificationPreferences(userId) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().notificationPreferences) {
        return userDoc.data().notificationPreferences;
      }
      
      // Return default preferences if none are set for the user
      return {
        moodReminders: true,
        sessionReminders: true,
        crisisAlerts: true,
        achievements: true,
        peerSupport: false,
        weeklyChallenges: true,
        preferredTime: '20:00'
      };
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return {};
    }
  }

  getNotificationStatus() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  async sendTestNotification() {
    try {
      const testNotification = {
        title: '✅ Notifications Working!',
        // FIXED: Corrected escape character
        body: "You'll now receive helpful reminders and alerts from Mindsync.",
        icon: '/logo192.png',
        tag: 'test-notification'
      };
      await this.showCustomNotification(testNotification);
      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }
}

export default new NotificationService();