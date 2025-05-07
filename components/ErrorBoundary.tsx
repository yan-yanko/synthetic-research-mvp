import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error('Caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. We're working on it.</div>;
    }
    return this.props.children;
  }
} 