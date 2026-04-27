import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, LogOut, LayoutDashboard, UserPlus, LogIn, User, HelpCircle, Menu, X, CircleHelp } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isActive = (p) => loc.pathname === p;

  return (
    <header className="bg-gradient-to-r from-[#FBFBF9]/95 via-[#F5F2EB]/95 to-[#FBFBF9]/95 backdrop-blur-xl border-b border-[#E5E1D8]/30 sticky top-0 z-50 shadow-lg" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform duration-200" data-testid="nav-logo">
          <div className="w-10 h-10 bg-gradient-to-br from-[#1E3A2F] to-[#2D4A3A] flex items-center justify-center rounded-xl shadow-md">
            <Heart className="w-5 h-5 text-[#FBFBF9]" strokeWidth={2.2} fill="#C26D5C" />
          </div>
          <span className="font-serif-ns text-2xl font-bold text-[#1E3A2F] bg-gradient-to-r from-[#1E3A2F] to-[#2D4A3A] bg-clip-text text-transparent">NeedSync</span>
        </Link>

        <nav className="hidden md:flex items-center gap-3">
          <Link to="/" data-testid="nav-home" className={`btn-ghost-ns transition-all duration-200 rounded-lg ${isActive('/') ? 'text-[#C26D5C] bg-[#C26D5C]/15 shadow-sm' : 'hover:text-[#1E3A2F] hover:bg-[#1E3A2F]/5'}`}>Home</Link>
          <Link to="/request" data-testid="nav-request" className={`btn-ghost-ns transition-all duration-200 rounded-lg flex items-center gap-2 ${isActive('/request') ? 'text-[#C26D5C] bg-[#C26D5C]/15 shadow-sm' : 'hover:text-[#1E3A2F] hover:bg-[#1E3A2F]/5'}`}>
            <CircleHelp className="w-4 h-4" /> Ask for Help
          </Link>
          <Link to="/track" data-testid="nav-track" className={`btn-ghost-ns transition-all duration-200 rounded-lg ${isActive('/track') ? 'text-[#C26D5C] bg-[#C26D5C]/15 shadow-sm' : 'hover:text-[#1E3A2F] hover:bg-[#1E3A2F]/5'}`}>Track Request</Link>
          <Link to="/browse" data-testid="nav-browse" className={`btn-ghost-ns transition-all duration-200 rounded-lg ${isActive('/browse') ? 'text-[#C26D5C] bg-[#C26D5C]/15 shadow-sm' : 'hover:text-[#1E3A2F] hover:bg-[#1E3A2F]/5'}`}>Browse Requests</Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2 bg-[#C26D5C]/10 hover:bg-[#C26D5C]/20 rounded-full px-3 py-2 transition-all duration-200" data-testid="nav-profile">
                <div className="w-8 h-8 bg-gradient-to-br from-[#C26D5C] to-[#A8554D] rounded-full flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-sm font-medium text-[#1E3A2F]">{user.name}</span>
                  <span className="text-[11px] text-[#1E3A2F]/70"></span>
                </div>
              </Link>
              <button
                onClick={() => { logout(); nav('/'); setMobileMenuOpen(false); }}
                className="btn-ghost-ns transition-all duration-200 hover:bg-red-50 hover:text-red-600 rounded-lg"
                data-testid="nav-logout"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost-ns transition-all duration-200 hover:text-[#1E3A2F] rounded-lg" data-testid="nav-login">
                <LogIn className="w-4 h-4 inline mr-1" />Login
              </Link>
              <Link to="/register" className="btn-primary text-xs transition-all duration-200 hover:shadow-lg rounded-lg" data-testid="nav-register">
                <UserPlus className="w-4 h-4" /> Volunteer
              </Link>
            </>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden btn-ghost-ns p-2 rounded-lg hover:bg-[#1E3A2F]/5"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-[#FBFBF9]/95 to-[#F5F2EB]/95 backdrop-blur-xl border-t border-[#E5E1D8]/30 shadow-inner">
          <div className="px-6 py-4 space-y-2">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} data-testid="nav-home-mobile" className={`block py-2 px-3 rounded-md transition-all duration-200 ${isActive('/') ? 'text-[#C26D5C] bg-[#C26D5C]/10' : 'text-[#1E3A2F] hover:bg-[#1E3A2F]/5'}`}>Home</Link>
            <Link to="/request" onClick={() => setMobileMenuOpen(false)} data-testid="nav-request-mobile" className={`flex items-center py-2 px-3 rounded-md transition-all duration-200 ${isActive('/request') ? 'text-[#C26D5C] bg-[#C26D5C]/10' : 'text-[#1E3A2F] hover:bg-[#1E3A2F]/5'}`}>
              <CircleHelp className="w-4 h-4 mr-2" /> Ask for Help
            </Link>
            <Link to="/track" onClick={() => setMobileMenuOpen(false)} data-testid="nav-track-mobile" className={`block py-2 px-3 rounded-md transition-all duration-200 ${isActive('/track') ? 'text-[#C26D5C] bg-[#C26D5C]/10' : 'text-[#1E3A2F] hover:bg-[#1E3A2F]/5'}`}>Track Request</Link>
            <Link to="/browse" onClick={() => setMobileMenuOpen(false)} data-testid="nav-browse-mobile" className={`block py-2 px-3 rounded-md transition-all duration-200 ${isActive('/browse') ? 'text-[#C26D5C] bg-[#C26D5C]/10' : 'text-[#1E3A2F] hover:bg-[#1E3A2F]/5'}`}>Browse Requests</Link>
          </div>
        </div>
      )}
    </header>
  );
};
