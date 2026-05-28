import * as React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  handleReset = () => {
    (this as any).setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if ((this as any).state.hasError) {
      let errorMessage = "Something went wrong. Please try again.";
      let isPermissionError = false;

      try {
        const error = (this as any).state.error;
        if (error && error.message) {
          const parsed = JSON.parse(error.message);
          if (parsed.error && parsed.error.toLowerCase().includes('permission')) {
            isPermissionError = true;
            errorMessage = "You don't have permission to perform this action. Please make sure you are logged in correctly.";
          }
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-[#0d0f1a] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#13162a] border border-white/5 rounded-[2.5rem] p-10 text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertTriangle size={40} />
            </div>
            
            <h1 className="font-['Playfair_Display'] text-2xl font-bold mb-4">
              {isPermissionError ? 'Access Denied' : 'Application Error'}
            </h1>
            
            <p className="text-white/50 mb-10 leading-relaxed">
              {errorMessage}
            </p>

            <button 
              onClick={this.handleReset}
              className="w-full py-4 bg-[#c9a84c] text-[#0d0f1a] font-bold rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
            >
              <RefreshCw size={20} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
