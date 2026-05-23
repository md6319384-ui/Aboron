import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState, createContext, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, updateDoc, increment, getDoc } from 'firebase/firestore';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import TrackOrder from './pages/TrackOrder';
import Policy from './pages/Policy';
import ProductDetail from './pages/ProductDetail';
import OrderSuccess from './pages/OrderSuccess';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import AIChatbot from './components/AIChatbot';

import { CartProvider } from './context/CartContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Admin from './pages/Admin';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isAdmin: false, loading: true });

export const useAuth = () => useContext(AuthContext);

// Beautiful Responsive Ad Sidebar
function AdSidebar({ side }: { side: 'left' | 'right' }) {
  const { settings } = useTheme();
  return (
    <aside className="hidden xl:flex flex-col w-64 shrink-0 space-y-6 py-6 self-start">
      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-center space-y-4 shadow-sm relative overflow-hidden group hover:border-slate-200 transition-all">
        {/* Animated Accent */}
        <div 
          className="absolute top-0 inset-x-0 h-1.5 opacity-90"
          style={{ backgroundColor: 'var(--primary, #f85606)' }}
        />
        <span className="inline-block text-[10px] uppercase font-black tracking-widest text-slate-400">
          SPONSORED RESELLER {side === 'left' ? 'A' : 'B'}
        </span>
        <div className="h-32 bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center p-4 space-y-2 group-hover:scale-[1.02] transition-transform">
          <span className="text-3xl font-black" style={{ color: 'var(--primary, #f85606)' }}>50%</span>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Super Cashback</span>
        </div>
        <p className="text-xs text-slate-500 font-medium">Get instant cashback on all orders today! Tap to activate discount coupon.</p>
        <button 
          className="w-full py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-md overflow-hidden relative active:scale-95"
          style={{ backgroundColor: 'var(--primary, #f85606)' }}
        >
          Claim Promo Coupon
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-center space-y-4 shadow-sm relative overflow-hidden group hover:border-slate-200 transition-all">
        <span className="inline-block text-[10px] uppercase font-black tracking-widest text-slate-400">
          PARTNER NETWORK
        </span>
        <div className="h-44 bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-between p-4 relative">
          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">FLASH ADS</span>
          <div className="w-14 h-14 rounded-full flex items-center justify-center animate-bounce bg-blue-50 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider animate-pulse">Live Click Booster</span>
        </div>
        <p className="text-xs text-slate-500 font-medium tracking-wide">Enjoy secure payments & double protection on orders.</p>
      </div>
    </aside>
  );
}

// Beautiful Responsive Ad Banner
function AdBanner({ position }: { position: 'top' | 'bottom' }) {
  return (
    <div className="w-full bg-slate-50 border-y border-slate-100/80 py-4 px-4 overflow-hidden relative">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center space-x-3">
          <div 
            className="w-3 h-3 rounded-full animate-ping shrink-0"
            style={{ backgroundColor: 'var(--primary, #f85606)' }}
          />
          <div>
            <p className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">
              MONETAG EXTRA CONTEXTUAL BANNER ({position === 'top' ? 'HEADER' : 'FOOTER'})
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Customize ad networks inside General Customization settings panel anytime!</p>
          </div>
        </div>
        <button 
          className="px-6 py-2 text-xs font-black text-white rounded-xl shadow-md transition-all active:scale-95 hover:brightness-110"
          style={{ backgroundColor: 'var(--primary, #f85606)' }}
        >
          CLAIM BOOSTER DISCOUNT
        </button>
      </div>
    </div>
  );
}

// Inner App Content which consumes the ThemeProvider context
function MainAppContent() {
  const { settings } = useTheme();

  const showLeft = settings.showAds && (settings.adPosition === 'sidebar-left' || settings.adPosition === 'both-sidebars');
  const showRight = settings.showAds && (settings.adPosition === 'sidebar-right' || settings.adPosition === 'both-sidebars');
  const showTop = settings.showAds && settings.adPosition === 'top-banner';
  const showBottom = settings.showAds && settings.adPosition === 'bottom-banner';

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      
      {/* Dynamic Top Ad Banner */}
      {showTop && <AdBanner position="top" />}

      {/* Main page content layout */}
      <div className="flex-grow w-full">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex gap-8">
          {/* Left Ad Sidebar */}
          {showLeft && <AdSidebar side="left" />}

          <main className="flex-grow min-w-0 py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/track" element={<TrackOrder />} />
              <Route path="/policy" element={<Policy />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/order-success/:orderId" element={<OrderSuccess />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>

          {/* Right Ad Sidebar */}
          {showRight && <AdSidebar side="right" />}
        </div>
      </div>

      {/* Dynamic Bottom Ad Banner */}
      {showBottom && <AdBanner position="bottom" />}

      <Footer />
      <AIChatbot />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = 'md6319384@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAdmin(user?.email === ADMIN_EMAIL);
      setLoading(false);
    });

    // Visitor Tracking - Using localStorage to count only once per device ever
    const trackVisit = async () => {
      const hasVisited = localStorage.getItem('hasVisited_v2'); // New key for better tracking
      if (!hasVisited) {
        try {
          const statsRef = doc(db, 'stats', 'visitors');
          // Use a simple atomic increment update without read if possible, 
          // but we need to ensure it exists.
          await updateDoc(statsRef, { count: increment(1) }).catch(async (err) => {
            if (err.code === 'not-found') {
              await setDoc(statsRef, { count: 1 });
            }
          });
          localStorage.setItem('hasVisited_v2', 'true');
        } catch (error) {
          console.error("Error tracking visit:", error);
        }
      }
    };
    trackVisit();

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      <ThemeProvider>
        <CartProvider>
          <Router>
            <MainAppContent />
          </Router>
        </CartProvider>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}
