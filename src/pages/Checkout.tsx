import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowLeft, Loader2, MapPin, Phone, User, CreditCard, Truck, CheckCircle, X } from 'lucide-react';
import { collection, addDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';
import { useAuth } from '../App';
import { useTheme } from '../context/ThemeContext';

export default function Checkout() {
  const { cart, totalPrice, clearCart, removeFromCart } = useCart();
  const { settings } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'bkash' as 'cod' | 'bkash' | 'nagad',
    senderNumber: '',
    transactionId: ''
  });

  useEffect(() => {
    if (settings.allowCOD) {
      setFormData(prev => ({ ...prev, paymentMethod: 'cod' }));
    }
  }, [settings.allowCOD]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setFormData(prev => ({
              ...prev,
              name: data.name || user.displayName || '',
              phone: data.phone || '',
              address: data.address || ''
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              name: user.displayName || ''
            }));
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    };
    fetchProfile();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-blue-100/50">
          <User size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">Login Required</h2>
        <p className="text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
          Please login to your account to complete your purchase. You can use your email or Google account.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Link 
            to="/" 
            className="flex-1 px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all text-center"
          >
            Back to Shop
          </Link>
          <button 
            onClick={() => {
              // This will trigger the login modal in Navbar if we had a way to communicate, 
              // but since we don't have a global modal state, we'll just tell them to use the login button above.
              window.scrollTo({ top: 0, behavior: 'smooth' });
              alert("Please click the 'Login' button at the top of the page to continue.");
            }}
            className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 text-center"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add some products to your cart before checking out.</p>
        <Link to="/" className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
          Back to Shop
        </Link>
      </div>
    );
  }

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const orderData = {
        userId: user ? user.uid : 'guest_' + Math.random().toString(36).substr(2, 9),
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        total: totalPrice,
        status: 'pending',
        createdAt: new Date().toISOString(),
        shippingAddress: `${formData.name}, ${formData.phone}, ${formData.address}`,
        paymentMethod: formData.paymentMethod,
        paymentDetails: formData.paymentMethod !== 'cod' ? {
          senderNumber: formData.senderNumber,
          transactionId: formData.transactionId
        } : null
      };

      // Save/Update user profile if logged in
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          await updateDoc(userRef, {
            uid: user.uid,
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            role: userDoc.data().role || 'customer',
            updatedAt: new Date().toISOString()
          });
        } else {
          await setDoc(userRef, {
            uid: user.uid,
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            email: user.email,
            role: 'customer',
            createdAt: new Date().toISOString()
          });
        }
      }

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      clearCart();
      navigate(`/order-success/${docRef.id}`);
    } catch (err: any) {
      console.error("Error placing order:", err);
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <Link to="/" className="inline-flex items-center space-x-2 text-gray-500 hover:text-blue-600 mb-12 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Continue Shopping</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Order Summary */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-slate-900">Order Summary</h2>
          <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 space-y-6">
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 group/item">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-100 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                    <p className="text-sm text-slate-500">Qty: {item.quantity} • ${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100"
                    title="Remove Item"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-slate-200 space-y-2">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span className="text-green-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-xl font-bold text-slate-900">Total</span>
                <span className="text-3xl font-black text-slate-900">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-slate-900">Checkout Details</h2>
          <form onSubmit={handleConfirmOrder} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="tel"
                  placeholder="Mobile Number"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                <textarea
                  required
                  placeholder="Full Delivery Address"
                  rows={3}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-900">Payment Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {settings.allowCOD ? (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all relative",
                      formData.paymentMethod === 'cod' ? "border-slate-900 bg-slate-50" : "border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <Truck size={20} className={cn("mb-2", formData.paymentMethod === 'cod' ? "text-slate-900" : "text-slate-400")} />
                    <p className="text-xs font-bold text-slate-900">COD</p>
                    {formData.paymentMethod === 'cod' && <CheckCircle className="absolute top-2 right-2 text-slate-900" size={14} />}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed grayscale"
                  >
                    <Truck size={20} className="text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-400">COD</p>
                    <p className="text-[10px] text-red-500 font-medium">Unavailable</p>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'bkash' })}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all relative",
                    formData.paymentMethod === 'bkash' ? "border-pink-600 bg-pink-50" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/BKash_Logo.svg/512px-BKash_Logo.svg.png" className="w-8 h-8 object-contain mb-2" alt="bKash" />
                  <p className="text-xs font-bold text-slate-900">bKash</p>
                  {formData.paymentMethod === 'bkash' && <CheckCircle className="absolute top-2 right-2 text-pink-600" size={14} />}
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'nagad' })}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all relative",
                    formData.paymentMethod === 'nagad' ? "border-orange-600 bg-orange-50" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nagad_Logo.svg/512px-Nagad_Logo.svg.png" className="w-8 h-8 object-contain mb-2" alt="Nagad" />
                  <p className="text-xs font-bold text-slate-900">Nagad</p>
                  {formData.paymentMethod === 'nagad' && <CheckCircle className="absolute top-2 right-2 text-orange-600" size={14} />}
                </button>
              </div>

              {(formData.paymentMethod === 'bkash' || formData.paymentMethod === 'nagad') && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-200"
                >
                  <div className="text-center space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Send Money To</p>
                    <p className="text-2xl font-black text-slate-900">
                      {formData.paymentMethod === 'bkash' ? '01813408362' : '01616246681'}
                    </p>
                    <p className="text-xs text-slate-500">Send <span className="font-bold text-slate-900">${totalPrice.toFixed(2)}</span> to this {formData.paymentMethod} number.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        required
                        type="tel"
                        placeholder={`Your ${formData.paymentMethod} Number`}
                        value={formData.senderNumber}
                        onChange={e => setFormData({ ...formData, senderNumber: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        required
                        type="text"
                        placeholder="Transaction ID (TrxID)"
                        value={formData.transactionId}
                        onChange={e => setFormData({ ...formData, transactionId: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <span>Place Order Now</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
