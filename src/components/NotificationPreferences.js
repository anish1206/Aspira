// src/components/NotificationPreferences.js
import React, { useState, useEffect } from 'react';
import { Card, Switch, Button, Select, Form, notification, TimePicker, Alert, Space, Divider, Typography } from 'antd';
import { 
  BellOutlined, 
  ClockCircleOutlined, 
  MedicineBoxOutlined, 
  TrophyOutlined, 
  TeamOutlined, 
  AimOutlined, 
  ExclamationCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import notificationService from '../services/notificationService';
import { auth } from '../firebase';

const { Option } = Select;
const { Text, Title } = Typography;

const NotificationPreferences = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState('default');
  const [preferences, setPreferences] = useState({
    moodReminders: true,
    sessionReminders: true,
    crisisAlerts: true,
    achievements: true,
    peerSupport: false,
    weeklyChallenges: true,
    preferredTime: '20:00'
  });

  useEffect(() => {
    const checkNotificationStatus = async () => {
      try {
        setLoading(true);
        
        // Check browser notification permission status
        const status = notificationService.getNotificationStatus();
        setNotificationStatus(status);
        
        if (status === 'granted') {
          setNotificationsEnabled(true);
          
          // Get user's notification preferences
          const userId = auth.currentUser?.uid;
          if (userId) {
            const userPreferences = await notificationService.getNotificationPreferences(userId);
            setPreferences(userPreferences);
          }
        }
        
      } catch (error) {
        console.error('Error fetching notification status:', error);
        notification.error({
          message: 'Error',
          description: 'Failed to fetch notification settings.'
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkNotificationStatus();
  }, []);

  const handleEnableNotifications = async () => {
    try {
      setLoading(true);
      
      // Request notification permission
      const permission = await notificationService.requestPermission();
      setNotificationStatus(permission);
      
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        
        // Initialize notifications for this user
        const userId = auth.currentUser?.uid;
        if (userId) {
          await notificationService.initializeNotifications(userId);
          
          // Schedule default reminders
          await notificationService.scheduleMoodReminder(userId, preferences.preferredTime);
          
          notification.success({
            message: 'Notifications Enabled',
            description: 'You will now receive helpful reminders and alerts.'
          });
        }
      } else if (permission === 'denied') {
        notification.warning({
          message: 'Notifications Blocked',
          description: 'Please enable notifications in your browser settings to receive reminders and alerts.'
        });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to enable notifications.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotification = (type, enabled) => {
    setPreferences(prev => ({
      ...prev,
      [type]: enabled
    }));
  };

  const handleTimeChange = (time) => {
    if (time) {
      const timeString = time.format('HH:mm');
      setPreferences(prev => ({
        ...prev,
        preferredTime: timeString
      }));
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      
      const userId = auth.currentUser?.uid;
      if (userId) {
        await notificationService.updateNotificationPreferences(userId, preferences);
        
        // Re-schedule reminders with updated preferences
        if (preferences.moodReminders) {
          await notificationService.scheduleMoodReminder(userId, preferences.preferredTime);
        }
        
        notification.success({
          message: 'Settings Saved',
          description: 'Your notification preferences have been updated.'
        });
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to save notification preferences.'
      });
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      setTestSending(true);
      await notificationService.sendTestNotification();
    } catch (error) {
      console.error('Error sending test notification:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to send test notification.'
      });
    } finally {
      setTestSending(false);
    }
  };

  // Show permission request alert if notifications not yet granted
  const renderPermissionAlert = () => {
    if (notificationStatus === 'default') {
      return (
        <Alert
          message="Enable Notifications"
          description="Receive timely reminders for check-ins, session alerts, and crisis support."
          type="info"
          showIcon
          action={
            <Button 
              type="primary" 
              onClick={handleEnableNotifications}
              loading={loading}
            >
              Enable
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      );
    } else if (notificationStatus === 'denied') {
      return (
        <Alert
          message="Notifications Blocked"
          description="Please enable notifications in your browser settings to receive helpful reminders and alerts."
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          style={{ marginBottom: 16 }}
        />
      );
    } else if (notificationStatus === 'unsupported') {
      return (
        <Alert
          message="Notifications Not Supported"
          description="Your browser does not support notifications. Please use a modern browser like Chrome, Firefox, or Edge."
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    }
    
    return null;
  };

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BellOutlined style={{ fontSize: '18px', marginRight: 8 }} />
          <span>Notification Preferences</span>
        </div>
      }
      loading={loading}
      className="notification-preferences-card"
    >
      {renderPermissionAlert()}
      
      {notificationStatus === 'granted' && (
        <>
          <Form layout="vertical">
            <div className="notification-toggle-container">
              <div className="notification-toggle-item">
                <Space align="center">
                  <ClockCircleOutlined style={{ fontSize: '18px' }} />
                  <Text>Daily Mood Check-in Reminders</Text>
                </Space>
                <Switch 
                  checked={preferences.moodReminders} 
                  onChange={(checked) => handleToggleNotification('moodReminders', checked)}
                  disabled={saving}
                />
              </div>
              
              <div className="notification-toggle-item">
                <Space align="center">
                  <MedicineBoxOutlined style={{ fontSize: '18px' }} />
                  <Text>Counseling Session Reminders</Text>
                </Space>
                <Switch 
                  checked={preferences.sessionReminders} 
                  onChange={(checked) => handleToggleNotification('sessionReminders', checked)}
                  disabled={saving}
                />
              </div>
              
              <div className="notification-toggle-item">
                <Space align="center">
                  <ExclamationCircleOutlined style={{ fontSize: '18px', color: '#ff4d4f' }} />
                  <Text>Crisis Alerts and Support</Text>
                </Space>
                <Switch 
                  checked={preferences.crisisAlerts} 
                  onChange={(checked) => handleToggleNotification('crisisAlerts', checked)}
                  disabled={saving}
                />
              </div>
              
              <div className="notification-toggle-item">
                <Space align="center">
                  <TrophyOutlined style={{ fontSize: '18px' }} />
                  <Text>Achievement Notifications</Text>
                </Space>
                <Switch 
                  checked={preferences.achievements} 
                  onChange={(checked) => handleToggleNotification('achievements', checked)}
                  disabled={saving}
                />
              </div>
              
              <div className="notification-toggle-item">
                <Space align="center">
                  <TeamOutlined style={{ fontSize: '18px' }} />
                  <Text>Peer Support Group Activity</Text>
                </Space>
                <Switch 
                  checked={preferences.peerSupport} 
                  onChange={(checked) => handleToggleNotification('peerSupport', checked)}
                  disabled={saving}
                />
              </div>
              
              <div className="notification-toggle-item">
                <Space align="center">
                  <AimOutlined style={{ fontSize: '18px' }} />
                  <Text>Weekly Wellness Challenges</Text>
                </Space>
                <Switch 
                  checked={preferences.weeklyChallenges} 
                  onChange={(checked) => handleToggleNotification('weeklyChallenges', checked)}
                  disabled={saving}
                />
              </div>
            </div>
            
            <Divider />
            
            <Form.Item 
              label="Preferred Time for Daily Reminders" 
              style={{ maxWidth: '300px' }}
            >
              <TimePicker
                use12Hours
                format="h:mm a"
                value={moment(preferences.preferredTime, 'HH:mm')}
                onChange={handleTimeChange}
                style={{ width: '100%' }}
                disabled={saving || !preferences.moodReminders}
              />
              <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                We'll send daily check-in reminders at this time
              </Text>
            </Form.Item>
            
            <div className="notification-actions">
              <Button 
                type="default" 
                onClick={sendTestNotification}
                loading={testSending}
                disabled={saving || notificationStatus !== 'granted'}
              >
                Send Test Notification
              </Button>
              
              <Button 
                type="primary" 
                onClick={savePreferences}
                loading={saving}
                disabled={notificationStatus !== 'granted'}
              >
                Save Preferences
              </Button>
            </div>
          </Form>
          
          <Divider />
          
          <div className="notification-info">
            <Title level={5}>About Notifications</Title>
            <Text type="secondary">
              Notifications help you stay consistent with your mental wellness journey.
              You can change your preferences any time or disable specific types of notifications.
              All notifications are private and won't reveal sensitive information.
            </Text>
          </div>
        </>
      )}
    </Card>
  );
};

export default NotificationPreferences;
