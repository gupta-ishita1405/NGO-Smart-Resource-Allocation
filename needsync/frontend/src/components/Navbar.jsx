import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, LogOut, LayoutDashboard, UserPlus, LogIn } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const isActive = (p) => loc.pathname === p;

  return (
    <header className="bg-[#FBFBF9]/90 backdrop-blur-xl border-b border-[#E5E1D8] sticky top-0 z-50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" data-testid="nav-logo">
          <div className="w-8 h-8 bg-[#1E3A2F] flex items-center justify-center">
            <Heart className="w-4 h-4 text-[#FBFBF9]" strokeWidth={2.2} fill="#C26D5C" />
          </div>
          <span className="font-serif-ns text-2xl font-semibold text-[#1E3A2F]">NeedSync</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" data-testid="nav-home" className={`btn-ghost-ns ${isActive('/') ? 'text-[#C26D5C]' : ''}`}>Home</Link>
          <Link to="/request" data-testid="nav-request" className={`btn-ghost-ns ${isActive('/request') ? 'text-[#C26D5C]' : ''}`}>Ask for Help</Link>
          <Link to="/track" data-testid="nav-track" className={`btn-ghost-ns ${isActive('/track') ? 'text-[#C26D5C]' : ''}`}>Track Request</Link>
          <Link to="/browse" data-testid="nav-browse" className={`btn-ghost-ns ${isActive('/browse') ? 'text-[#C26D5C]' : ''}`}>Browse Requests</Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard" className="btn-outline-ns hidden sm:inline-flex" data-testid="nav-dashboard">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <button
                onClick={() => { logout(); nav('/'); }}
                className="btn-ghost-ns"
                data-testid="nav-logout"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost-ns" data-testid="nav-login">
                <LogIn className="w-4 h-4 inline mr-1" />Login
              </Link>
              <Link to="/register" className="btn-primary text-xs" data-testid="nav-register">
                <UserPlus className="w-4 h-4" /> Volunteer
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
