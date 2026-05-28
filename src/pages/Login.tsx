import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scissors, ArrowRight, AlertCircle, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase';
import { shopService } from '../services/shopService';

import { useLanguage } from '../lib/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.phone || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const shop = await shopService.getShopByPhone(formData.phone);
      
      if (!shop) {
        setError('No shop found with this phone number');
        setLoading(false);
        return;
      }

      if (shop.password !== formData.password) {
        setError('Incorrect password');
        setLoading(false);
        return;
      }

      // Sign in anonymously to satisfy Firestore rules (isAuthenticated)
      try {
        await signInAnonymously(auth);
      } catch (authErr: any) {
        console.warn('Anonymous auth failed:', authErr);
        if (authErr.code === 'auth/admin-restricted-operation') {
          setError('Firebase Error: Please enable "Anonymous" sign-in provider in your Firebase Console (Authentication > Sign-in method).');
          setLoading(false);
          return;
        }
      }

      localStorage.setItem('shopId', shop.id);
      
      if (shop.status === 'pending') {
        navigate('/pending');
      } else if (shop.status === 'suspended') {
        navigate('/suspended');
      } else {
        navigate(`/barber/${shop.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f1a] text-white flex items-center justify-center p-6 relative">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#e8c96a] flex items-center justify-center text-[#0d0f1a]">
              <Scissors size={20} />
            </div>
            <span className="font-['Playfair_Display'] text-xl font-black bg-gradient-to-r from-[#c9a84c] to-[#e8c96a] bg-clip-text text-transparent">
              BarberWallah
            </span>
          </Link>
          <h1 className="font-['Playfair_Display'] text-4xl font-bold mb-3">Welcome Back</h1>
          <p className="text-white/40 text-sm">Enter your registered WhatsApp number to access your dashboard.</p>
        </div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-[#13162a] border border-white/5 rounded-3xl p-8 space-y-6"
        >
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-semibold">WhatsApp Number</label>
            <input 
              type="tel" 
              required
              maxLength={10}
              placeholder="10-digit number"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-2xl font-['Playfair_Display'] font-bold tracking-widest text-white placeholder:text-white/10 focus:border-[#c9a84c] outline-none transition-colors"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-semibold">Password</label>
            <div className="relative">
              <input 
                type="password" 
                required
                placeholder="Enter password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/20 focus:border-[#c9a84c] outline-none transition-colors"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10" size={20} />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#c9a84c] to-[#e8c96a] text-[#0d0f1a] font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Open My Dashboard'} <ArrowRight size={20} />
          </button>

          <div className="divider flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">New Salon?</span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

          <Link 
            to="/register"
            className="w-full py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            Register My Salon
          </Link>
        </motion.form>

        <div className="mt-12 text-center">
          <Link to="/token-recovery" className="text-white/30 text-sm hover:text-[#c9a84c] transition-colors flex items-center justify-center gap-2">
            🎫 Customer looking for token? Click here
          </Link>
        </div>
      </div>
    </div>
  );
}
