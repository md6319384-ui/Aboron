import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Phone, User, CreditCard, CheckCircle, Loader2, Truck } from 'lucide-react';
import { Product } from '../types';
import { collection, addDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';
import { useAuth } from '../App';
import { useTheme } from '../context/ThemeContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  quantity: number;
}

export default function CheckoutModal({ isOpen, onClose, product, quantity }: CheckoutModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useTheme();
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'bkash' as 'cod' | 'bkash' | 'nagad',
    senderNumber: '',
    transactionId: ''
  });

  useEffect(() => {
    if (settings.allowCOD && isOpen) {
      setFormData(prev => ({ ...prev, paymentMethod: 'cod' }));
    }
  }, [settings.allowCOD, isOpen]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user && isOpen) {
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
  }, [user, isOpen]);

  const total = product.price * quantity;

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handleConfirmOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        userId: user ? user.uid : 'guest_' + Math.random().toString(36).substr(2, 9),
        items: [{
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          image: product.image
        }],
        total: total,
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
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            updatedAt: new Date().toISOString()
          });
        } else {
          await setDoc(userRef, {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            email: user.email,
            createdAt: new Date().toISOString()
          });
        }
      }

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      onClose();
      navigate(`/order-success/${docRef.id}`);
    } catch (error) {
      console.error("Error placing order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900">
                {step === 'details' && 'Shipping Details'}
                {step === 'payment' && 'Select Payment'}
                {step === 'success' && 'Order Confirmed!'}
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="p-8">
              {step === 'details' && (
                <form onSubmit={handleSubmitDetails} className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-xl" referrerPolicy="no-referrer" />
                    <div>
                      <p className="font-bold text-slate-900 line-clamp-1">{product.name}</p>
                      <p className="text-sm text-slate-500">Qty: {quantity} • Total: ৳{total.toFixed(2)}</p>
                    </div>
                  </div>

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

                  <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                    Continue to Payment
                  </button>
                </form>
              )}

              {step === 'payment' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {settings.allowCOD ? (
                      <button
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
                        disabled
                        className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed grayscale"
                      >
                        <Truck size={20} className="text-slate-400 mb-2" />
                        <p className="text-xs font-bold text-slate-400">COD</p>
                        <p className="text-[10px] text-red-500 font-medium">Unavailable</p>
                      </button>
                    )}

                    <button
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

                  {/* Payment Details Form (bKash/Nagad) */}
                  {(formData.paymentMethod === 'bkash' || formData.paymentMethod === 'nagad') && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200"
                    >
                      <div className="text-center space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Send Money To</p>
                        <div className="flex items-center justify-center space-x-2">
                          <p className="text-lg font-black text-slate-900">
                            {formData.paymentMethod === 'bkash' ? '01813408362' : '01616246681'}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-500">Send <span className="font-bold text-slate-900">৳{total.toFixed(2)}</span> to this {formData.paymentMethod} number.</p>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <input
                            required
                            type="tel"
                            placeholder={`Your ${formData.paymentMethod} Number`}
                            value={formData.senderNumber}
                            onChange={e => setFormData({ ...formData, senderNumber: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs"
                          />
                        </div>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <input
                            required
                            type="text"
                            placeholder="Transaction ID (TrxID)"
                            value={formData.transactionId}
                            onChange={e => setFormData({ ...formData, transactionId: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between mb-4">
                      <span className="text-slate-500 text-sm font-medium">Total Amount</span>
                      <span className="text-xl font-black text-slate-900">৳{total.toFixed(2)}</span>
                    </div>
                    <button
                      disabled={loading}
                      onClick={handleConfirmOrder}
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center space-x-2"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <span>Confirm Order</span>}
                    </button>
                    <button onClick={() => setStep('details')} className="w-full mt-2 text-slate-400 text-sm font-bold hover:text-slate-600">
                      Go Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
