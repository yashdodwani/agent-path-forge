import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallbackAction?: () => void;
}

interface State {
  hasError: boolean;
}

export class GraphErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('3D graph failed to render:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-6">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            Your browser couldn't render the 3D view (likely a WebGL limitation).
            Switch to List View below.
          </p>
          {this.props.fallbackAction && (
            <Button variant="outline" onClick={this.props.fallbackAction}>
              Switch to List View
            </Button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}