import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { formatErr } from '../api';
import { useAuth } from '../context/AuthContext';
import { CategoryTag, StatusTag, UrgencyTag } from '../components/Tags';
import { MapPin, Filter, Hand } from 'lucide-react';
import { toast } from 'sonner';

const Browse = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ category: '', city: '', urgency: '' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = { status_f: 'pending' };
      if (filters.category) params.category = filters.category;
      if (filters.city) params.city = filters.city;
      if (filters.urgency) params.urgency = filters.urgency;
      const { data } = await api.get('/requests', { params });
      setItems(data);
    } catch (e) {
      toast.error(formatErr(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const accept = async (rid) => {
    if (!user) { toast.error('Please login as a volunteer first.'); return; }
    try {
      await api.post(`/requests/${rid}/accept`);
      toast.success('Request accepted. Check your dashboard.');
      load();
    } catch (e) {
      toast.error(formatErr(e));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20" data-testid="browse-page">
      <div className="flex items-end justify-between flex-wrap gap-6">
        <div>
          <p className="label-ns text-[#C26D5C]">Open requests</p>
          <h1 className="font-serif-ns text-4xl md:text-5xl text-[#1E3A2F] mt-3">People waiting for help.</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#5C615D]">
          <Filter className="w-4 h-4" /> Sorted by urgency &amp; recency
        </div>
      </div>

      <div className="widget-ns mt-8 grid grid-cols-1 md:grid-cols-4 gap-4" data-testid="filters">
        <select className="select-ns" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} data-testid="filter-category">
          <option value="">All Categories</option>
          <option value="food">Food</option>
          <option value="medical">Medical</option>
          <option value="safety">Safety</option>
          <option value="emotional">Emotional Support</option>
        </select>
        <select className="select-ns" value={filters.urgency} onChange={(e) => setFilters({ ...filters, urgency: e.target.value })} data-testid="filter-urgency">
          <option value="">All Urgency</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <input className="input-ns md:col-span-1" placeholder="City (e.g. Mumbai)" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} data-testid="filter-city" />
        <button onClick={load} className="btn-primary" data-testid="apply-filters">Apply</button>
      </div>

      {loading ? (
        <p className="mt-12 text-[#5C615D]" data-testid="browse-loading">Loading requests…</p>
      ) : items.length === 0 ? (
        <div className="mt-16 text-center" data-testid="browse-empty">
          <p className="font-serif-ns text-2xl text-[#1E3A2F]">No open requests right now.</p>
          <p className="text-[#5C615D] mt-2">When help is needed, it will appear here.</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="requests-grid">
          {items.map((r) => (
            <article key={r.id} className="card-ns flex flex-col" data-testid={`request-card-${r.id}`}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <CategoryTag category={r.category} />
                <UrgencyTag urgency={r.urgency} />
              </div>
              <h3 className="font-serif-ns text-2xl text-[#1E3A2F] mt-4">{r.title}</h3>
              <p className="text-sm text-[#5C615D] mt-2 leading-relaxed line-clamp-3">{r.description}</p>
              <div className="flex items-center gap-2 mt-4 text-xs text-[#5C615D]">
                <MapPin className="w-3 h-3" /> {r.city}{r.area ? ` · ${r.area}` : ''}
              </div>
              <div className="mt-auto pt-5 flex items-center justify-between">
                <StatusTag status={r.status} />
                {user ? (
                  <button onClick={() => accept(r.id)} className="btn-accent text-xs" data-testid={`accept-${r.id}`}>
                    <Hand className="w-3 h-3" /> Accept
                  </button>
                ) : (
                  <Link to="/login" className="btn-outline-ns text-xs" data-testid={`login-to-accept-${r.id}`}>Login to Accept</Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Browse;
