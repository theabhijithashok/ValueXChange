import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
                        <p className="text-gray-600 mb-6">
                            We're sorry, but an unexpected error has occurred. Please try reloading the page.
                        </p>
                        {this.state.error && (
                            <details className="text-left text-xs text-gray-400 mb-4 bg-gray-50 p-2 rounded overflow-auto max-h-32">
                                <summary>Error Details</summary>
                                {this.state.error.toString()}
                            </details>
                        )}
                        <button
                            onClick={this.handleReload}
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Reload Page
                        </button>
                        <div className="mt-4">
                            <a href="/" className="text-sm text-blue-500 hover:underline">Go to Home</a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
