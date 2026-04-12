import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, ShoppingCart, ShieldCheck, Truck, ArrowLeft, Heart, Share2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import CheckoutModal from '../components/CheckoutModal';

import { useCart } from '../context/CartContext';
import CartDrawer from '../components/CartDrawer';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
        <p className="text-gray-500 mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        product={product} 
        quantity={quantity} 
      />
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <Link to="/" className="inline-flex items-center space-x-2 text-gray-500 hover:text-primary mb-12 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Shop</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-gray-100 border border-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 cursor-pointer hover:border-primary transition-colors">
                <img
                  src={`${product.image}?sig=${i}`}
                  alt={`${product.name} view ${i}`}
                  className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">
                {product.category}
              </span>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Heart size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-500">{product.rating} ({product.reviews} customer reviews)</span>
            </div>

            <p className="text-3xl font-bold text-gray-900 mb-8">${product.price.toFixed(2)}</p>
            
            <p className="text-lg text-gray-600 leading-relaxed mb-10">
              {product.description}
            </p>
          </div>

          <div className="space-y-6 mb-10">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center border border-gray-200 rounded-2xl p-1 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  +
                </button>
              </div>
              <div className="flex-grow grid grid-cols-2 gap-4">
                <button 
                  onClick={() => {
                    if (product) {
                      addToCart(product, quantity);
                      setIsCartOpen(true);
                    }
                  }}
                  className="py-4 bg-white text-slate-900 border-2 border-slate-900 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center space-x-3"
                >
                  <ShoppingCart size={20} />
                  <span>Add to Cart</span>
                </button>
                <button 
                  onClick={() => {
                    if (product) {
                      addToCart(product, quantity);
                      setIsCheckoutOpen(true);
                    }
                  }}
                  className="py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center space-x-3"
                >
                  <ShieldCheck size={20} />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Only {product.stock} items left in stock!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-10 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">2 Year Warranty</p>
                <p className="text-xs text-gray-500">Full protection</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Free Shipping</p>
                <p className="text-xs text-gray-500">On orders over $100</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
