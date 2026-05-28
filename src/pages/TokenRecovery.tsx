import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, ArrowRight, AlertCircle, Search, Scissors } from 'lucide-react';
import { motion } from 'motion/react';
import { queueService } from '../services/queueService';
import { QueueEntry } from '../types';

export default function TokenRecovery() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<QueueEntry | null>(null);

  const [formData, setFormData] = useState({
    shopId: '',
    phone: ''
  });

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!formData.shopId || !formData.phone) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const entry = await queueService.findTokenByPhone(formData.shopId, formData.phone);
      if (entry) {
        setResult(entry);
      } else {
        setError('No active token found for this number today');
      }
    } catch (err: any) {
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f1a] text-white py-20 px-6 relative">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <div className="max-w-md mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#c9a84c]">
            <Ticket size={32} />
          </div>
          <h1 className="font-['Playfair_Display'] text-4xl font-bold mb-3">Find My Token</h1>
          <p className="text-white/40 text-sm">Lost your place? Enter your details to recover your token.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#13162a] border border-white/5 rounded-3xl p-8 shadow-2xl"
        >
          <form onSubmit={handleSearch} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-semibold">Shop ID</label>
              <input 
                type="text" 
                required
                placeholder="e.g. SHOP_123456"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-[#c9a84c] outline-none transition-colors"
                value={formData.shopId}
                onChange={e => setFormData({...formData, shopId: e.target.value.toUpperCase()})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-semibold">Mobile Number</label>
              <input 
                type="tel" 
                required
                maxLength={10}
                placeholder="10-digit mobile"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-[#c9a84c] outline-none transition-colors font-mono"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#c9a84c] to-[#e8c96a] text-[#0d0f1a] font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Find My Token'} <Search size={20} />
            </button>
          </form>

          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 pt-8 border-t border-white/5"
            >
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
                <span className="block text-[10px] uppercase tracking-widest text-green-500 font-bold mb-2">Token Found!</span>
                <span className="text-5xl font-['Playfair_Display'] font-black block mb-2">#{result.tokenNo}</span>
                <span className="text-sm text-white/60 block mb-6">{result.serviceName}</span>
                
                <Link 
                  to={`/shop/${result.shopId}/status/${result.id}`}
                  className="inline-flex items-center gap-2 text-[#c9a84c] font-bold uppercase tracking-widest text-xs border-b-2 border-[#c9a84c] pb-1 hover:text-[#e8c96a] hover:border-[#e8c96a] transition-colors"
                >
                  View Live Status <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>

        <div className="mt-12 text-center">
          <Link to="/" className="text-white/30 text-sm hover:text-white transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
