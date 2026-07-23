import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-6xl font-bold text-brand-600">404</p>
      <h1 className="text-lg font-semibold text-[var(--text-primary)]">Page not found</h1>
      <p className="max-w-sm text-sm text-[var(--text-secondary)]">
        The page you're looking for doesn't exist. Let's get you back to editing.
      </p>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
