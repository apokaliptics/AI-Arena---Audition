/**
 * Vietnamese Traditional Costume Studio - Error Boundary
 * Bắt lỗi ngoại lệ của các component con, bảo đảm app không sập toàn cục.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center p-6 bg-[#161a22] border border-red-500/30 rounded-2xl text-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
          <h3 className="text-sm font-bold text-zinc-100 mb-1">
            {this.props.fallbackTitle || 'Đã xảy ra lỗi trong thành phần này'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mb-4 font-mono">
            {this.state.error?.message || 'Lỗi không xác định'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222733] hover:bg-[#2c3342] text-xs text-zinc-200 border border-white/10 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Thử tải lại thành phần</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
