import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[360px] bg-white z-[160] shadow-2xl flex flex-col"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center space-x-2">
                <ShoppingBag size={18} className="text-blue-600" />
                <h2 className="text-lg font-black text-slate-900">Your Cart ({totalItems})</h2>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                    <ShoppingBag size={32} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900">Empty Cart</p>
                    <p className="text-xs text-slate-400">Looks like you haven't added anything yet.</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
                  >
                    Shop Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex space-x-3 group bg-white p-2 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-grow flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-bold text-slate-900 line-clamp-1 leading-tight">{item.name}</h3>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-xs font-bold text-blue-600 mt-0.5">৳{item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-white shadow-sm">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="w-6 text-center text-[11px] font-black text-slate-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                          <p className="text-sm font-black text-slate-900">৳{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-white space-y-3 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-center px-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Amount</span>
                    <span className="text-xl font-black text-slate-900">৳{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-green-600 font-bold flex items-center justify-end">
                      <Truck size={10} className="mr-1" /> Free Shipping
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Link
                    to="/checkout"
                    onClick={onClose}
                    className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center space-x-2"
                  >
                    <span>Checkout Now</span>
                    <ArrowRight size={18} />
                  </Link>
                  <button
                    onClick={onClose}
                    className="w-full py-3 text-slate-400 text-xs font-bold hover:text-slate-900 transition-all"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
