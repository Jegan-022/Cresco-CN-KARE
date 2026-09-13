import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ServerCrash404Page } from './ServerCrash404Page';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Cresco CN ErrorBoundary caught unhandled server / runtime crash:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  public handleNavigateHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ServerCrash404Page
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetErrorBoundary={this.resetErrorBoundary}
          onNavigateHome={this.handleNavigateHome}
          errorCode="404"
          customTitle="Runtime Crash / Route Failure (404)"
          customMessage="A critical runtime exception or server module disconnect occurred. Cresco CN state recovery has halted execution to prevent data corruption."
        />
      );
    }

    return this.props.children;
  }
}
