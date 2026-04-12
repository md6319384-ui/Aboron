import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, LogOut, LogIn, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { useAuth } from '../App';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, isAdmin, loading } = useAuth();
  const { settings } = useTheme();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.siteName} className="h-8 w-auto object-contain" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {settings.siteName}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Home</Link>
            <Link to="/track" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Track Order</Link>
            <Link to="/policy" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Policy</Link>
            {isAdmin && (
              <Link to="/admin" className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors font-bold px-3 py-1 bg-blue-50 rounded-lg border border-blue-100">
                <ShieldCheck size={18} />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-5">
            <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
              <Search size={20} />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors relative"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
            
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 group">
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                    alt={user.displayName || 'User'} 
                    className="w-8 h-8 rounded-full border border-slate-200 group-hover:border-blue-600 transition-all"
                  />
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
              >
                <LogIn size={18} />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors relative"
            >
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">Home</Link>
            <Link to="/track" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">Track Order</Link>
            <Link to="/policy" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">Policy</Link>
            
            <div className="pt-4 flex flex-col space-y-4 border-t border-gray-100 mt-4">
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="flex items-center space-x-2 text-gray-600 px-3 py-2"
              >
                <ShoppingCart size={20} />
                <span>Cart ({totalItems})</span>
              </button>
              
              {isAdmin && (
                <Link 
                  to="/admin" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 text-blue-600 px-3 py-3 bg-blue-50 rounded-xl font-bold border border-blue-100"
                >
                  <ShieldCheck size={20} />
                  <span>Admin Panel</span>
                </Link>
              )}
              
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 text-gray-600 px-3 py-2"
                  >
                    <User size={20} />
                    <span>My Profile</span>
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-red-500 px-3 py-2"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    handleLogin();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 px-3 py-3 bg-slate-900 text-white rounded-xl font-bold"
                >
                  <LogIn size={20} />
                  <span>Login with Google</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
