import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error('ErrorBoundary caught', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">Algo salió mal</h1>
          <p className="text-muted-foreground">Intenta recargar la página o vuelve más tarde.</p>
        </div>
      );
    }
    return this.props.children;
  }
}


