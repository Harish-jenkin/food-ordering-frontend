import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/api';

export default function AdminLogin() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@spicehaven.test');
  const [password, setPassword] = useState('Admin@12345');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not sign in.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink p-4">
      <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-brand/30 blur-3xl" />
      <div className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
      <form onSubmit={submit} className="relative w-full max-w-md space-y-5 rounded-[2rem] bg-white p-8 shadow-2xl">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand font-display text-xl text-white">S</span>
          <h1 className="font-display mt-4 text-3xl">Staff login</h1>
          <p className="mt-1 text-sm text-muted">Kitchen dashboard for menus, prices, and orders.</p>
        </div>
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <label className="block text-sm font-medium">
          Email
          <span className="field-shell mt-1.5">
            <Mail size={18} className="text-brand" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </span>
        </label>
        <label className="block text-sm font-medium">
          Password
          <span className="field-shell mt-1.5">
            <Lock size={18} className="text-brand" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </span>
        </label>
        <button type="submit" disabled={loading} className="w-full rounded-full bg-brand py-3 font-semibold text-white disabled:opacity-60">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
