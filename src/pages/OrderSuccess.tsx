import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, ShoppingBag, ArrowRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <div className="p-8 md:p-12 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-green-100 text-green-600 rounded-full mb-8"
          >
            <CheckCircle size={48} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Thank You!</h1>
            <p className="text-xl text-blue-600 font-bold uppercase tracking-widest mb-8">Order Confirmed</p>
            
            <p className="text-slate-600 text-lg mb-4 max-w-md mx-auto leading-relaxed">
              We've received your order and our team is already working on it. 
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 max-w-md mx-auto animate-pulse">
              <p className="text-blue-700 font-black text-lg leading-relaxed">
                আপনার অর্ডারটি সফলভাবে কনফার্ম করা হয়েছে। কিছুক্ষণের মধ্যে আমাদের কাস্টমার কেয়ার থেকে আপনার কাছে একটি কল আসবে।
              </p>
            </div>

            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 mb-12 relative group">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3">Your Order Tracking Code</p>
              <div className="flex items-center justify-center space-x-4">
                <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-wider">#{orderId}</span>
                <button 
                  onClick={copyToClipboard}
                  className="p-3 bg-white text-slate-500 rounded-xl hover:text-blue-600 hover:shadow-md transition-all border border-slate-100"
                  title="Copy Code"
                >
                  {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
              </div>
              {copied && (
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-green-600"
                >
                  Copied to clipboard!
                </motion.span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                to="/"
                className="flex items-center justify-center space-x-3 px-8 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 group"
              >
                <ShoppingBag size={20} />
                <span>Continue Shopping</span>
              </Link>
              <Link 
                to="/track"
                className="flex items-center justify-center space-x-3 px-8 py-5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all group"
              >
                <span>Track Order</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Need help? Contact our 24/7 support at <span className="font-bold text-slate-900">01813408362</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
