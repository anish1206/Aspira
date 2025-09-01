// public/firebase-messaging-sw.js
// Firebase service worker for handling background notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
const firebaseConfig = {
  apiKey: 
AIzaSyAbcxiltgXPDR_mNgt26dBuVxzC5z4T2Wc,
  authDomain: "mindsync2-37bc8.firebaseapp.com",
  projectId: "mindsync2-37bc8",
  storageBucket: "mindsync2-37bc8.firebasestorage.app",
  messagingSenderId: "811886499271",
  appId: "1:811886499271:web:cd0af8d0721503142eb5e2"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const { notification, data } = payload;
  const title = notification?.title || 'Mindsync';
  const body = notification?.body || 'You have a new notification';
  const icon = notification?.icon || '/logo192.png';
  
  const notificationOptions = {
    body: body,
    icon: icon,
    badge: '/logo192.png',
    tag: data?.tag || 'default',
    requireInteraction: data?.requireInteraction === 'true',
    actions: getNotificationActions(data?.type),
    data: data || {}
  };

  // Show notification
  return self.registration.showNotification(title, notificationOptions);
});

// Handle notification clicks in service worker
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const { action } = event;
  const data = event.notification.data || {};
  
  let url = '/';
  
  // Handle different notification types and actions
  if (action === 'get-help' || data.type === 'CRISIS_ALERT') {
    url = '/chat?support=crisis';
  } else if (action === 'join-session' || data.type === 'SESSION_REMINDER') {
    url = data.sessionId ? `/checkins?session=${data.sessionId}` : '/checkins?tab=expert';
  } else if (action === 'check-in' || data.type === 'MOOD_REMINDER') {
    url = '/checkins';
  } else if (data.type === 'ACHIEVEMENT_UNLOCK') {
    url = '/';
  } else if (data.type === 'PEER_SUPPORT') {
    url = '/groups';
  } else if (action === 'snooze') {
    // Handle snooze action - reschedule notification
    scheduleSnoozeNotification(data);
    return;
  }
  
  // Open the app or focus existing tab
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            url: url,
            data: data
          });
          return;
        }
      }
      
      // Open new window if app not already open
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Helper function to get notification actions based on type
function getNotificationActions(type) {
  const actions = {
    'CRISIS_ALERT': [
      { action: 'get-help', title: 'Get Help Now', icon: '/icons/help.png' },
      { action: 'dismiss', title: 'Dismiss', icon: '/icons/dismiss.png' }
    ],
    'SESSION_REMINDER': [
      { action: 'join-session', title: 'Join Session', icon: '/icons/join.png' },
      { action: 'snooze', title: 'Remind in 5 min', icon: '/icons/snooze.png' }
    ],
    'MOOD_REMINDER': [
      { action: 'check-in', title: 'Quick Check-in', icon: '/icons/checkin.png' },
      { action: 'later', title: 'Later', icon: '/icons/later.png' }
    ]
  };
  
  return actions[type] || [];
}

// Handle snooze functionality
function scheduleSnoozeNotification(originalData) {
  setTimeout(() => {
    const snoozeNotification = {
      title: originalData.title || '🔔 Reminder',
      body: originalData.body || 'Don\'t forget to check in!',
      icon: '/logo192.png',
      tag: 'snoozed-' + Date.now(),
      data: originalData
    };
    
    self.registration.showNotification(snoozeNotification.title, {
      body: snoozeNotification.body,
      icon: snoozeNotification.icon,
      tag: snoozeNotification.tag,
      data: snoozeNotification.data,
      actions: getNotificationActions(originalData.type)
    });
  }, 5 * 60 * 1000); // 5 minutes
}

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed:', event);
  
  event.waitUntil(
    // Re-subscribe to push notifications
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'your-vapid-key'
    }).then((subscription) => {
      // Send new subscription to server
      return fetch('/api/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: subscription
        })
      });
    })
  );
});

// Cleanup old notifications periodically
self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
  
  event.waitUntil(
    // Clean up old notifications
    self.registration.getNotifications().then((notifications) => {
      notifications.forEach((notification) => {
        const notificationTime = new Date(notification.timestamp);
        const now = new Date();
        const hoursDiff = (now - notificationTime) / (1000 * 60 * 60);
        
        // Close notifications older than 24 hours
        if (hoursDiff > 24) {
          notification.close();
        }
      });
    })
  );
});

// Handle sync events for offline notification queuing
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // Process queued notifications when back online
      processQueuedNotifications()
    );
  }
});

// Process notifications queued while offline
async function processQueuedNotifications() {
  try {
    // Check for queued notifications in IndexedDB or localStorage
    const queuedNotifications = await getQueuedNotifications();
    
    for (const notification of queuedNotifications) {
      await self.registration.showNotification(notification.title, {
        body: notification.body,
        icon: notification.icon,
        data: notification.data,
        actions: getNotificationActions(notification.data?.type)
      });
    }
    
    // Clear processed notifications from queue
    await clearQueuedNotifications();
    
  } catch (error) {
    console.error('Error processing queued notifications:', error);
  }
}

// Helper functions for notification queue management
async function getQueuedNotifications() {
  // Implementation would use IndexedDB in production
  return [];
}

async function clearQueuedNotifications() {
  // Implementation would clear IndexedDB in production
  console.log('Notification queue cleared');
}
