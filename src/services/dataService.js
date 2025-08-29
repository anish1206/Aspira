// src/services/dataService.js
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  setDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { ref, push, onValue, off, set } from 'firebase/database';
import { db, realtimeDb } from '../firebase';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'mindsync-default-key';

class DataService {
  // Encryption helpers
  encrypt(text) {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  }

  decrypt(encryptedText) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedText; // Return original if decryption fails
    }
  }

  // User Profile Management
  async createUserProfile(userId, profileData) {
    try {
      const encryptedProfile = {
        ...profileData,
        preferences: this.encrypt(JSON.stringify(profileData.preferences || {})),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, 'users', userId), encryptedProfile);
      return true;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const docSnap = await getDoc(doc(db, 'users', userId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          preferences: data.preferences ? JSON.parse(this.decrypt(data.preferences)) : {}
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Mood Check-ins
  async saveMoodCheckin(userId, moodData) {
    try {
      const checkin = {
        userId,
        mood: moodData.mood,
        note: moodData.note ? this.encrypt(moodData.note) : '',
        timestamp: serverTimestamp(),
        sentiment: moodData.sentiment || 'neutral'
      };
      
      const docRef = await addDoc(collection(db, 'checkins'), checkin);
      return docRef.id;
    } catch (error) {
      console.error('Error saving mood checkin:', error);
      throw error;
    }
  }

  async getUserCheckins(userId, limitCount = 30) {
    try {
      const q = query(
        collection(db, 'checkins'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          note: data.note ? this.decrypt(data.note) : ''
        };
      });
    } catch (error) {
      console.error('Error fetching user checkins:', error);
      return [];
    }
  }

  // Diary Entries
  async saveDiaryEntry(userId, entryText, mood = null) {
    try {
      const entry = {
        userId,
        content: this.encrypt(entryText),
        mood,
        timestamp: serverTimestamp(),
        wordCount: entryText.split(' ').length
      };
      
      const docRef = await addDoc(collection(db, 'diary'), entry);
      return docRef.id;
    } catch (error) {
      console.error('Error saving diary entry:', error);
      throw error;
    }
  }

  async getUserDiaryEntries(userId, limitCount = 20) {
    try {
      const q = query(
        collection(db, 'diary'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          content: this.decrypt(data.content)
        };
      });
    } catch (error) {
      console.error('Error fetching diary entries:', error);
      return [];
    }
  }

  // Chat History
  async saveChatMessage(userId, message, isAI = false, metadata = {}) {
    try {
      const chatMessage = {
        userId,
        message: this.encrypt(message),
        isAI,
        metadata,
        timestamp: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'chatHistory'), chatMessage);
      return docRef.id;
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  }

  async getUserChatHistory(userId, limitCount = 50) {
    try {
      const q = query(
        collection(db, 'chatHistory'),
        where('userId', '==', userId),
        orderBy('timestamp', 'asc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          message: this.decrypt(data.message)
        };
      });
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }

  // Peer Groups - Real-time Database
  async createPeerGroup(groupData) {
    try {
      const groupsRef = ref(realtimeDb, 'groups');
      const newGroupRef = push(groupsRef);
      
      await set(newGroupRef, {
        ...groupData,
        createdAt: Date.now(),
        memberCount: 1
      });
      
      return newGroupRef.key;
    } catch (error) {
      console.error('Error creating peer group:', error);
      throw error;
    }
  }

  async joinPeerGroup(groupId, userId) {
    try {
      const memberRef = ref(realtimeDb, `groups/${groupId}/members/${userId}`);
      await set(memberRef, {
        joinedAt: Date.now(),
        active: true
      });
      return true;
    } catch (error) {
      console.error('Error joining peer group:', error);
      throw error;
    }
  }

  async sendGroupMessage(groupId, userId, message) {
    try {
      const messagesRef = ref(realtimeDb, `groups/${groupId}/messages`);
      const newMessageRef = push(messagesRef);
      
      await set(newMessageRef, {
        userId,
        message: this.encrypt(message),
        timestamp: Date.now(),
        moderated: false
      });
      
      return newMessageRef.key;
    } catch (error) {
      console.error('Error sending group message:', error);
      throw error;
    }
  }

  // Real-time listeners
  subscribeToGroupMessages(groupId, callback) {
    const messagesRef = ref(realtimeDb, `groups/${groupId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messages = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        messages.push({
          id: childSnapshot.key,
          ...data,
          message: this.decrypt(data.message)
        });
      });
      callback(messages);
    });
    
    return () => off(messagesRef, 'value', unsubscribe);
  }

  // Crisis and Analytics
  async logCrisisEvent(userId, crisisData) {
    try {
      const crisis = {
        userId,
        severity: crisisData.severity,
        context: this.encrypt(crisisData.context || ''),
        timestamp: serverTimestamp(),
        resolved: false
      };
      
      const docRef = await addDoc(collection(db, 'crisisEvents'), crisis);
      return docRef.id;
    } catch (error) {
      console.error('Error logging crisis event:', error);
      throw error;
    }
  }

  async getUserProgress(userId) {
    try {
      const docSnap = await getDoc(doc(db, 'userProgress', userId));
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return null;
    }
  }

  async saveUserProgress(userId, progressData) {
    try {
      await setDoc(doc(db, 'userProgress', userId), {
        ...progressData,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error saving user progress:', error);
      throw error;
    }
  }

  async updateUserProgress(userId, progressData) {
    try {
      const progressRef = doc(db, 'userProgress', userId);
      await updateDoc(progressRef, {
        ...progressData,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  }

  async saveChallengeProgress(userId, challengeId, progressData) {
    try {
      const challengeProgressRef = doc(db, 'challengeProgress', `${userId}_${challengeId}`);
      await setDoc(challengeProgressRef, {
        userId,
        challengeId,
        ...progressData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Error saving challenge progress:', error);
      throw error;
    }
  }

  async getChallengeProgress(userId, challengeId) {
    try {
      const docSnap = await getDoc(doc(db, 'challengeProgress', `${userId}_${challengeId}`));
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error fetching challenge progress:', error);
      return null;
    }
  }

  // Crisis Management Methods
  async saveCrisisNotification(userId, notificationData) {
    try {
      const docRef = await addDoc(collection(db, 'crisisNotifications'), {
        userId,
        ...notificationData,
        timestamp: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving crisis notification:', error);
      throw error;
    }
  }

  async saveEmergencyAlert(userId, alertData) {
    try {
      const docRef = await addDoc(collection(db, 'emergencyAlerts'), {
        userId,
        ...alertData,
        timestamp: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving emergency alert:', error);
      throw error;
    }
  }

  async saveCrisisActionPlan(userId, actionPlan) {
    try {
      const docRef = await addDoc(collection(db, 'crisisActionPlans'), {
        ...actionPlan,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving crisis action plan:', error);
      throw error;
    }
  }

  async saveFollowUpSchedule(userId, followUpData) {
    try {
      const docRef = await addDoc(collection(db, 'followUpSchedules'), {
        ...followUpData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving follow-up schedule:', error);
      throw error;
    }
  }

  async getUserCrisisEvents(userId, days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const q = query(
        collection(db, 'crisisEvents'),
        where('userId', '==', userId),
        where('timestamp', '>=', cutoffDate),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching crisis events:', error);
      return [];
    }
  }
}

export default new DataService();
