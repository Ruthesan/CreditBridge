import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary">
        <Compass size={28} />
      </div>
      <h1 className="mt-6 text-3xl font-bold text-ink">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-secondary">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/" className="mt-6">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
