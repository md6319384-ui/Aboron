import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { useAuth } from '../App';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { isAdmin } = useAuth();
  const { settings } = useTheme();

  return (
    <footer className="bg-slate-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 
              className="text-2xl font-black bg-clip-text text-transparent transition-all"
              style={{ backgroundImage: 'linear-gradient(to right, var(--primary), var(--accent))' }}
            >
              {settings.siteName}
            </h3>
            <p className="text-sm leading-relaxed">
              Your one-stop destination for the latest gadgets and home decor. Quality products, delivered to your doorstep.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="hover:text-blue-500 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-blue-400 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="hover:text-pink-500 transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/track" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link to="/policy" className="hover:text-white transition-colors">Terms of Service</Link></li>
              {isAdmin && (
                <li>
                  <Link to="/admin" className="text-blue-500 hover:text-blue-400 font-bold flex items-center space-x-1">
                    <ShieldCheck size={14} />
                    <span>Admin Panel</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Gadgets</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Home Decor</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tech Accessories</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Lifestyle</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-3">
                <MapPin size={18} className="text-blue-500" />
                <span>{settings.contactAddress}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-blue-500" />
                <span>{settings.contactPhone}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-blue-500" />
                <span>{settings.contactEmail}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
            <p>&copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
            {isAdmin && (
              <Link to="/admin" className="flex items-center space-x-1 text-blue-500 hover:text-blue-400 transition-colors font-bold">
                <ShieldCheck size={14} />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/BKash_Logo.svg/512px-BKash_Logo.svg.png" alt="bKash" className="h-6 grayscale hover:grayscale-0 transition-all cursor-pointer" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nagad_Logo.svg/512px-Nagad_Logo.svg.png" alt="Nagad" className="h-6 grayscale hover:grayscale-0 transition-all cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
