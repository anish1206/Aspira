// src/services/errorService.js
class ErrorService {
  constructor() {
    this.errorQueue = [];
    this.maxQueueSize = 50;
    this.isOnline = navigator.onLine;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processErrorQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    
    // Global error handlers
    this.setupGlobalErrorHandlers();
  }

  setupGlobalErrorHandlers() {
    // Handle unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || event.reason?.toString() || 'Unknown promise rejection',
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });
  }

  handleError(errorData) {
    try {
      // Enrich error data
      const enrichedError = {
        ...errorData,
        sessionId: this.getSessionId(),
        userId: this.getCurrentUserId(),
        buildVersion: process.env.REACT_APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV,
        errorId: this.generateErrorId(),
        severity: this.determineSeverity(errorData),
        tags: this.extractTags(errorData),
        breadcrumbs: this.getBreadcrumbs()
      };

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.group('🚨 Error caught by ErrorService');
        console.error('Error data:', enrichedError);
        console.groupEnd();
      }

      // Store error locally
      this.storeErrorLocally(enrichedError);

      // Queue error for sending to monitoring service
      this.queueError(enrichedError);

      // Try to send immediately if online
      if (this.isOnline) {
        this.processErrorQueue();
      }

    } catch (loggingError) {
      console.error('Failed to handle error:', loggingError);
    }
  }

  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('mindsync_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('mindsync_session_id', sessionId);
    }
    return sessionId;
  }

  getCurrentUserId() {
    try {
      // Try to get user ID from various sources
      const authUser = JSON.parse(localStorage.getItem('mindsync_user') || '{}');
      return authUser.uid || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  determineSeverity(errorData) {
    const message = errorData.message?.toLowerCase() || '';
    
    // Critical errors
    if (
      message.includes('firebase') ||
      message.includes('database') ||
      message.includes('authentication') ||
      message.includes('network') ||
      message.includes('crisis')
    ) {
      return 'critical';
    }
    
    // High severity errors
    if (
      message.includes('permission') ||
      message.includes('unauthorized') ||
      message.includes('crash') ||
      message.includes('memory')
    ) {
      return 'high';
    }
    
    // Medium severity
    if (
      message.includes('validation') ||
      message.includes('format') ||
      message.includes('parsing')
    ) {
      return 'medium';
    }
    
    return 'low';
  }

  extractTags(errorData) {
    const tags = [];
    
    // Add component tags based on stack trace
    const stack = errorData.stack || '';
    if (stack.includes('Dashboard')) tags.push('dashboard');
    if (stack.includes('Chat')) tags.push('chat');
    if (stack.includes('Checkins')) tags.push('checkins');
    if (stack.includes('Diary')) tags.push('diary');
    if (stack.includes('Settings')) tags.push('settings');
    if (stack.includes('Groups')) tags.push('groups');
    
    // Add service tags
    if (stack.includes('firebase')) tags.push('firebase');
    if (stack.includes('gemini')) tags.push('ai-service');
    if (stack.includes('speech')) tags.push('speech-service');
    if (stack.includes('notification')) tags.push('notifications');
    
    return tags;
  }

  getBreadcrumbs() {
    try {
      const breadcrumbs = JSON.parse(sessionStorage.getItem('mindsync_breadcrumbs') || '[]');
      return breadcrumbs.slice(-10); // Keep last 10 breadcrumbs
    } catch {
      return [];
    }
  }

  addBreadcrumb(action, category = 'user', data = {}) {
    try {
      const breadcrumbs = this.getBreadcrumbs();
      const breadcrumb = {
        timestamp: new Date().toISOString(),
        action,
        category,
        data: JSON.stringify(data),
        url: window.location.href
      };
      
      breadcrumbs.push(breadcrumb);
      
      // Keep only last 15 breadcrumbs
      if (breadcrumbs.length > 15) {
        breadcrumbs.splice(0, breadcrumbs.length - 15);
      }
      
      sessionStorage.setItem('mindsync_breadcrumbs', JSON.stringify(breadcrumbs));
    } catch (error) {
      console.warn('Failed to add breadcrumb:', error);
    }
  }

  storeErrorLocally(errorData) {
    try {
      const errors = JSON.parse(localStorage.getItem('mindsync_errors') || '[]');
      errors.push(errorData);
      
      // Keep only last 20 errors locally
      if (errors.length > 20) {
        errors.splice(0, errors.length - 20);
      }
      
      localStorage.setItem('mindsync_errors', JSON.stringify(errors));
    } catch (error) {
      console.warn('Failed to store error locally:', error);
    }
  }

  queueError(errorData) {
    this.errorQueue.push(errorData);
    
    // Limit queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift(); // Remove oldest error
    }
  }

  async processErrorQueue() {
    if (this.errorQueue.length === 0 || !this.isOnline) {
      return;
    }

    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // In production, send to error monitoring service (e.g., Sentry, LogRocket)
      await this.sendErrorsToService(errorsToSend);
      console.log(`Sent ${errorsToSend.length} errors to monitoring service`);
    } catch (error) {
      console.warn('Failed to send errors to monitoring service:', error);
      // Re-queue errors for retry
      this.errorQueue.unshift(...errorsToSend);
    }
  }

  async sendErrorsToService(errors) {
    // Mock implementation - in production, integrate with actual error monitoring
    if (process.env.NODE_ENV === 'development') {
      console.log('Mock sending errors to monitoring service:', errors);
      return;
    }

    // Production implementation would look like:
    /*
    try {
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errors }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Failed to send errors: ${error.message}`);
    }
    */
  }

  // Utility methods for manual error reporting
  reportError(error, context = {}) {
    this.handleError({
      type: 'manual_report',
      message: error.message,
      stack: error.stack,
      context: JSON.stringify(context),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  }

  reportUserAction(action, details = {}) {
    this.addBreadcrumb(action, 'user', details);
  }

  reportAPIError(endpoint, statusCode, responseText) {
    this.handleError({
      type: 'api_error',
      message: `API Error: ${endpoint} returned ${statusCode}`,
      endpoint,
      statusCode,
      responseText: responseText?.substring(0, 500), // Truncate long responses
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  }

  reportPerformanceIssue(metric, value, threshold) {
    if (value > threshold) {
      this.handleError({
        type: 'performance_issue',
        message: `Performance issue: ${metric} (${value}) exceeded threshold (${threshold})`,
        metric,
        value,
        threshold,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    }
  }

  // Get stored errors for debugging
  getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem('mindsync_errors') || '[]');
    } catch {
      return [];
    }
  }

  // Clear stored errors
  clearStoredErrors() {
    try {
      localStorage.removeItem('mindsync_errors');
      sessionStorage.removeItem('mindsync_breadcrumbs');
      this.errorQueue = [];
    } catch (error) {
      console.warn('Failed to clear stored errors:', error);
    }
  }
}

// Create singleton instance
const errorService = new ErrorService();

// Set up automatic breadcrumb tracking
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function(...args) {
  errorService.addBreadcrumb('navigation', 'navigation', { 
    to: args[2], 
    method: 'pushState' 
  });
  return originalPushState.apply(history, args);
};

history.replaceState = function(...args) {
  errorService.addBreadcrumb('navigation', 'navigation', { 
    to: args[2], 
    method: 'replaceState' 
  });
  return originalReplaceState.apply(history, args);
};

// Track page visibility changes
document.addEventListener('visibilitychange', () => {
  errorService.addBreadcrumb(
    document.hidden ? 'page_hidden' : 'page_visible',
    'system'
  );
});

export default errorService;
