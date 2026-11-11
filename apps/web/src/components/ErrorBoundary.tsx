import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('NaviGo ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('navigo_saved_places');
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen flex items-center justify-center bg-gray-950 text-white p-6">
          <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black mb-2 text-white">Kutilmagan xatolik yuz berdi</h2>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              NaviGo interfeysida texnik nosozlik aniqlandi. Tizim xavfsizlik maqsadida himoyalandi. Sahifani qayta yuklash orqali davom etishingiz mumkin.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Qayta yuklash</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.hash = '';
                  this.setState({ hasError: false, error: null });
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-gray-700 active:scale-95"
              >
                <Home className="w-4 h-4" />
                <span>Bosh sahifa</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
