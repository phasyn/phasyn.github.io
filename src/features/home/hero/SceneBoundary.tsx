import { Component, type ReactNode } from 'react';

interface SceneBoundaryProps {
  onError: (error: unknown) => void;
  children: ReactNode;
}

/**
 * Catches a failed chunk load or a WebGL/shader error from the lazy hero scene. The owner then keeps the static poster; the
 * error is reported once to the console (never swallowed silently) and the scene is not retried automatically.
 */
export class SceneBoundary extends Component<SceneBoundaryProps, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: unknown) {
    console.error('[hero] WebGL scene unavailable, showing the poster instead.', error);
    this.props.onError(error);
  }

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}
