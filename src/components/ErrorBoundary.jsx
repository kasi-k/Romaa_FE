import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="font-roboto-flex h-screen w-full flex flex-col items-center justify-center bg-[#E3ECFF] dark:bg-overall_bg-dark gap-4">
          <div className="bg-white dark:bg-layout-dark rounded-2xl shadow-lg p-10 flex flex-col items-center gap-4 max-w-md w-full mx-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white text-center">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              An unexpected error occurred. Please refresh the page or contact support if the issue persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-darkest-blue text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
