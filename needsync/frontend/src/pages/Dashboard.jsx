import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api, { formatErr } from '../api';
import { useAuth } from '../context/AuthContext';
import { CategoryTag, StatusTag, TrustBadge, UrgencyTag } from '../components/Tags';
import { CheckCircle2, RefreshCw, MapPin, Hand, X } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/volunteer/dashboard');
      setData(data);
    } catch (e) {
      toast.error(formatErr(e));
    } finally { setLoading(false); }
  };

  useEffect(() => { if (user) load(); /* eslint-disable-next-line */ }, [user]);

  const act = async (rid, action) => {
    try {
      await api.post(`/requests/${rid}/${action}`);
      toast.success(action === 'complete' ? 'Marked completed. Trust score updated.' : `Request ${action}ed.`);
      await Promise.all([load(), refreshUser()]);
    } catch (e) {
      toast.error(formatErr(e));
    }
  };

  const accept = async (rid) => {
    try {
      await api.post(`/requests/${rid}/accept`);
      toast.success('Accepted. The requester will be notified.');
      await Promise.all([load(), refreshUser()]);
    } catch (e) {
      toast.error(formatErr(e));
    }
  };

  if (authLoading) return <div className="p-12 text-[#5C615D]">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12" data-testid="dashboard-page">
      {/* Header bar */}
      <div className="bg-[#1E3A2F] text-[#FBFBF9] px-8 py-10 flex flex-wrap gap-6 items-end justify-between">
        <div>
          <p className="label-ns text-[#E0A96D]">Volunteer Console</p>
          <h1 className="font-serif-ns text-4xl md:text-5xl mt-2">{user.name}</h1>
          <p className="text-[#FBFBF9]/75 mt-2 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {user.city} · {user.skills?.join(', ') || 'No skills listed'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TrustBadge score={data?.stats?.trust_score ?? user.trust_score} />
          <button onClick={load} className="btn-ghost-ns text-[#FBFBF9]" data-testid="dashboard-refresh">
            <RefreshCw className="w-4 h-4 inline" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8" data-testid="dashboard-stats">
        {[
          { label: 'Trust score', val: Math.round(data?.stats?.trust_score ?? user.trust_score), test: 'stat-trust' },
          { label: 'Currently helping', val: data?.stats?.accepted_count ?? 0, test: 'stat-accepted' },
          { label: 'Lives helped', val: data?.stats?.completed_count ?? 0, test: 'stat-completed' },
          { label: 'Nearby pending', val: data?.stats?.nearby_pending ?? 0, test: 'stat-nearby' },
        ].map((s) => (
          <div key={s.label} className="widget-ns" data-testid={s.test}>
            <p className="label-ns">{s.label}</p>
            <p className="font-serif-ns text-5xl text-[#1E3A2F] mt-3">{s.val}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="mt-12 text-[#5C615D]">Loading…</p>
      ) : (
        <>
          {/* Currently helping */}
          <section className="mt-16">
            <h2 className="font-serif-ns text-3xl text-[#1E3A2F]">Currently helping</h2>
            <div className="divider-ns mt-3" />
            {(!data?.accepted || data.accepted.length === 0) ? (
              <p className="text-[#5C615D] mt-6 text-sm" data-testid="no-accepted">No active commitments. Browse below to start helping.</p>
            ) : (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.accepted.map((r) => (
                  <article key={r.id} className="card-ns" data-testid={`accepted-${r.id}`}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CategoryTag category={r.category} />
                      <UrgencyTag urgency={r.urgency} />
                    </div>
                    <h3 className="font-serif-ns text-2xl text-[#1E3A2F] mt-4">{r.title}</h3>
                    <p className="text-sm text-[#5C615D] mt-2 leading-relaxed">{r.description}</p>
                    <div className="text-xs text-[#5C615D] mt-3 flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.city}</div>
                    {r.contact_value && (
                      <div className="text-xs text-[#1E3A2F] mt-2">Contact: <span className="font-bold">{r.contact_value}</span></div>
                    )}
                    <div className="flex gap-2 mt-5">
                      <button onClick={() => act(r.id, 'complete')} className="btn-primary text-xs" data-testid={`complete-${r.id}`}>
                        <CheckCircle2 className="w-3 h-3" /> Mark completed
                      </button>
                      <button onClick={() => act(r.id, 'cancel')} className="btn-ghost-ns text-xs" data-testid={`cancel-${r.id}`}>
                        <X className="w-3 h-3" /> Release
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Nearby pending */}
          <section className="mt-16">
            <div className="flex items-end justify-between flex-wrap gap-2">
              <h2 className="font-serif-ns text-3xl text-[#1E3A2F]">Nearby requests in {user.city}</h2>
              <Link to="/browse" className="btn-ghost-ns text-xs" data-testid="see-all-link">See all →</Link>
            </div>
            <div className="divider-ns mt-3" />
            {(!data?.nearby_pending || data.nearby_pending.length === 0) ? (
              <p className="text-[#5C615D] mt-6 text-sm" data-testid="no-nearby">No nearby pending requests right now.</p>
            ) : (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.nearby_pending.slice(0, 6).map((r) => (
                  <article key={r.id} className="card-ns" data-testid={`nearby-${r.id}`}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CategoryTag category={r.category} />
                      <UrgencyTag urgency={r.urgency} />
                    </div>
                    <h3 className="font-serif-ns text-xl text-[#1E3A2F] mt-3">{r.title}</h3>
                    <p className="text-sm text-[#5C615D] mt-2 line-clamp-3">{r.description}</p>
                    <div className="flex items-center justify-between mt-5">
                      <StatusTag status={r.status} />
                      <button onClick={() => accept(r.id)} className="btn-accent text-xs" data-testid={`dash-accept-${r.id}`}>
                        <Hand className="w-3 h-3" /> Accept
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Completed history */}
          {data?.completed?.length > 0 && (
            <section className="mt-16">
              <h2 className="font-serif-ns text-3xl text-[#1E3A2F]">Completed</h2>
              <div className="divider-ns mt-3" />
              <div className="mt-6 space-y-3">
                {data.completed.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 p-4 border border-[#E5E1D8] bg-[#FBFBF9] flex-wrap" data-testid={`completed-${r.id}`}>
                    <div className="flex items-center gap-3 flex-wrap">
                      <CategoryTag category={r.category} />
                      <span className="font-serif-ns text-lg text-[#1E3A2F]">{r.title}</span>
                    </div>
                    <StatusTag status={r.status} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
