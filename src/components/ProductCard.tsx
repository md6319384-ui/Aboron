import { Link } from 'react-router-dom';
import { Star, ShoppingCart, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { useState } from 'react';
import CheckoutModal from './CheckoutModal';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { addToCart } = useCart();

  return (
    <>
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        product={product} 
        quantity={1} 
      />
      
      <motion.div
        whileHover={{ y: -5 }}
        className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
      >
        <Link to={`/product/${product.id}`} className="block relative aspect-[4/3] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 right-3 flex flex-col items-end space-y-2">
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-bold text-blue-600 shadow-sm uppercase tracking-wider">
              {product.category}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="bg-red-600 text-white px-2 py-1 rounded-lg text-[10px] font-black shadow-lg shadow-red-100 animate-pulse">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </div>
            )}
          </div>
        </Link>

        <div className="p-5">
          <div className="flex items-center space-x-1 mb-2">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium text-gray-600">{product.rating} ({product.reviews} reviews)</span>
          </div>

          <Link to={`/product/${product.id}`}>
            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          
          <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-baseline space-x-2 mb-4">
            <p className="text-xl font-bold text-gray-900">৳{product.price.toFixed(2)}</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-sm text-gray-400 line-through">৳{product.originalPrice.toFixed(2)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button 
              onClick={() => addToCart(product, 1)}
              className="py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center space-x-1"
            >
              <ShoppingCart size={14} />
              <span>Add to Cart</span>
            </button>
            <button 
              onClick={() => {
                addToCart(product, 1);
                setIsCheckoutOpen(true);
              }}
              className="py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center space-x-1"
            >
              <ShieldCheck size={14} />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
