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
    <div className="min-h-screen bg-gradient-to-br from-[#FBFBF9] via-[#F5F2EB] to-[#F0EDE6]">
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-16" data-testid="track-page">
        <div className="text-center mb-12">
          <p className="label-ns text-[#C26D5C]">Track Your Request</p>
          <h1 className="font-serif-ns text-4xl md:text-5xl text-[#1E3A2F] mt-3">Where is my help?</h1>
          <p className="text-[#5C615D] mt-4 max-w-lg mx-auto">Enter your tracking code below to see the status of your help request and connect with your volunteer.</p>
        </div>

        <form onSubmit={submit} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E5E1D8]/50 p-6" data-testid="track-form">
          <div className="flex gap-3">
            <input
              className="input-ns flex-1 rounded-lg border-[#E5E1D8] focus:border-[#C26D5C] transition-colors duration-200"
              placeholder="Enter tracking code (NS-XXXXXXX)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              data-testid="track-input"
            />
            <button type="submit" className="btn-primary rounded-lg shadow-md hover:shadow-lg transition-all duration-200" data-testid="track-submit">
              <Search className="w-4 h-4" /> Track
            </button>
          </div>
        </form>

        {loading && (
          <div className="mt-8 text-center">
            <p className="text-[#5C615D] text-lg" data-testid="track-loading">Looking up your request…</p>
          </div>
        )}

        {!data && !loading && (
          <div className="mt-12 text-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E5E1D8]/50 p-12" data-testid="track-empty">
            <div className="max-w-md mx-auto">
              <h3 className="font-serif-ns text-2xl text-[#1E3A2F] mb-4">Track Your Help Request</h3>
              <p className="text-[#5C615D] mb-6 leading-relaxed">Enter the tracking code you received when you submitted your request to see its current status and connect with your volunteer.</p>
              <div className="text-sm text-[#8F9C86] bg-[#F5F2EB] rounded-lg p-4">
                <strong>Example:</strong> NS-ABC1234
              </div>
            </div>
          </div>
        )}

        {data && (
          <div className="mt-10 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E5E1D8]/50 p-8" data-testid="track-result">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-[#5C615D] bg-[#F5F2EB] px-3 py-1 rounded-lg border border-[#E5E1D8]">{data.tracking_code}</span>
                <button onClick={copy} className="btn-ghost-ns text-xs hover:text-[#C26D5C] transition-colors duration-200" data-testid="track-copy">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <StatusTag status={data.status} />
            </div>

            <h2 className="font-serif-ns text-3xl text-[#1E3A2F] mb-4">{data.title}</h2>
            <p className="text-[#2D312E] mb-6 leading-relaxed">{data.description}</p>

            <div className="flex flex-wrap gap-2 mb-8">
              <CategoryTag category={data.category} />
              <UrgencyTag urgency={data.urgency} />
              <span className="tag-base bg-[#F4F1EA] text-[#2D312E] border border-[#E5E1D8]">{data.city}</span>
            </div>

            {data.accepted_by_name && (
              <div className="bg-[#F5F2EB] rounded-xl p-6 mb-8 border border-[#E5E1D8]/50">
                <p className="label-ns text-[#8F9C86]">Volunteer Assigned</p>
                <p className="font-serif-ns text-2xl text-[#1E3A2F] mt-2">{data.accepted_by_name}</p>
                <p className="text-[#5C615D] mt-1">Your volunteer is on the way! </p>
              </div>
            )}

            <div className="border-t border-[#E5E1D8]/50 pt-8">
              <h3 className="font-serif-ns text-xl text-[#1E3A2F] mb-6">Request Progress</h3>
              <div className="grid grid-cols-3 gap-4">
                {['pending', 'accepted', 'completed'].map((s, idx) => {
                  const order = { pending: 1, accepted: 2, completed: 3 };
                  const reached = order[data.status] >= order[s];
                  const current = data.status === s;
                  return (
                    <div key={s} className="text-center">
                      <div className={`h-3 rounded-full transition-all duration-300 ${reached ? 'bg-[#1E3A2F]' : 'bg-[#E5E1D8]'}`} />
                      <p className={`label-ns mt-3 transition-colors duration-300 ${current ? 'text-[#C26D5C] font-bold' : reached ? 'text-[#1E3A2F]' : 'text-[#5C615D]'}`}>
                        {idx+1}. {s.charAt(0).toUpperCase() + s.slice(1)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Track;
