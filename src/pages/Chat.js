// src/pages/Chat.js
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../auth";
import geminiService from "../services/geminiService";
import dataService from "../services/dataService";
import translationService from "../services/translationService";

const MessageBubble = ({ message, isUser, timestamp }) => (
  <div style={{
    display: 'flex',
    justifyContent: isUser ? 'flex-end' : 'flex-start',
    marginBottom: 12
  }}>
    <div style={{
      maxWidth: '70%',
      padding: 12,
      borderRadius: 16,
      background: isUser ? '#1976d2' : '#f5f5f5',
      color: isUser ? 'white' : '#333'
    }}>
      <div>{message}</div>
      <div style={{
        fontSize: 10,
        opacity: 0.7,
        marginTop: 4
      }}>
        {new Date(timestamp).toLocaleTimeString()}
      </div>
    </div>
  </div>
);

const AIChat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLanguage, setUserLanguage] = useState('en');
  const [currentMood, setCurrentMood] = useState(3);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history on component mount
    loadChatHistory();
    // Show welcome message
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        text: 'Hello! I\'m here to support you. How are you feeling today? 😊',
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, []);

  const loadChatHistory = async () => {
    try {
      const history = await dataService.getUserChatHistory(user.uid);
      const formattedHistory = history.map(msg => ({
        id: msg.id,
        text: msg.message,
        isUser: !msg.isAI,
        timestamp: msg.timestamp?.toDate() || new Date()
      }));
      setMessages(formattedHistory);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Save user message
      await dataService.saveChatMessage(user.uid, inputMessage, false);

      // Get AI response
      const context = {
        language: userLanguage,
        mood: currentMood,
        previousMessages: messages.slice(-4)
      };

      const aiResponse = await geminiService.generateResponse(inputMessage, user.uid, context);
      
      // Check for crisis
      if (aiResponse.crisisScore > 7) {
        await dataService.logCrisisEvent(user.uid, {
          severity: aiResponse.crisisScore,
          context: inputMessage
        });
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.response,
        isUser: false,
        timestamp: new Date(),
        sentiment: aiResponse.sentiment,
        crisisScore: aiResponse.crisisScore
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Save AI response
      await dataService.saveChatMessage(user.uid, aiResponse.response, true, {
        sentiment: aiResponse.sentiment,
        crisisScore: aiResponse.crisisScore
      });

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble right now. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
      {/* Language and Mood Controls */}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        marginBottom: 16,
        padding: 12,
        background: '#f8f9fa',
        borderRadius: 8
      }}>
        <label>
          Language:
          <select 
            value={userLanguage} 
            onChange={(e) => setUserLanguage(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
            <option value="bn">Bengali</option>
          </select>
        </label>
        <label>
          Current mood (1-5):
          <input 
            type="range" 
            min="1" 
            max="5" 
            value={currentMood} 
            onChange={(e) => setCurrentMood(Number(e.target.value))}
            style={{ marginLeft: 8 }}
          />
          <span style={{ marginLeft: 8 }}>{currentMood}</span>
        </label>
      </div>

      {/* Chat Messages */}
      <div style={{
        flex: 1,
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        padding: 16,
        overflowY: 'auto',
        background: 'white'
      }}>
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg.text}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
          />
        ))}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
            <div style={{
              padding: 12,
              borderRadius: 16,
              background: '#f5f5f5',
              color: '#666'
            }}>
              AI is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginTop: 12
      }}>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message... (Press Enter to send)"
          rows={2}
          style={{
            flex: 1,
            padding: 12,
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            resize: 'none',
            fontFamily: 'inherit'
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          style={{
            padding: '12px 20px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
            opacity: inputMessage.trim() && !isLoading ? 1 : 0.6
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

const PeerChat = ({ user }) => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([
    { id: 'anxiety', name: 'Anxiety Support', members: 24, description: 'Safe space for anxiety discussions' },
    { id: 'exam', name: 'Exam Stress', members: 18, description: 'Managing academic pressure together' },
    { id: 'sleep', name: 'Sleep & Calm', members: 31, description: 'Better sleep habits and relaxation' },
    { id: 'family', name: 'Family Issues', members: 15, description: 'Navigating family relationships' }
  ]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedGroup) {
      // Subscribe to group messages
      const unsubscribe = dataService.subscribeToGroupMessages(selectedGroup.id, (messages) => {
        setGroupMessages(messages.sort((a, b) => a.timestamp - b.timestamp));
      });
      return unsubscribe;
    }
  }, [selectedGroup]);

  const joinGroup = async (group) => {
    try {
      await dataService.joinPeerGroup(group.id, user.uid);
      setSelectedGroup(group);
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group. Please try again.');
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !selectedGroup) return;

    setIsLoading(true);
    try {
      // Enhanced content moderation with context
      const moderation = await geminiService.moderateContent(inputMessage, {
        userType: 'peer',
        groupTopic: selectedGroup.name,
        userHistory: [] // Could include user's recent messages for context
      });
      
      if (!moderation.appropriate) {
        if (moderation.crisisFlag) {
          // Handle crisis content with special care
          const confirmSend = window.confirm(
            `We noticed your message contains concerning language. \n\n` +
            `Would you like to talk to someone right now instead? \n` +
            `• AI Support Chat\n` +
            `• Crisis Helpline: +91-9152987821 (AASRA)\n\n` +
            `Your message will not be sent to the group to protect your privacy.`
          );
          
          if (confirmSend) {
            // Redirect to AI chat or crisis support
            window.location.href = '/chat?support=crisis';
          }
        } else {
          // Regular moderation feedback
          alert(`Message not sent: ${moderation.finalReason || moderation.reason}\n\n` +
                `Suggested action: ${moderation.suggestedAction}\n` +
                `Remember: This is a safe space for support and encouragement.`);
        }
        
        setInputMessage('');
        return;
      }
      
      // Send the message if it passes moderation
      await dataService.sendGroupMessage(selectedGroup.id, user.uid, inputMessage);
      
      // Log successful message for analytics (anonymous)
      console.log('Group message sent successfully', {
        groupId: selectedGroup.id,
        messageLength: inputMessage.length,
        moderationScore: moderation.confidence
      });
      
      setInputMessage('');
      
      // Optionally generate a supportive AI response for sensitive topics
      if (moderation.severity === 'medium' && !moderation.crisisFlag) {
        setTimeout(async () => {
          try {
            const supportResponse = await geminiService.generateSupportiveResponse(
              inputMessage, 
              { groupTopic: selectedGroup.name }
            );
            
            // Send AI support message to the group
            await dataService.sendGroupMessage(
              selectedGroup.id, 
              'mindsync_ai', 
              `💙 ${supportResponse.response}`
            );
          } catch (error) {
            console.error('Error sending AI support response:', error);
          }
        }, 2000); // Delay to let the original message appear first
      }
      
    } catch (error) {
      console.error('Error sending group message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedGroup) {
    return (
      <div>
        <h3>Join a Support Group</h3>
        <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          {groups.map(group => (
            <div 
              key={group.id}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                padding: 16,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => joinGroup(group)}
            >
              <h4 style={{ margin: '0 0 8px 0' }}>{group.name}</h4>
              <p style={{ margin: '0 0 8px 0', color: '#666' }}>{group.description}</p>
              <small style={{ color: '#888' }}>{group.members} members</small>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '60vh' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 12,
        borderBottom: '1px solid #e0e0e0',
        background: '#f8f9fa'
      }}>
        <button 
          onClick={() => setSelectedGroup(null)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 18,
            cursor: 'pointer'
          }}
        >
          ←
        </button>
        <div>
          <h3 style={{ margin: 0 }}>{selectedGroup.name}</h3>
          <small style={{ color: '#666' }}>{selectedGroup.members} members</small>
        </div>
      </div>

      <div style={{
        flex: 1,
        padding: 16,
        overflowY: 'auto',
        background: 'white'
      }}>
        {groupMessages.map(msg => (
          <div key={msg.id} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              Anonymous User • {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
            <div style={{
              padding: 8,
              background: '#f0f7ff',
              borderRadius: 8,
              borderLeft: '3px solid #1976d2'
            }}>
              {msg.message}
            </div>
          </div>
        ))}
        {groupMessages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#666', marginTop: 40 }}>
            <p>No messages yet. Be the first to share!</p>
            <p style={{ fontSize: 14 }}>Remember: This is a safe space. Be kind and supportive.</p>
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        gap: 8,
        padding: 12,
        borderTop: '1px solid #e0e0e0'
      }}>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Share your thoughts with the group..."
          rows={2}
          style={{
            flex: 1,
            padding: 8,
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            resize: 'none'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim() || isLoading}
          style={{
            padding: '8px 16px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
            opacity: inputMessage.trim() && !isLoading ? 1 : 0.6
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default function Chat() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("ai");

  return (
    <div style={{ padding: 20 }}>
      <h2>Chat & Support</h2>
      
      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button 
          onClick={() => setActiveTab("ai")} 
          style={{ 
            padding: '8px 16px', 
            background: activeTab === "ai" ? "#1976d2" : "#eee", 
            color: activeTab === "ai" ? "#fff" : "#333", 
            border: "none",
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          🤖 AI Support
        </button>
        <button 
          onClick={() => setActiveTab("peers")} 
          style={{ 
            padding: '8px 16px', 
            background: activeTab === "peers" ? "#1976d2" : "#eee", 
            color: activeTab === "peers" ? "#fff" : "#333", 
            border: "none",
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          👥 Peer Groups
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ 
        border: "1px solid #e0e0e0", 
        borderRadius: 8, 
        padding: 16,
        background: 'white'
      }}>
        {activeTab === "ai" ? (
          <AIChat user={user} />
        ) : (
          <PeerChat user={user} />
        )}
      </div>
    </div>
  );
}


