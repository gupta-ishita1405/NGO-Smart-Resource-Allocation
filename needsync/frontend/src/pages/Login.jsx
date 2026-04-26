import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

const Login = () => {
  const { login, formatErr } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('demo@needsync.org');
  const [password, setPassword] = useState('Demo@123');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success('Welcome back.');
      nav('/dashboard');
    } catch (err) {
      toast.error(formatErr(err));
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-[80vh] grid place-items-center px-6" data-testid="login-page">
      <div className="w-full max-w-md">
        <p className="label-ns text-[#C26D5C]">Volunteer access</p>
        <h1 className="font-serif-ns text-4xl text-[#1E3A2F] mt-3">Welcome back.</h1>
        <p className="text-[#5C615D] mt-3 text-sm">Continue helping people near you.</p>

        <form onSubmit={submit} className="mt-10 space-y-6" data-testid="login-form">
          <div>
            <p className="label-ns mb-2">Email</p>
            <input className="input-ns" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} data-testid="login-email" />
          </div>
          <div>
            <p className="label-ns mb-2">Password</p>
            <input className="input-ns" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} data-testid="login-password" />
          </div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={busy} data-testid="login-submit">
            <LogIn className="w-4 h-4" /> {busy ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="text-sm text-[#5C615D] mt-8">
          New volunteer? <Link to="/register" className="text-[#C26D5C] font-bold" data-testid="link-register">Create an account</Link>
        </p>
        <p className="text-xs text-[#8F9C86] mt-4">Demo: demo@needsync.org / Demo@123</p>
      </div>
    </div>
  );
};

export default Login;
