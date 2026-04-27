import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { LogIn, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Login = () => {
  const { login, formatErr } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-gradient-to-br from-[#FBFBF9] to-[#F5F2EB] flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[#1E3A2F] flex items-center justify-center rounded-full">
              <Heart className="w-6 h-6 text-[#FBFBF9]" strokeWidth={2.2} fill="#C26D5C" />
            </div>
          </div>
          <CardTitle className="font-serif-ns text-3xl text-[#1E3A2F]">Sign in to NeedSync</CardTitle>
          <CardDescription className="text-[#5C615D] mt-2">Access your volunteer dashboard and help others in need.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-6" data-testid="login-form">
            <div>
              <label className="label-ns mb-2 block">Email Address</label>
              <input className="input-ns" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} data-testid="login-email" placeholder="Enter your email" autoComplete="email" />
            </div>
            <div>
              <label className="label-ns mb-2 block">Password</label>
              <input className="input-ns" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} data-testid="login-password" placeholder="Enter your password" autoComplete="current-password" />
            </div>
            <button type="submit" className="btn-primary w-full justify-center" disabled={busy} data-testid="login-submit">
              <LogIn className="w-4 h-4" /> {busy ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <p className="text-sm text-[#5C615D] mt-8 text-center">
            New volunteer? <Link to="/register" className="text-[#C26D5C] font-bold hover:underline" data-testid="link-register">Create an account</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
