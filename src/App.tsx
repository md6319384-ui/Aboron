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
import { ThemeProvider } from './context/ThemeContext';
import Admin from './pages/Admin';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isAdmin: false, loading: true });

export const useAuth = () => useContext(AuthContext);

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
            <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
              <Navbar />
              <main className="flex-grow">
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
              <Footer />
              <AIChatbot />
            </div>
          </Router>
        </CartProvider>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}
