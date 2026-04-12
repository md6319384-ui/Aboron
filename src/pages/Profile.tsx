import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, orderBy } from 'firebase/firestore';
import { motion } from 'motion/react';
import { User, MapPin, Phone, Mail, ShoppingBag, Package, Clock, CheckCircle, ChevronRight, Loader2, Save } from 'lucide-react';
import { cn } from '../lib/utils';

import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: any[];
}

interface UserProfile {
  name: string;
  phone: string;
  address: string;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch User Profile
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          setProfile({ name: user.displayName || '', phone: '', address: '' });
        }

        // Fetch Orders
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...profile,
        updatedAt: new Date().toISOString()
      });
      console.log("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      // If doc doesn't exist, we might need to setDoc, but updateDoc is safer if we assume it's created on first order
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!user) {
    const handleLogin = async () => {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await signInWithPopup(auth, provider);
      } catch (error: any) {
        console.error("Login failed:", error);
        alert("Login failed! Please try opening the site in a new tab (click the arrow icon at the top right of the preview). Error: " + error.message);
      }
    };

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
          <User size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
        <p className="text-gray-500 mb-8">You need to be logged in to view your profile and orders.</p>
        <button 
          onClick={handleLogin}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          Login with Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Sidebar / User Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/50 text-center">
            <div className="relative inline-block mb-6">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                alt={user.displayName || 'User'} 
                className="w-32 h-32 rounded-full border-4 border-white shadow-xl mx-auto"
              />
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">{user.displayName}</h2>
            <p className="text-slate-500 text-sm mb-8">{user.email}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-2xl font-black text-slate-900">{orders.length}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Orders</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-2xl font-black text-slate-900">{orders.filter(o => o.status === 'delivered').length}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Delivered</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
            <button 
              onClick={() => setActiveTab('orders')}
              className={cn(
                "w-full flex items-center space-x-4 p-6 transition-all border-b border-slate-50",
                activeTab === 'orders' ? "bg-blue-50 text-blue-600" : "hover:bg-slate-50 text-slate-600"
              )}
            >
              <Package size={20} />
              <span className="font-bold">My Orders</span>
              <ChevronRight size={16} className="ml-auto" />
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={cn(
                "w-full flex items-center space-x-4 p-6 transition-all",
                activeTab === 'settings' ? "bg-blue-50 text-blue-600" : "hover:bg-slate-50 text-slate-600"
              )}
            >
              <User size={20} />
              <span className="font-bold">Profile Settings</span>
              <ChevronRight size={16} className="ml-auto" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'orders' ? (
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-slate-900">Order History</h2>
              {orders.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto">
                    <ShoppingBag size={32} />
                  </div>
                  <p className="text-slate-500 font-medium">You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={order.id} 
                      className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <Package size={24} />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Order ID</p>
                            <p className="font-black text-slate-900">#{order.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Date</p>
                            <p className="text-sm font-bold text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total</p>
                            <p className="text-lg font-black text-slate-900">${order.total.toFixed(2)}</p>
                          </div>
                          <div className={cn(
                            "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest",
                            order.status === 'delivered' ? "bg-green-100 text-green-600" : 
                            order.status === 'pending' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                          )}>
                            {order.status}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden">
                            <img src={item.image || `https://picsum.photos/seed/${item.productId}/100/100`} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-slate-900">Profile Settings</h2>
              <form onSubmit={handleUpdateProfile} className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-100/50 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={profile.name}
                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Your Name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Your Phone"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Default Shipping Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                    <textarea
                      rows={4}
                      value={profile.address}
                      onChange={e => setProfile({ ...profile, address: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                      placeholder="Your Address"
                    />
                  </div>
                </div>

                <button
                  disabled={saving}
                  type="submit"
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center space-x-3"
                >
                  {saving ? <Loader2 className="animate-spin" /> : (
                    <>
                      <Save size={20} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
