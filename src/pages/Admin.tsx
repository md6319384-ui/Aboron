import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, query, getDocs, doc, setDoc, deleteDoc, updateDoc, orderBy, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Package, ShoppingCart, Settings, MessageSquare, 
  Plus, Trash2, Edit, Save, X, Loader2, CheckCircle, Clock, 
  TrendingUp, Users, DollarSign, Search, Image as ImageIcon,
  Palette, Phone, Mail, ShieldCheck, Send, Truck, Download, Upload, Type, Archive
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Product, Order, SiteSettings } from '../types';
import { useTheme } from '../context/ThemeContext';
import { GoogleGenAI } from "@google/genai";
import { MOCK_PRODUCTS } from '../constants';

import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { settings, updateSettings } = useTheme();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'settings' | 'support'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Product Form State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: 'Electronics',
    stock: 10,
    rating: 4.5,
    reviews: 0
  });

  // AI Support State
  const [supportQuery, setSupportQuery] = useState('');
  const [supportResponse, setSupportResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Password Protection State
  const [passwordInput, setPasswordInput] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (!isAdmin) return;

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });

    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    });

    setLoading(false);

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, [isAdmin]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productForm);
        setNotification({ message: 'Product updated successfully!', type: 'success' });
      } else {
        const newDoc = doc(collection(db, 'products'));
        await setDoc(newDoc, { ...productForm, id: newDoc.id });
        setNotification({ message: 'Product added successfully!', type: 'success' });
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: 0, image: '', category: 'Electronics', stock: 10 });
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'products', id));
      setNotification({ message: 'Product deleted successfully!', type: 'success' });
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      setNotification({ message: 'Failed to delete product. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSeedProducts = async () => {
    setLoading(true);
    try {
      for (const product of MOCK_PRODUCTS) {
        const { id, ...rest } = product;
        const newDoc = doc(collection(db, 'products'));
        await setDoc(newDoc, { ...rest, id: newDoc.id });
      }
      setNotification({ message: 'Mock products seeded successfully!', type: 'success' });
    } catch (error) {
      console.error("Error seeding products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    await updateDoc(doc(db, 'orders', orderId), { status });
  };

  const handleExportTheme = () => {
    const themeData = JSON.stringify(settings, null, 2);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${settings.siteName.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedSettings = JSON.parse(event.target?.result as string);
        // Basic validation: check if it has some required fields
        if (importedSettings.siteName && importedSettings.primaryColor) {
          await updateSettings(importedSettings);
        }
      } catch (error) {
        console.error("Error importing theme:", error);
      }
    };
    reader.readAsText(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'bannerUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      await updateSettings({ [field]: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'orders', orderId));
      setNotification({ message: 'Order deleted successfully!', type: 'success' });
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting order:", error);
      setNotification({ message: 'Failed to delete order. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAiSupport = async () => {
    if (!supportQuery.trim()) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an expert e-commerce assistant for the ShopEase platform. The admin is asking: "${supportQuery}". Provide a helpful, concise solution or advice in Bengali if the query is in Bengali, otherwise English.`,
      });
      setSupportResponse(response.text || "Sorry, I couldn't generate a response.");
    } catch (error) {
      console.error("AI Support error:", error);
      setSupportResponse("Error connecting to AI assistant.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === (settings.adminPassword || 'iloveyou123')) {
      setIsPasswordCorrect(true);
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8 text-center"
        >
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Admin Login</h2>
            <p className="text-slate-500 text-sm font-medium">Please login with your admin account to access the dashboard.</p>
          </div>
          <button 
            onClick={handleLogin}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center space-x-3"
          >
            <span>Login with Google</span>
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8 text-center"
        >
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Access Denied</h2>
            <p className="text-slate-500 text-sm font-medium">You do not have administrator privileges. Your email: <span className="text-slate-900 font-bold">{user.email}</span></p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all"
          >
            Return to Shop
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isPasswordCorrect) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-100 mb-4">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Admin Access</h2>
            <p className="text-slate-500 text-sm font-medium">Please enter the admin password to continue.</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-center text-lg tracking-widest"
                autoFocus
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              Unlock Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={cn(
              "fixed bottom-8 left-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border",
              notification.type === 'success' ? "bg-white border-green-100 text-green-600" : "bg-white border-red-100 text-red-600"
            )}
          >
            {notification.type === 'success' ? <CheckCircle size={20} /> : <X size={20} />}
            <span className="font-bold text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="text-blue-600" />
            <span>Admin Panel</span>
          </h1>
        </div>
        
        <nav className="flex-grow p-4 space-y-2">
          <SidebarLink active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <SidebarLink active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package size={20} />} label="Products" />
          <SidebarLink active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingCart size={20} />} label="Orders" />
          <SidebarLink active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20} />} label="Settings" />
          <SidebarLink active={activeTab === 'support'} onClick={() => setActiveTab('support')} icon={<MessageSquare size={20} />} label="AI Support" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-xl">
            <img src={user?.photoURL || ''} className="w-8 h-8 rounded-full" alt="" />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.displayName}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<DollarSign className="text-green-600" />} label="Total Revenue" value={`$${orders.reduce((acc, o) => acc + o.total, 0).toFixed(2)}`} trend="+12.5%" />
                <StatCard icon={<ShoppingCart className="text-blue-600" />} label="Total Orders" value={orders.length.toString()} trend="+8.2%" />
                <StatCard icon={<Package className="text-orange-600" />} label="Products" value={products.length.toString()} />
                <StatCard icon={<TrendingUp className="text-purple-600" />} label="Avg. Order" value={`$${(orders.reduce((acc, o) => acc + o.total, 0) / (orders.length || 1)).toFixed(2)}`} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Orders</h3>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white rounded-xl border border-slate-100">
                            <Package size={18} className="text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">#{order.id.slice(-6)}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900">${order.total.toFixed(2)}</p>
                          <p className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            order.status === 'delivered' ? "text-green-600" : "text-blue-600"
                          )}>{order.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Top Products</h3>
                  <div className="space-y-4">
                    {products.slice(0, 5).map(product => (
                      <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center space-x-3">
                          <img src={product.image} className="w-10 h-10 rounded-xl object-cover" alt="" />
                          <div>
                            <p className="text-sm font-bold text-slate-900">{product.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{product.category}</p>
                          </div>
                        </div>
                        <p className="text-sm font-black text-slate-900">${product.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-900">Product Management</h2>
                <div className="flex space-x-4">
                  <button 
                    onClick={handleSeedProducts}
                    className="flex items-center space-x-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all border border-slate-200"
                  >
                    <Plus size={20} />
                    <span>Seed Mock Data</span>
                  </button>
                  <button 
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({ name: '', description: '', price: 0, image: '', category: 'Electronics', stock: 10 });
                      setIsProductModalOpen(true);
                    }}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    <Plus size={20} />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <img src={product.image} className="w-10 h-10 rounded-xl object-cover border border-slate-100" alt="" />
                            <span className="font-bold text-slate-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{product.category}</td>
                        <td className="px-6 py-4 font-black text-slate-900">${product.price.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            product.stock > 5 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          )}>
                            {product.stock} in stock
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {deleteConfirmId === product.id ? (
                              <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right-2">
                                <button 
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-red-700 transition-all"
                                >
                                  Confirm
                                </button>
                                <button 
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-lg hover:bg-slate-200 transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <button 
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setProductForm(product);
                                    setIsProductModalOpen(true);
                                  }}
                                  className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                  <Edit size={18} />
                                </button>
                                <button 
                                  onClick={() => setDeleteConfirmId(product.id)}
                                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <h2 className="text-2xl font-black text-slate-900">Order Management</h2>
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl">
                          <ShoppingCart size={24} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Order ID</p>
                          <p className="font-black text-slate-900">#{order.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Customer</p>
                          <p className="text-sm font-bold text-slate-600">{order.shippingAddress.split(',')[0]}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total</p>
                          <p className="text-lg font-black text-slate-900">${order.total.toFixed(2)}</p>
                        </div>
                        <select 
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest focus:outline-none border-2",
                            order.status === 'delivered' ? "bg-green-50 border-green-100 text-green-600" : 
                            order.status === 'pending' ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-slate-50 border-slate-100 text-slate-600"
                          )}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                        {deleteConfirmId === order.id ? (
                          <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right-2">
                            <button 
                              onClick={() => handleDeleteOrder(order.id)}
                              className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-red-700 transition-all"
                            >
                              Confirm
                            </button>
                            <button 
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-lg hover:bg-slate-200 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setDeleteConfirmId(order.id)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-xl border border-slate-100"
                            title="Delete Order"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-slate-50">
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Shipping Address</p>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{order.shippingAddress}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Payment Details</p>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                              order.paymentMethod === 'bkash' ? "bg-pink-100 text-pink-600" : 
                              order.paymentMethod === 'nagad' ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-600"
                            )}>{order.paymentMethod}</span>
                          </div>
                          {order.paymentDetails && (
                            <>
                              <p className="text-xs text-slate-600">
                                <span className="font-bold text-slate-400 uppercase text-[9px] mr-1">Sender:</span>
                                <span className="font-black">{order.paymentDetails.senderNumber}</span>
                              </p>
                              <p className="text-xs text-slate-600">
                                <span className="font-bold text-slate-400 uppercase text-[9px] mr-1">TrxID:</span>
                                <span className="font-black text-blue-600">{order.paymentDetails.transactionId}</span>
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Items</p>
                        <div className="flex flex-wrap gap-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600 flex items-center space-x-2">
                              {item.image && <img src={item.image} className="w-4 h-4 rounded object-cover" alt="" />}
                              <span>{item.name} x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <h2 className="text-2xl font-black text-slate-900">Website Customization</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <Palette className="text-blue-600" size={20} />
                    <span>Theme Colors (থিম কালার)</span>
                  </h3>
                  <div className="space-y-6">
                    <ColorInput label="Primary Color" value={settings.primaryColor} onChange={(c) => updateSettings({ primaryColor: c })} />
                    <ColorInput label="Secondary Color" value={settings.secondaryColor} onChange={(c) => updateSettings({ secondaryColor: c })} />
                    <ColorInput label="Accent Color" value={settings.accentColor} onChange={(c) => updateSettings({ accentColor: c })} />
                    <InputGroup label="Font Family" value={settings.fontFamily || 'Inter'} onChange={(v) => updateSettings({ fontFamily: v })} icon={<Type size={18} />} />
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Default Font Size (ফন্ট সাইজ)</label>
                      <select 
                        value={settings.fontSize || '16px'} 
                        onChange={(e) => updateSettings({ fontSize: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      >
                        <option value="14px">Small (14px)</option>
                        <option value="16px">Normal (16px)</option>
                        <option value="18px">Large (18px)</option>
                        <option value="20px">Extra Large (20px)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <ImageIcon className="text-blue-600" size={20} />
                    <span>Brand Assets</span>
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <p className="text-sm font-bold text-slate-700">Shop Logo</p>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden">
                          {settings.logoUrl ? (
                            <img src={settings.logoUrl} className="w-full h-full object-contain" alt="Logo" />
                          ) : (
                            <ImageIcon className="text-slate-300" size={24} />
                          )}
                        </div>
                        <label className="flex-1 flex items-center justify-center space-x-2 p-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all cursor-pointer">
                          <Upload size={18} />
                          <span>Upload Logo</span>
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} className="hidden" />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm font-bold text-slate-700">Hero Banner</p>
                      <div className="space-y-4">
                        <div className="w-full h-32 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden relative">
                          {settings.bannerUrl ? (
                            <img src={settings.bannerUrl} className="w-full h-full object-cover" alt="Banner" />
                          ) : (
                            <ImageIcon className="text-slate-300" size={32} />
                          )}
                        </div>
                        <label className="w-full flex items-center justify-center space-x-2 p-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all cursor-pointer">
                          <Upload size={18} />
                          <span>Upload Banner</span>
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'bannerUrl')} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <Download className="text-blue-600" size={20} />
                    <span>Theme Management (থিম ম্যানেজমেন্ট)</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={handleExportTheme}
                      className="flex items-center justify-center space-x-2 p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-all group"
                    >
                      <Download size={18} className="text-slate-400 group-hover:text-blue-600" />
                      <span className="text-sm font-bold text-slate-700">Export Theme</span>
                    </button>
                    <label className="flex items-center justify-center space-x-2 p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-all group cursor-pointer">
                      <Upload size={18} className="text-slate-400 group-hover:text-blue-600" />
                      <span className="text-sm font-bold text-slate-700">Import Theme (.json)</span>
                      <input type="file" accept=".json" onChange={handleImportTheme} className="hidden" />
                    </label>
                    <label className="flex items-center justify-center space-x-2 p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-all group cursor-pointer col-span-full">
                      <Archive size={18} className="text-slate-400 group-hover:text-blue-600" />
                      <span className="text-sm font-bold text-slate-700">Upload New Theme (.zip)</span>
                      <input type="file" accept=".zip" className="hidden" />
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase text-center">
                    Upload a .json or .zip theme file to instantly change your shop's appearance
                  </p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <Settings className="text-blue-600" size={20} />
                    <span>General Customization (সাধারণ সেটিংস)</span>
                  </h3>
                  <div className="space-y-6">
                    <InputGroup label="Website Name (ওয়েবসাইটের নাম)" value={settings.siteName} onChange={(v) => updateSettings({ siteName: v })} icon={<LayoutDashboard size={18} />} />
                    <InputGroup label="Contact Email" value={settings.contactEmail} onChange={(v) => updateSettings({ contactEmail: v })} icon={<Mail size={18} />} />
                    <InputGroup label="bKash Number" value={settings.bkashNumber} onChange={(v) => updateSettings({ bkashNumber: v })} icon={<Phone size={18} />} />
                    <InputGroup label="Nagad Number" value={settings.nagadNumber} onChange={(v) => updateSettings({ nagadNumber: v })} icon={<Phone size={18} />} />
                    <InputGroup label="Admin Password" value={settings.adminPassword || ''} onChange={(v) => updateSettings({ adminPassword: v })} icon={<ShieldCheck size={18} />} />
                    
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-xl text-slate-400">
                          <Truck size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Cash on Delivery</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Enable or disable COD</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => updateSettings({ allowCOD: !settings.allowCOD })}
                        className="flex items-center space-x-3 group"
                      >
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest transition-colors",
                          settings.allowCOD ? "text-green-600" : "text-slate-400"
                        )}>
                          {settings.allowCOD ? 'Active' : 'Disabled'}
                        </span>
                        <div className={cn(
                          "w-14 h-7 rounded-full transition-all relative p-1",
                          settings.allowCOD ? "bg-green-500 shadow-lg shadow-green-100" : "bg-slate-200"
                        )}>
                          <div className={cn(
                            "w-5 h-5 bg-white rounded-full transition-all shadow-sm",
                            settings.allowCOD ? "translate-x-7" : "translate-x-0"
                          )} />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'support' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 max-w-4xl mx-auto">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-blue-100">
                  <MessageSquare size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">AI Admin Assistant</h2>
                <p className="text-slate-500">Ask me anything about managing your store, fixing issues, or growth tips.</p>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 space-y-8">
                <div className="space-y-4">
                  <textarea 
                    value={supportQuery}
                    onChange={(e) => setSupportQuery(e.target.value)}
                    placeholder="Describe your problem or ask a question..."
                    className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none min-h-[150px]"
                  />
                  <button 
                    onClick={handleAiSupport}
                    disabled={isAiLoading || !supportQuery.trim()}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                  >
                    {isAiLoading ? <Loader2 className="animate-spin" /> : (
                      <>
                        <Send size={20} />
                        <span>Get Expert Solution</span>
                      </>
                    )}
                  </button>
                </div>

                {supportResponse && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-600 text-white rounded-xl">
                        <ShieldCheck size={20} />
                      </div>
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{supportResponse}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Product Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProductModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleSaveProduct} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Name</label>
                    <input required type="text" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                    <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Electronics</option>
                      <option>Clothing</option>
                      <option>Watches</option>
                      <option>Gadgets</option>
                      <option>Home Decor</option>
                      <option>Accessories</option>
                      <option>Lifestyle</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price ($)</label>
                    <input required type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: parseFloat(e.target.value) })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock</label>
                    <input required type="number" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: parseInt(e.target.value) })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Image URL</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="text" value={productForm.image} onChange={e => setProductForm({ ...productForm, image: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                  <textarea rows={4} value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center space-x-2">
                  <Save size={20} />
                  <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarLink({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all",
        active ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend?: string }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
        {trend && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">{trend}</span>}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <span className="text-sm font-bold text-slate-900">{label}</span>
      <div className="flex items-center space-x-3">
        <span className="text-xs font-mono text-slate-400 uppercase">{value}</span>
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent" />
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange, icon }: { label: string, value: string, onChange: (v: string) => void, icon: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
        <input 
          type="text" 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
        />
      </div>
    </div>
  );
}
