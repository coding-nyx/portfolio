import { Component } from 'react';
import './errorBoundary.css';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Portfolio render failed:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if ('fallback' in this.props) return this.props.fallback;
    return (
      <div className="app-error" role="alert">
        <h1>This section could not load.</h1>
        <button type="button" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </div>
    );
  }
}
