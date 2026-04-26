import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { formatErr } from '../api';
import { CategoryTag, StatusTag, UrgencyTag } from '../components/Tags';
import { Search, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const Track = () => {
  const [params, setParams] = useSearchParams();
  const [code, setCode] = useState(params.get('code') || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchIt = async (c) => {
    if (!c) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/requests/track/${c}`);
      setData(data);
    } catch (err) {
      toast.error(formatErr(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.get('code')) fetchIt(params.get('code'));
  // eslint-disable-next-line
  }, []);

  const submit = (e) => {
    e.preventDefault();
    setParams({ code });
    fetchIt(code);
  };

  const copy = () => {
    navigator.clipboard.writeText(data.tracking_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-12 py-16" data-testid="track-page">
      <p className="label-ns text-[#C26D5C]">Track</p>
      <h1 className="font-serif-ns text-4xl md:text-5xl text-[#1E3A2F] mt-3">Where is my help?</h1>

      <form onSubmit={submit} className="mt-10 flex gap-3" data-testid="track-form">
        <input
          className="input-ns flex-1"
          placeholder="Enter tracking code (NS-XXXXXXX)"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          data-testid="track-input"
        />
        <button type="submit" className="btn-primary" data-testid="track-submit">
          <Search className="w-4 h-4" /> Track
        </button>
      </form>

      {loading && <p className="mt-8 text-[#5C615D]" data-testid="track-loading">Looking up…</p>}

      {data && (
        <div className="mt-10 widget-ns" data-testid="track-result">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-[#5C615D]">{data.tracking_code}</span>
              <button onClick={copy} className="btn-ghost-ns text-xs" data-testid="track-copy">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <StatusTag status={data.status} />
          </div>
          <h2 className="font-serif-ns text-3xl text-[#1E3A2F] mt-4">{data.title}</h2>
          <p className="text-[#2D312E] mt-3 leading-relaxed">{data.description}</p>

          <div className="flex flex-wrap gap-2 mt-5">
            <CategoryTag category={data.category} />
            <UrgencyTag urgency={data.urgency} />
            <span className="tag-base bg-[#F4F1EA] text-[#2D312E] border border-[#E5E1D8]">{data.city}</span>
          </div>

          {data.accepted_by_name && (
            <div className="mt-8 pt-6 border-t border-[#E5E1D8]">
              <p className="label-ns">Volunteer assigned</p>
              <p className="font-serif-ns text-2xl text-[#1E3A2F] mt-2">{data.accepted_by_name}</p>
            </div>
          )}

          <div className="mt-8 grid grid-cols-3 gap-2">
            {['pending', 'accepted', 'completed'].map((s, idx) => {
              const order = { pending: 1, accepted: 2, completed: 3 };
              const reached = order[data.status] >= order[s];
              return (
                <div key={s} className="text-center">
                  <div className={`h-2 ${reached ? 'bg-[#1E3A2F]' : 'bg-[#E5E1D8]'}`} />
                  <p className={`label-ns mt-2 ${reached ? 'text-[#1E3A2F]' : 'text-[#5C615D]'}`}>{idx+1}. {s}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Track;
