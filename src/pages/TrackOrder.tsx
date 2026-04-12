import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Package, Truck, CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Order } from '../types';
import { cn } from '../lib/utils';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    
    setLoading(true);
    setError(null);
    setIsTracking(false);
    
    try {
      // For demo: if they search #SE12345, show a mock result
      if (orderId === '#SE12345') {
        setOrder({
          id: '#SE12345',
          status: 'processing',
          createdAt: new Date().toISOString(),
          shippingAddress: 'Dhaka, Bangladesh',
          total: 89.99,
          items: [],
          userId: 'demo'
        } as Order);
        setIsTracking(true);
      } else {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
          setIsTracking(true);
        } else {
          setError("Order not found. Please check your ID and try again.");
        }
      }
    } catch (err) {
      console.error("Error tracking order:", err);
      setError("An error occurred while fetching your order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Order</h1>
        <p className="text-gray-600">Enter your order ID to see the current status of your shipment.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 md:p-12 mb-12">
        <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Order ID (Try #SE12345)"
              className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
            />
          </div>
          <button 
            disabled={loading}
            className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center min-w-[160px]"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Track Now'}
          </button>
        </form>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center space-x-3 border border-red-100"
          >
            <AlertCircle size={20} />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        {isTracking && order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 space-y-12"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-primary/5 rounded-2xl border border-primary/10">
              <div>
                <p className="text-sm text-primary font-semibold mb-1 uppercase tracking-wider">Current Status</p>
                <h3 className="text-2xl font-bold text-slate-900 capitalize">{order.status.replace('-', ' ')}</h3>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-100" />
              
              <div className="space-y-10 relative">
                <div className="flex items-start space-x-6">
                  <div className={cn(
                    "relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl border-4 border-white transition-colors",
                    ['pending', 'processing', 'shipped', 'delivered'].includes(order.status) ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                  )}>
                    <CheckCircle size={28} />
                  </div>
                  <div>
                    <h4 className={cn("font-bold", ['pending', 'processing', 'shipped', 'delivered'].includes(order.status) ? "text-gray-900" : "text-gray-400")}>Order Confirmed</h4>
                    <p className="text-sm text-gray-500">We have received your order.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-6">
                  <div className={cn(
                    "relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl border-4 border-white transition-colors",
                    ['processing', 'shipped', 'delivered'].includes(order.status) ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                  )}>
                    <Package size={28} />
                  </div>
                  <div>
                    <h4 className={cn("font-bold", ['processing', 'shipped', 'delivered'].includes(order.status) ? "text-gray-900" : "text-gray-400")}>Processing</h4>
                    <p className="text-sm text-gray-500">Your items are being prepared for shipment.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-6">
                  <div className={cn(
                    "relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl border-4 border-white transition-colors",
                    ['shipped', 'delivered'].includes(order.status) ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                  )}>
                    <Truck size={28} />
                  </div>
                  <div>
                    <h4 className={cn("font-bold", ['shipped', 'delivered'].includes(order.status) ? "text-gray-900" : "text-gray-400")}>In Transit</h4>
                    <p className="text-sm text-gray-500">Your package is on its way.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-6">
                  <div className={cn(
                    "relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl border-4 border-white transition-colors",
                    order.status === 'delivered' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                  )}>
                    <Clock size={28} />
                  </div>
                  <div>
                    <h4 className={cn("font-bold", order.status === 'delivered' ? "text-gray-900" : "text-gray-400")}>Delivered</h4>
                    <p className="text-sm text-gray-500">Package has been delivered successfully.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
        <h4 className="font-bold text-gray-900 mb-4">Need help?</h4>
        <p className="text-gray-600 mb-6">
          If you have any questions about your order, please contact our support team or use our AI chatbot.
        </p>
        <button className="text-blue-600 font-bold hover:underline">Contact Support &rarr;</button>
      </div>
    </div>
  );
}
