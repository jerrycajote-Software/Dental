import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';
//import animatelogo from '../assets/animatelogo.gif';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#a1c4fd] border-b border-[#a1c4fd]/30 shadow-sm">
      <div className="container flex items-center justify-between px-4 py-3 mx-auto lg:py-4">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-3 group">
          
          <span className="text-xl font-extrabold tracking-tight transition-colors duration-300 text-slate-900 group-hover:text-white">
            Dental Care<span className="text-[#0D9488]">Plus</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="flex items-center gap-8">
          <div className="items-center hidden gap-8 text-sm font-bold md:flex">
            {user?.role === 'admin' && (
              <Link to="/admin" className="transition-colors text-slate-800 hover:text-white">Admin</Link>
            )}
          </div>

          <div className="items-center hidden gap-6 md:flex">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-wider text-slate-700 font-bold">Welcome</span>
                  <span className="text-sm font-black text-slate-900">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 text-xs font-black transition-all duration-300 bg-transparent border-2 rounded-xl border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login" className="text-sm font-black transition-colors text-slate-900 hover:text-white">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-black text-white shadow-md hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className="p-2 transition-colors border md:hidden rounded-xl bg-white/20 border-white/30 text-slate-900 hover:bg-white/40"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#a1c4fd] border-t border-white/20 py-8 px-6 space-y-8 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-6">
            {user?.role === 'admin' && (
              <Link to="/admin" onClick={closeMenu} className="text-xl font-bold text-slate-800 hover:text-white">Admin</Link>
            )}
          </div>

          <div className="flex flex-col gap-5 pt-8 border-t border-white/20">
            {user ? (
              <>
                <div className="p-4 border bg-white/20 rounded-2xl border-white/30">
                  <span className="text-[10px] uppercase tracking-wider text-slate-700 font-bold block mb-1">Signed in as</span>
                  <span className="text-lg font-black text-slate-900">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full py-4 text-base font-black transition-all border-2 rounded-2xl border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="w-full py-4 text-base font-black text-center transition-colors text-slate-800 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="w-full py-4 text-base font-black text-center text-white transition-all shadow-xl rounded-2xl bg-slate-900 hover:bg-slate-800"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
