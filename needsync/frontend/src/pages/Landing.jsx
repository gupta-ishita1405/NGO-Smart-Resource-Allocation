import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';
import { ArrowRight, ShieldCheck, Sparkles, MapPin, HeartHandshake, Lock, Stethoscope, Utensils, AlertOctagon, MessagesSquare } from 'lucide-react';

const HERO_IMG = 'https://images.pexels.com/photos/6646947/pexels-photo-6646947.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1500';
const ABOUT_IMG = 'https://images.pexels.com/photos/6646926/pexels-photo-6646926.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1200';

const Landing = () => {
  const [stats, setStats] = useState({ total_requests: 0, completed: 0, pending: 0, volunteers: 0 });

  useEffect(() => {
    api.get('/stats/public').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="landing-page">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-40 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 text-[#FBFBF9] fade-in-up">
            <p className="label-ns text-[#E0A96D] mb-6">A silent, smart support network</p>
            <h1 className="font-serif-ns text-5xl md:text-7xl font-medium leading-[1.05] tracking-tight text-balance">
              For those who can&rsquo;t<br/>
              ask for help <em className="text-[#E0A96D]">publicly.</em>
            </h1>
            <p className="mt-8 text-lg md:text-xl text-[#FBFBF9]/85 max-w-2xl leading-relaxed">
              NeedSync connects people in need with the right volunteers — anonymously, locally,
              and quickly. No identity reveal. No noise. Only help that reaches.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/request" className="btn-accent" data-testid="hero-request-btn">
                Ask for Help <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/register" className="btn-outline-ns border-[#FBFBF9] text-[#FBFBF9] hover:bg-[#FBFBF9] hover:text-[#1E3A2F]" data-testid="hero-volunteer-btn">
                Become a Volunteer
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-6 text-sm text-[#FBFBF9]/80">
              <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> Anonymous by default</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Hyperlocal matching</span>
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Trust-scored network</span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-[#F4F1EA] border-y border-[#E5E1D8]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Active Volunteers', val: stats.volunteers, testid: 'stat-volunteers' },
            { label: 'Total Requests', val: stats.total_requests, testid: 'stat-requests' },
            { label: 'Lives Helped', val: stats.completed, testid: 'stat-completed' },
            { label: 'Awaiting Match', val: stats.pending, testid: 'stat-pending' },
          ].map((s) => (
            <div key={s.label} className="text-center md:text-left" data-testid={s.testid}>
              <div className="font-serif-ns text-5xl md:text-6xl text-[#1E3A2F] font-semibold">{s.val}</div>
              <div className="label-ns mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
          <div className="md:col-span-4">
            <p className="label-ns text-[#C26D5C]">Four ways we help</p>
            <h2 className="font-serif-ns text-4xl md:text-5xl text-[#1E3A2F] mt-4 leading-tight">
              Quiet help, <em>delivered</em> where it&rsquo;s needed most.
            </h2>
            <p className="mt-6 text-[#5C615D] leading-relaxed">
              Choose a category. Describe your need. Stay anonymous if you wish.
              We&rsquo;ll find the closest, most-trusted volunteer for you.
            </p>
          </div>
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { Icon: Utensils, title: 'Food', desc: 'Meals, groceries, ration kits delivered with dignity.', test: 'cat-food' },
              { Icon: Stethoscope, title: 'Medical', desc: 'Medicines, ambulance support, doctor visits.', test: 'cat-medical' },
              { Icon: AlertOctagon, title: 'Safety', desc: 'Discreet escorts, safe-shelter referrals, legal aid.', test: 'cat-safety' },
              { Icon: MessagesSquare, title: 'Emotional', desc: 'A trained listener — when you need one.', test: 'cat-emotional' },
            ].map(({ Icon, title, desc, test }) => (
              <div key={title} className="card-ns" data-testid={test}>
                <Icon className="w-7 h-7 text-[#C26D5C]" strokeWidth={1.5} />
                <h3 className="font-serif-ns text-2xl text-[#1E3A2F] mt-4">{title}</h3>
                <p className="text-sm text-[#5C615D] mt-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#1E3A2F] text-[#FBFBF9]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
          <p className="label-ns text-[#E0A96D]">How it works</p>
          <h2 className="font-serif-ns text-4xl md:text-5xl mt-4 max-w-3xl leading-tight">
            Three steps. No identity reveal.<br/>No noise.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {[
              { n: '01', t: 'Submit silently', d: 'Pick a category and urgency. Stay fully anonymous if you wish.' },
              { n: '02', t: 'Smart matching', d: 'Our engine ranks volunteers by location, skill, and trust score.' },
              { n: '03', t: 'Receive help', d: 'A vetted volunteer accepts and reaches out. Track progress live.' },
            ].map((s) => (
              <div key={s.n} className="border-t border-[#FBFBF9]/20 pt-6">
                <div className="font-serif-ns text-6xl text-[#E0A96D]">{s.n}</div>
                <h3 className="font-serif-ns text-2xl mt-4">{s.t}</h3>
                <p className="text-[#FBFBF9]/75 mt-3 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + Image */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center">
        <div className="md:col-span-6 order-2 md:order-1">
          <p className="label-ns text-[#C26D5C]">For volunteers</p>
          <h2 className="font-serif-ns text-4xl md:text-5xl text-[#1E3A2F] mt-4 leading-tight">
            Become someone&rsquo;s <em>silent</em> hero.
          </h2>
          <p className="mt-6 text-[#5C615D] leading-relaxed">
            Help people near you. Build a trust score. Make community support
            real, repeatable, and dignified.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary" data-testid="cta-volunteer">
              <HeartHandshake className="w-4 h-4" /> Sign Up to Volunteer
            </Link>
            <Link to="/browse" className="btn-outline-ns" data-testid="cta-browse">
              <Sparkles className="w-4 h-4" /> Browse Requests
            </Link>
          </div>
        </div>
        <div className="md:col-span-6 order-1 md:order-2">
          <img src={ABOUT_IMG} alt="Volunteers" className="w-full h-[400px] md:h-[520px] object-cover" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1E3A2F] text-[#FBFBF9]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="font-serif-ns text-3xl">NeedSync</div>
            <p className="text-[#FBFBF9]/70 mt-4 leading-relaxed text-sm">
              A silent, smart resource allocation platform for community support.
            </p>
          </div>
          <div>
            <p className="label-ns text-[#E0A96D]">Quick Links</p>
            <ul className="mt-4 space-y-2 text-sm text-[#FBFBF9]/85">
              <li><Link to="/request">Ask for Help</Link></li>
              <li><Link to="/browse">Browse Requests</Link></li>
              <li><Link to="/register">Volunteer</Link></li>
              <li><Link to="/track">Track Request</Link></li>
            </ul>
          </div>
          <div>
            <p className="label-ns text-[#E0A96D]">Quote</p>
            <p className="font-serif-ns text-xl mt-4 italic text-[#FBFBF9]/90 leading-snug">
              &ldquo;Most platforms assume people can ask for help publicly. We built NeedSync for those who can&rsquo;t.&rdquo;
            </p>
          </div>
        </div>
        <div className="border-t border-[#FBFBF9]/15 py-6 text-center text-xs text-[#FBFBF9]/60">
          © {new Date().getFullYear()} NeedSync
        </div>
      </footer>
    </div>
  );
};

export default Landing;
