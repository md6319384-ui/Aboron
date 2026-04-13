import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, LogOut, LogIn, ShieldCheck, Mail, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { useAuth } from '../App';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  const { totalItems } = useCart();
  const { user, isAdmin, loading } = useAuth();
  const { settings } = useTheme();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      setIsLoginModalOpen(false);
    } catch (error: any) {
      console.error("Login failed:", error);
      setAuthError(error.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
        await updateProfile(userCredential.user, { displayName: authForm.name });
      } else {
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      }
      setIsLoginModalOpen(false);
      setAuthForm({ email: '', password: '', name: '' });
    } catch (error: any) {
      console.error("Auth failed:", error);
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
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
          <Link to="/" className="flex items-center space-x-3">
            {settings.logoUrl && (
              <img src={settings.logoUrl} alt={settings.siteName} className="h-9 w-auto object-contain" referrerPolicy="no-referrer" />
            )}
            <span 
              className="text-xl md:text-2xl font-black bg-clip-text text-transparent transition-all"
              style={{ 
                backgroundImage: 'linear-gradient(to right, var(--primary), var(--accent))' 
              }}
            >
              {settings.siteName}
            </span>
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
                onClick={() => setIsLoginModalOpen(true)}
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

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsLoginModalOpen(false)} 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              className="relative w-full max-w-[480px] bg-white rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <X size={24} />
              </button>

              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                <button 
                  className={cn(
                    "flex-1 py-6 text-lg font-medium transition-all relative",
                    !isSignUp ? "text-slate-900" : "text-gray-400 hover:text-gray-600"
                  )}
                  onClick={() => setIsSignUp(false)}
                >
                  Password
                  {!isSignUp && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
                </button>
                <button 
                  className={cn(
                    "flex-1 py-6 text-lg font-medium transition-all relative",
                    isSignUp ? "text-slate-900" : "text-gray-400 hover:text-gray-600"
                  )}
                  onClick={() => setIsSignUp(true)}
                >
                  Sign Up
                  {isSignUp && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
                </button>
              </div>

              <div className="p-10 space-y-6">
                <form onSubmit={handleEmailAuth} className="space-y-5">
                  {isSignUp && (
                    <div className="space-y-1">
                      <input
                        required
                        type="text"
                        placeholder="Please enter your Full Name"
                        value={authForm.name}
                        onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                        className="w-full px-4 py-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition-all text-sm placeholder:text-gray-400"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <input
                      required
                      type="email"
                      placeholder="Please enter your Phone or Email"
                      value={authForm.email}
                      onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                      className="w-full px-4 py-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition-all text-sm placeholder:text-gray-400"
                    />
                  </div>
                  <div className="relative">
                    <input
                      required
                      type="password"
                      placeholder="Please enter your password"
                      value={authForm.password}
                      onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                      className="w-full px-4 py-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition-all text-sm placeholder:text-gray-400"
                    />
                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Search size={18} className="rotate-45" /> {/* Eye icon placeholder */}
                    </button>
                  </div>

                  {!isSignUp && (
                    <div className="flex justify-end">
                      <button type="button" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {authError && (
                    <p className="text-xs text-red-500 font-bold text-center bg-red-50 py-2 rounded-lg">{authError}</p>
                  )}

                  <button
                    disabled={authLoading}
                    type="submit"
                    className="w-full py-4 bg-[#f85606] text-white rounded-lg font-bold text-lg hover:bg-[#e04e05] transition-all flex items-center justify-center space-x-2 shadow-md"
                  >
                    {authLoading ? <Loader2 className="animate-spin" /> : <span>{isSignUp ? 'SIGN UP' : 'LOGIN'}</span>}
                  </button>
                </form>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button 
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-blue-500 hover:underline"
                    >
                      {isSignUp ? 'Login' : 'Sign up'}
                    </button>
                  </p>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                  <div className="relative flex justify-center text-sm"><span className="bg-white px-4 text-gray-400">Or, login with</span></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center space-x-2 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="" />
                    <span className="text-sm font-medium text-gray-600">Google</span>
                  </button>
                  <button
                    className="flex items-center justify-center space-x-2 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <div className="w-5 h-5 bg-[#1877f2] rounded flex items-center justify-center">
                      <span className="text-white font-black text-xs">f</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">Facebook</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                    setIsLoginModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 px-3 py-3 bg-slate-900 text-white rounded-xl font-bold"
                >
                  <LogIn size={20} />
                  <span>Login / Sign Up</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
