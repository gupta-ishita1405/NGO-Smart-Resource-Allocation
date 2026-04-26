import { AlertTriangle, Clock, CheckCircle2, XCircle, Flame, Activity, Leaf } from 'lucide-react';

export const UrgencyTag = ({ urgency }) => {
  const map = {
    high: { cls: 'tag-urg-high', label: 'High Urgency', Icon: Flame },
    medium: { cls: 'tag-urg-medium', label: 'Medium', Icon: Activity },
    low: { cls: 'tag-urg-low', label: 'Low', Icon: Leaf },
  };
  const { cls, label, Icon } = map[urgency] || map.low;
  return (
    <span className={`tag-base ${cls}`} data-testid={`urgency-tag-${urgency}`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
};

export const StatusTag = ({ status }) => {
  const map = {
    pending: { cls: 'tag-status-pending', Icon: Clock, label: 'Pending' },
    accepted: { cls: 'tag-status-accepted', Icon: AlertTriangle, label: 'Accepted' },
    completed: { cls: 'tag-status-completed', Icon: CheckCircle2, label: 'Completed' },
    cancelled: { cls: 'tag-status-cancelled', Icon: XCircle, label: 'Cancelled' },
  };
  const { cls, Icon, label } = map[status] || map.pending;
  return (
    <span className={`tag-base ${cls}`} data-testid={`status-tag-${status}`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
};

export const CategoryTag = ({ category }) => {
  const labels = { food: 'Food', medical: 'Medical', safety: 'Safety', emotional: 'Emotional Support' };
  return (
    <span className="tag-base bg-[#1E3A2F]/10 text-[#1E3A2F] border border-[#1E3A2F]/20" data-testid={`category-tag-${category}`}>
      {labels[category] || category}
    </span>
  );
};

export const TrustBadge = ({ score }) => {
  const s = Math.round(score || 0);
  const color = s >= 80 ? '#1E3A2F' : s >= 60 ? '#8F9C86' : '#E0A96D';
  return (
    <span className="tag-base" style={{ background: `${color}22`, color, border: `1px solid ${color}55` }} data-testid="trust-badge">
      Trust {s}
    </span>
  );
};
