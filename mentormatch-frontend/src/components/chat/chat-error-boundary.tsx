"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
}

export class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Chat Error Boundary caught:", error);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full p-8">
          <Card className="max-w-md w-full bg-card border-destructive/30">
            <CardHeader className="text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-2" />
              <CardTitle className="text-lg">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                The chat encountered an unexpected error. Click below to start a fresh conversation.
              </p>
              <Button onClick={this.handleReset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Chat
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
