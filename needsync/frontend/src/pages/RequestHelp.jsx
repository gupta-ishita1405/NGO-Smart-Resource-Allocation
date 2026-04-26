import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api, { formatErr } from '../api';
import { CategoryTag } from '../components/Tags';
import { Utensils, Stethoscope, AlertOctagon, MessagesSquare, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

const CATEGORIES = [
  { id: 'food', label: 'Food', Icon: Utensils, hint: 'Meals, groceries, ration' },
  { id: 'medical', label: 'Medical', Icon: Stethoscope, hint: 'Medicines, doctor, hospital' },
  { id: 'safety', label: 'Safety', Icon: AlertOctagon, hint: 'Shelter, escort, legal' },
  { id: 'emotional', label: 'Emotional', Icon: MessagesSquare, hint: 'Listener, counselling' },
];

const RequestHelp = () => {
  const nav = useNavigate();
  const [form, setForm] = useState({
    category: 'food',
    title: '',
    description: '',
    urgency: 'medium',
    city: '',
    area: '',
    contact_method: 'in_app',
    contact_value: '',
    is_anonymous: true,
    requester_alias: 'Anonymous',
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.city.trim()) {
      toast.error('Please fill title, description and city.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/requests', form);
      toast.success('Request submitted. A volunteer will reach out soon.');
      nav(`/track?code=${data.tracking_code}`);
    } catch (err) {
      toast.error(formatErr(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-20" data-testid="request-help-page">
      <p className="label-ns text-[#C26D5C]">Step 1 — Quietly</p>
      <h1 className="font-serif-ns text-4xl md:text-5xl text-[#1E3A2F] mt-3 leading-tight">
        Tell us what you need.<br/>We&rsquo;ll handle the rest.
      </h1>
      <div className="flex items-center gap-2 mt-6 text-sm text-[#5C615D]">
        <Lock className="w-4 h-4" /> Your identity stays private unless you choose otherwise.
      </div>

      <form onSubmit={submit} className="mt-10 space-y-12" data-testid="request-form">
        {/* Category */}
        <div>
          <p className="label-ns mb-4">Category</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map(({ id, label, Icon, hint }) => (
              <button
                type="button"
                key={id}
                onClick={() => set('category', id)}
                data-testid={`cat-btn-${id}`}
                className={`text-left p-5 border transition-all ${
                  form.category === id
                    ? 'border-[#1E3A2F] bg-[#1E3A2F] text-[#FBFBF9]'
                    : 'border-[#E5E1D8] bg-[#FBFBF9] hover:border-[#1E3A2F]'
                }`}
              >
                <Icon className="w-6 h-6" strokeWidth={1.5} />
                <div className="font-serif-ns text-2xl mt-3">{label}</div>
                <div className={`text-xs mt-1 ${form.category === id ? 'text-[#FBFBF9]/75' : 'text-[#5C615D]'}`}>{hint}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Urgency */}
        <div>
          <p className="label-ns mb-4">Urgency</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { v: 'high', label: 'High — emergency', cls: 'tag-urg-high' },
              { v: 'medium', label: 'Medium', cls: 'tag-urg-medium' },
              { v: 'low', label: 'Low', cls: 'tag-urg-low' },
            ].map((u) => (
              <button
                type="button"
                key={u.v}
                onClick={() => set('urgency', u.v)}
                data-testid={`urg-btn-${u.v}`}
                className={`p-4 border-2 transition-all font-bold uppercase tracking-wider text-xs ${
                  form.urgency === u.v ? `${u.cls} border-transparent` : 'bg-transparent border-[#E5E1D8] text-[#2D312E]'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title + description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="label-ns mb-2">Short title</p>
            <input
              data-testid="input-title"
              className="input-ns"
              placeholder="e.g. Need rations for 3 days"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>
          <div>
            <p className="label-ns mb-2">City</p>
            <input
              data-testid="input-city"
              className="input-ns"
              placeholder="e.g. Mumbai"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
            />
          </div>
        </div>

        <div>
          <p className="label-ns mb-2">Describe your need</p>
          <textarea
            data-testid="input-description"
            className="input-ns min-h-[120px] resize-y"
            placeholder="Be as specific or as private as you wish."
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="label-ns mb-2">Area / locality (optional)</p>
            <input
              data-testid="input-area"
              className="input-ns"
              placeholder="e.g. Andheri West"
              value={form.area}
              onChange={(e) => set('area', e.target.value)}
            />
          </div>
          <div>
            <p className="label-ns mb-2">Contact (optional)</p>
            <input
              data-testid="input-contact"
              className="input-ns"
              placeholder="Phone / email — leave blank for fully anonymous"
              value={form.contact_value}
              onChange={(e) => set('contact_value', e.target.value)}
            />
          </div>
        </div>

        <div className="widget-ns flex items-start gap-4">
          <input
            type="checkbox"
            id="anon"
            data-testid="input-anon"
            checked={form.is_anonymous}
            onChange={(e) => set('is_anonymous', e.target.checked)}
            className="mt-1 w-5 h-5 accent-[#1E3A2F]"
          />
          <label htmlFor="anon" className="text-sm text-[#2D312E]">
            <span className="font-bold">Stay anonymous.</span> We will share only your category, urgency, and city with volunteers.
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-4">
          <button type="submit" className="btn-accent" disabled={submitting} data-testid="submit-request">
            {submitting ? 'Submitting…' : 'Submit Request'} <ArrowRight className="w-4 h-4" />
          </button>
          <CategoryTag category={form.category} />
          <span className="flex items-center gap-1 text-xs text-[#5C615D]">
            <ShieldCheck className="w-4 h-4" /> Encrypted end-to-end
          </span>
        </div>
      </form>
    </div>
  );
};

export default RequestHelp;
