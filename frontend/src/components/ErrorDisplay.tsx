import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type ErrorDisplayProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeLink?: boolean;
};

export function ErrorDisplay({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  showHomeLink = true,
}: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-4 max-w-md">{message}</p>
      <div className="flex gap-2">
        {onRetry && <Button onClick={onRetry}>Try Again</Button>}
        {showHomeLink && (
          <Link to="/" className={cn(buttonVariants({ variant: "outline" }))}>
            Go Home
          </Link>
        )}
      </div>
    </div>
  );
}

export function NotFoundError() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
      <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className={cn(buttonVariants())}>
        Go Home
      </Link>
    </div>
  );
}

export function LoadingError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      title="Failed to load"
      message="We couldn't load the data. Please check your connection and try again."
      onRetry={onRetry}
    />
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      title="Network Error"
      message="Unable to connect to the server. Please check your internet connection."
      onRetry={onRetry}
    />
  );
}

type InlineErrorProps = {
  message: string;
  onRetry?: () => void;
};

export function InlineError({ message, onRetry }: InlineErrorProps) {
  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-destructive">{message}</span>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
