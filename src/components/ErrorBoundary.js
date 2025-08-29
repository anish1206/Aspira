// src/components/ErrorBoundary.js
import React from 'react';
import { Result, Button, Card, Alert, Collapse, Typography } from 'antd';
import { 
  BugOutlined, 
  ReloadOutlined, 
  HomeOutlined, 
  ExclamationCircleOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons';

const { Panel } = Collapse;
const { Text, Paragraph } = Typography;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      showDetails: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    this.setState({
      error,
      errorInfo,
      hasError: true
    });

    // Log error to console for development
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Error info:', errorInfo);

    // In production, this would send error to monitoring service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    try {
      // In production, send to error monitoring service like Sentry
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.props.userId || 'anonymous'
      };

      // For MVP, just log to console
      console.error('Error report:', errorReport);
      
      // Store error in localStorage for debugging
      const existingErrors = JSON.parse(localStorage.getItem('mindsync_errors') || '[]');
      existingErrors.push(errorReport);
      
      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }
      
      localStorage.setItem('mindsync_errors', JSON.stringify(existingErrors));
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  getErrorMessage = () => {
    const { error } = this.state;
    
    if (error?.message?.includes('Firebase')) {
      return {
        title: 'Connection Issue',
        description: 'We\'re having trouble connecting to our servers. Please check your internet connection and try again.',
        type: 'warning',
        actions: ['retry', 'reload']
      };
    }
    
    if (error?.message?.includes('Network')) {
      return {
        title: 'Network Error',
        description: 'Unable to connect to Mindsync services. Please check your internet connection.',
        type: 'warning',
        actions: ['retry', 'reload']
      };
    }
    
    if (error?.message?.includes('permission') || error?.message?.includes('auth')) {
      return {
        title: 'Authentication Issue',
        description: 'There was a problem with your session. Please sign in again.',
        type: 'error',
        actions: ['home', 'reload']
      };
    }
    
    // Generic error
    return {
      title: 'Something went wrong',
      description: 'An unexpected error occurred. Our team has been notified and is working on a fix.',
      type: 'error',
      actions: ['retry', 'home', 'reload']
    };
  };

  renderErrorActions = (actions) => {
    const actionComponents = [];
    
    if (actions.includes('retry')) {
      actionComponents.push(
        <Button 
          key="retry"
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={this.handleRetry}
          style={{ marginRight: 8 }}
        >
          Try Again
        </Button>
      );
    }
    
    if (actions.includes('home')) {
      actionComponents.push(
        <Button 
          key="home"
          icon={<HomeOutlined />} 
          onClick={this.handleGoHome}
          style={{ marginRight: 8 }}
        >
          Go to Dashboard
        </Button>
      );
    }
    
    if (actions.includes('reload')) {
      actionComponents.push(
        <Button 
          key="reload"
          icon={<ReloadOutlined />} 
          onClick={this.handleReload}
        >
          Refresh Page
        </Button>
      );
    }
    
    return actionComponents;
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.getErrorMessage();
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return (
        <div style={{ 
          padding: '40px 20px', 
          maxWidth: '800px', 
          margin: '0 auto',
          background: '#f8f9fa',
          minHeight: '100vh'
        }}>
          <Card>
            <Result
              status={errorMessage.type}
              icon={<BugOutlined style={{ color: '#ff4d4f' }} />}
              title={errorMessage.title}
              subTitle={errorMessage.description}
              extra={this.renderErrorActions(errorMessage.actions)}
            />
            
            {this.state.retryCount > 2 && (
              <Alert
                message="Multiple Retry Attempts"
                description="If the problem persists, please try refreshing the page or contact support."
                type="warning"
                showIcon
                icon={<ExclamationCircleOutlined />}
                style={{ marginTop: 16 }}
              />
            )}
            
            <div style={{ marginTop: 24 }}>
              <Alert
                message="Need Help?"
                description={
                  <div>
                    <Paragraph style={{ marginBottom: 8 }}>
                      If you continue experiencing issues, you can:
                    </Paragraph>
                    <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                      <li>Contact our support team at <a href="mailto:support@mindsync.app">support@mindsync.app</a></li>
                      <li>Call crisis support: <a href="tel:+919152987821">+91-9152987821</a> (AASRA - 24x7)</li>
                      <li>Report this error with ID: <Text code>{this.state.errorId}</Text></li>
                    </ul>
                  </div>
                }
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
              />
            </div>
            
            {isDevelopment && (
              <div style={{ marginTop: 24 }}>
                <Collapse>
                  <Panel header="Developer Information" key="1">
                    <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
                      <Text strong>Error:</Text>
                      <pre style={{ 
                        background: '#fff', 
                        padding: 8, 
                        margin: '8px 0', 
                        fontSize: 12,
                        whiteSpace: 'pre-wrap',
                        maxHeight: '200px',
                        overflow: 'auto'
                      }}>
                        {this.state.error?.toString()}
                      </pre>
                      
                      <Text strong>Stack Trace:</Text>
                      <pre style={{ 
                        background: '#fff', 
                        padding: 8, 
                        margin: '8px 0', 
                        fontSize: 11,
                        whiteSpace: 'pre-wrap',
                        maxHeight: '200px',
                        overflow: 'auto'
                      }}>
                        {this.state.error?.stack}
                      </pre>
                      
                      {this.state.errorInfo && (
                        <>
                          <Text strong>Component Stack:</Text>
                          <pre style={{ 
                            background: '#fff', 
                            padding: 8, 
                            margin: '8px 0', 
                            fontSize: 11,
                            whiteSpace: 'pre-wrap',
                            maxHeight: '150px',
                            overflow: 'auto'
                          }}>
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </>
                      )}
                    </div>
                  </Panel>
                </Collapse>
              </div>
            )}
          </Card>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundaries
export const withErrorBoundary = (Component, fallback = null) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Async error boundary for handling promise rejections
export class AsyncErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidMount() {
    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handlePromiseRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection);
  }

  handlePromiseRejection = (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Only trigger error boundary for critical errors
    if (this.isCriticalError(event.reason)) {
      this.setState({
        hasError: true,
        error: new Error(`Async Error: ${event.reason}`)
      });
    }
  };

  isCriticalError = (error) => {
    const criticalErrors = [
      'Firebase',
      'Network request failed',
      'Authentication',
      'Database connection'
    ];
    
    const errorString = error?.toString() || '';
    return criticalErrors.some(critical => errorString.includes(critical));
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundary>
          {this.props.children}
        </ErrorBoundary>
      );
    }

    return this.props.children;
  }
}

// Service-specific error boundaries
export const ChatErrorBoundary = ({ children }) => (
  <ErrorBoundary
    fallback={
      <div style={{ padding: 20, textAlign: 'center' }}>
        <Alert
          message="Chat Service Error"
          description="The chat feature is temporarily unavailable. Please try refreshing the page."
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          }
        />
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export const DashboardErrorBoundary = ({ children }) => (
  <ErrorBoundary
    fallback={
      <div style={{ padding: 20, textAlign: 'center' }}>
        <Alert
          message="Dashboard Loading Error"
          description="Unable to load your dashboard. Please try again."
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => window.location.reload()}>
              Reload Dashboard
            </Button>
          }
        />
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export const CheckinErrorBoundary = ({ children }) => (
  <ErrorBoundary
    fallback={
      <div style={{ padding: 20, textAlign: 'center' }}>
        <Alert
          message="Check-in Service Error"
          description="Unable to process your mood check-in. Your data is safe, please try again."
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={() => window.location.reload()}>
              Retry Check-in
            </Button>
          }
        />
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;
