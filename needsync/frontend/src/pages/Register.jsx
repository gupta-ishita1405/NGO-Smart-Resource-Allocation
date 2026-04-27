import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { UserPlus, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const SKILL_OPTIONS = ['doctor', 'nurse', 'first-aid', 'driver', 'cooking', 'logistics', 'counsellor', 'legal', 'social-work', 'security'];

const Register = () => {
  const { register, formatErr } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', city: '', bio: '',
  });
  const [skills, setSkills] = useState([]);
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (s) => setSkills((sk) => sk.includes(s) ? sk.filter((x) => x !== s) : [...sk, s]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register({ ...form, skills });
      toast.success('Welcome to NeedSync.');
      nav('/dashboard');
    } catch (err) {
      toast.error(formatErr(err));
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBFBF9] to-[#F5F2EB] py-12">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[#1E3A2F] flex items-center justify-center rounded-full">
              <Heart className="w-6 h-6 text-[#FBFBF9]" strokeWidth={2.2} fill="#C26D5C" />
            </div>
          </div>
          <h1 className="font-serif-ns text-4xl md:text-5xl text-[#1E3A2F] leading-tight">
            Join NeedSync as a Volunteer
          </h1>
          <p className="text-[#5C615D] mt-4 text-lg">Help quietly. Help meaningfully. Make a difference in your community.</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-[#1E3A2F]">Create Your Account</CardTitle>
            <CardDescription>Fill in your details to get started as a volunteer.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-8" data-testid="register-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label-ns mb-2 block">Full Name</label>
                  <input className="input-ns" required value={form.name} onChange={(e) => set('name', e.target.value)} data-testid="reg-name" placeholder="Enter your full name" />
                </div>
                <div>
                  <label className="label-ns mb-2 block">City</label>
                  <input className="input-ns" required value={form.city} onChange={(e) => set('city', e.target.value)} data-testid="reg-city" placeholder="e.g. Mumbai" />
                </div>
                <div>
                  <label className="label-ns mb-2 block">Email Address</label>
                  <input className="input-ns" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} data-testid="reg-email" placeholder="Enter your email" />
                </div>
                <div>
                  <label className="label-ns mb-2 block">Password (min 6 characters)</label>
                  <input className="input-ns" type="password" required minLength={6} value={form.password} onChange={(e) => set('password', e.target.value)} data-testid="reg-password" placeholder="Create a password" />
                </div>
              </div>

              <div>
                <label className="label-ns mb-4 block">Skills (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggle(s)}
                      data-testid={`skill-${s}`}
                      className={`px-4 py-2 text-sm uppercase tracking-wider font-bold border rounded-md transition-all ${
                        skills.includes(s) ? 'bg-[#1E3A2F] text-[#FBFBF9] border-[#1E3A2F]' : 'bg-transparent text-[#2D312E] border-[#E5E1D8] hover:border-[#1E3A2F]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-ns mb-2 block">Short Bio (optional)</label>
                <textarea className="input-ns min-h-[100px] resize-y" value={form.bio} onChange={(e) => set('bio', e.target.value)} data-testid="reg-bio" placeholder="Tell us a bit about yourself and your motivation to help." />
              </div>

              <button type="submit" className="btn-primary w-full justify-center" disabled={busy} data-testid="reg-submit">
                <UserPlus className="w-4 h-4" /> {busy ? 'Creating Account…' : 'Create Account'}
              </button>

              <p className="text-sm text-[#5C615D] text-center">
                Already a volunteer? <Link to="/login" className="text-[#C26D5C] font-bold hover:underline" data-testid="link-login">Sign in</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
