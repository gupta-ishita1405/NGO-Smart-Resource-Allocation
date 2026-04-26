import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

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
    <div className="max-w-2xl mx-auto px-6 md:px-12 py-12 md:py-16" data-testid="register-page">
      <p className="label-ns text-[#C26D5C]">Become a volunteer</p>
      <h1 className="font-serif-ns text-4xl md:text-5xl text-[#1E3A2F] mt-3 leading-tight">
        Help <em>quietly.</em> Help meaningfully.
      </h1>

      <form onSubmit={submit} className="mt-10 space-y-8" data-testid="register-form">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="label-ns mb-2">Full name</p>
            <input className="input-ns" required value={form.name} onChange={(e) => set('name', e.target.value)} data-testid="reg-name" />
          </div>
          <div>
            <p className="label-ns mb-2">City</p>
            <input className="input-ns" required value={form.city} onChange={(e) => set('city', e.target.value)} data-testid="reg-city" />
          </div>
          <div>
            <p className="label-ns mb-2">Email</p>
            <input className="input-ns" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} data-testid="reg-email" />
          </div>
          <div>
            <p className="label-ns mb-2">Password (min 6)</p>
            <input className="input-ns" type="password" required minLength={6} value={form.password} onChange={(e) => set('password', e.target.value)} data-testid="reg-password" />
          </div>
        </div>

        <div>
          <p className="label-ns mb-2">Skills (select all that apply)</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {SKILL_OPTIONS.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => toggle(s)}
                data-testid={`skill-${s}`}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider font-bold border transition-all ${
                  skills.includes(s) ? 'bg-[#1E3A2F] text-[#FBFBF9] border-[#1E3A2F]' : 'bg-transparent text-[#2D312E] border-[#E5E1D8] hover:border-[#1E3A2F]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="label-ns mb-2">Short bio (optional)</p>
          <textarea className="input-ns min-h-[100px] resize-y" value={form.bio} onChange={(e) => set('bio', e.target.value)} data-testid="reg-bio" />
        </div>

        <button type="submit" className="btn-primary" disabled={busy} data-testid="reg-submit">
          <UserPlus className="w-4 h-4" /> {busy ? 'Creating…' : 'Create Account'}
        </button>

        <p className="text-sm text-[#5C615D]">
          Already a volunteer? <Link to="/login" className="text-[#C26D5C] font-bold" data-testid="link-login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
