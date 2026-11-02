import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-brand">404</p>
      <h1 className="mt-3 font-display text-5xl">This table is empty</h1>
      <p className="mt-3 max-w-md text-muted">The page you asked for is not on the menu.</p>
      <Link to="/" className="mt-8 rounded-full bg-brand px-6 py-3 font-semibold text-white">
        Back to home
      </Link>
    </div>
  );
}
