import { useEffect, useState, useCallback } from 'react';
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

  const load = useCallback(async () => {
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
  }, [filters]);

  useEffect(() => { load(); }, [load]);

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
    <div className="min-h-screen bg-gradient-to-br from-[#FBFBF9] via-[#F5F2EB] to-[#F0EDE6]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20" data-testid="browse-page">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <p className="label-ns text-[#C26D5C]">Open Requests</p>
            <h1 className="font-serif-ns text-4xl md:text-5xl text-[#1E3A2F] mt-3">People waiting for help.</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#5C615D]">
            <Filter className="w-4 h-4" /> Sorted by urgency & recency
          </div>
        </div>

        {/* Professional filter card */}
        <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E5E1D8]/50 p-6" data-testid="filters">
          <h3 className="font-serif-ns text-xl text-[#1E3A2F] mb-4">Filter Requests</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select className="select-ns rounded-lg border-[#E5E1D8] focus:border-[#C26D5C] transition-colors duration-200" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} data-testid="filter-category">
              <option value="">All Categories</option>
              <option value="food"> Food</option>
              <option value="medical"> Medical</option>
              <option value="safety"> Safety</option>
              <option value="emotional">Emotional Support</option>
            </select>
            <select className="select-ns rounded-lg border-[#E5E1D8] focus:border-[#C26D5C] transition-colors duration-200" value={filters.urgency} onChange={(e) => setFilters({ ...filters, urgency: e.target.value })} data-testid="filter-urgency">
              <option value="">All Urgency Levels</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
            <input className="input-ns md:col-span-1 rounded-lg border-[#E5E1D8] focus:border-[#C26D5C] transition-colors duration-200" placeholder="City (e.g. Mumbai)" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} data-testid="filter-city" />
            <button onClick={load} className="btn-primary rounded-lg shadow-md hover:shadow-lg transition-all duration-200" data-testid="apply-filters">Apply Filters</button>
          </div>
        </div>

      {loading ? (
        <div className="mt-12 text-center">
          <p className="text-[#5C615D] text-lg" data-testid="browse-loading">Loading requests…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-16 text-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E5E1D8]/50 p-12" data-testid="browse-empty">
          <div className="max-w-md mx-auto">
            <h3 className="font-serif-ns text-2xl text-[#1E3A2F] mb-4">No open requests right now</h3>
            <p className="text-[#5C615D] mb-6 leading-relaxed">When people in your community need help, their requests will appear here. Check back later or help spread the word about NeedSync!</p>
            <Link to="/request" className="btn-primary inline-block rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              Request Help Instead
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="requests-grid">
          {items.map((r) => (
            <article key={r.id} className="card-ns bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 border-[#E5E1D8]/50 flex flex-col" data-testid={`request-card-${r.id}`}>
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
    </div>
  );
};

export default Browse;
