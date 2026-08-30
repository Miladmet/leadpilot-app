'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  sectionName?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary] Caught error in ${this.props.sectionName || 'Component'}:`, error, errorInfo);
  }

  public handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3 shadow-2xs my-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">
              This section is temporarily unavailable.
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              A temporary issue occurred while rendering {this.props.sectionName || 'this module'}. Other sections continue operating normally.
            </p>
          </div>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry Section
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
