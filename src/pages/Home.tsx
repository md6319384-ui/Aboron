import { motion } from 'motion/react';
import { ArrowRight, Zap, Shield, Truck, Sparkles, Loader2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { cn } from '../lib/utils';
import { collection, onSnapshot, query, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../constants';
import ProductCard from '../components/ProductCard';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
  const { settings } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const productsRef = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Electronics', 'Clothing', 'Watches', 'Gadgets', 'Home Decor', 'Lifestyle'];

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const q = query(collection(db, 'products'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      if (productsData.length === 0) {
        // Seed mock data if empty
        MOCK_PRODUCTS.forEach(async (product) => {
          const { id, ...rest } = product;
          await addDoc(collection(db, 'products'), rest);
        });
      } else {
        setProducts(productsData);
        setLoading(false);
      }
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 z-0">
          {settings.bannerUrl ? (
            <div className="absolute inset-0">
              <img src={settings.bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-40" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white" />
            </div>
          ) : (
            <>
              <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px] -translate-y-1/2" />
              <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-[140px] translate-y-1/2" />
            </>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-blue-100 text-blue-600 px-4 py-2 rounded-2xl text-sm font-bold mb-8 shadow-sm">
                <Sparkles size={16} className="text-blue-600" />
                <span>Premium Dropshipping Hub</span>
              </div>
              <h1 className="text-6xl lg:text-7xl font-black text-slate-900 leading-[1.05] mb-8 tracking-tight">
                The Future of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Smart Living
                </span>
              </h1>
              <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-lg">
                Curating the world's most innovative gadgets and lifestyle essentials. 
                Experience premium quality with worldwide express delivery.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={scrollToProducts}
                  className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 flex items-center justify-center space-x-3 group"
                >
                  <span>Explore Shop</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={scrollToProducts}
                  className="px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm"
                >
                  View Trending
                </button>
              </div>

              {/* Verified Store Badge moved here */}
              <div className="mt-12 inline-flex items-center space-x-4 bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
                <div className="p-2 bg-green-100 text-green-600 rounded-xl">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Verified Store</p>
                  <p className="text-xs font-black text-slate-900">100% Secure</p>
                </div>
              </div>
              
              <div className="mt-12 flex items-center space-x-6">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <img 
                      key={i}
                      src={`https://i.pravatar.cc/100?img=${i+10}`} 
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                      alt="User"
                    />
                  ))}
                </div>
                <p className="text-sm font-medium text-slate-500">
                  <span className="text-slate-900 font-bold">2.5k+</span> Happy Customers
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {/* Foreground image removed as per user request to make background visible */}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
              <Truck size={32} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Global Shipping</h4>
              <p className="text-sm text-slate-500">Fast delivery to your doorstep</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center space-y-4 md:border-x border-slate-100 px-8">
            <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
              <Shield size={32} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Secure Checkout</h4>
              <p className="text-sm text-slate-500">100% protected payments</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
              <Zap size={32} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">AI Assistant</h4>
              <p className="text-sm text-slate-500">Instant 24/7 support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 space-y-8 md:space-y-0">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
            <p className="text-gray-500">Explore our diverse range of products</p>
            
            <div className="flex flex-wrap gap-2 mt-6">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-6 py-2 rounded-full text-sm font-bold transition-all border",
                    selectedCategory === cat 
                      ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                      : "bg-white text-slate-600 border-slate-100 hover:border-slate-300"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : (
            products
              .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
              .slice(0, 8)
              .map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))
          )}
        </div>
      </section>

      {/* Trending Products */}
      <section ref={productsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Trending Now</h2>
            <p className="text-gray-500">Most popular items this week</p>
          </div>
          <button className="text-blue-600 font-semibold flex items-center space-x-1 hover:underline">
            <span>View All</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : (
            products.slice(4, 12).map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-600 rounded-[2.5rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[100px]" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Get 10% Off Your First Order</h2>
            <p className="text-blue-100 mb-10 text-lg">
              Join our community and be the first to know about new arrivals and exclusive deals.
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              />
              <button className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-colors shadow-lg">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
