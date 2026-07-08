import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In a real deployment this would ship to an error-tracking service.
    console.error('CreditBridge UI crashed:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-50 text-danger">
            <AlertOctagon size={26} />
          </div>
          <h1 className="text-lg font-semibold text-ink">Something went wrong</h1>
          <p className="mt-2 max-w-sm text-sm text-ink-secondary">
            This screen hit an unexpected error. Your data is safe — reloading usually fixes it.
          </p>
          <Button className="mt-6" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
