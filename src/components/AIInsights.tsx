import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, Users, Clock, AlertCircle } from 'lucide-react';
import { Shop, EarningRecord, QueueEntry } from '../types';
import { motion } from 'motion/react';

interface AIInsightsProps {
  shop: Shop;
  earnings: EarningRecord[];
  queue: QueueEntry[];
}

export default function AIInsights({ shop, earnings, queue }: AIInsightsProps) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const dataSummary = {
        shopName: shop.name,
        plan: shop.plan,
        totalEarnings: earnings.reduce((sum, e) => sum + e.netRevenue, 0),
        recentEarnings: earnings.slice(0, 10),
        currentQueueSize: queue.length,
        country: shop.country
      };

      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dataSummary }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setInsights(result);
    } catch (err: any) {
      console.error('AI Error:', err);
      setError(err.message || 'Failed to generate AI insights. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shop.plan === 'advanced' && !insights) {
      generateInsights();
    }
  }, [shop.plan]);

  if (shop.plan !== 'advanced') {
    return (
      <div className="bg-white border border-[#e8e4dc] rounded-3xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-300">
          <Brain size={32} />
        </div>
        <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-2">AI Business Insights</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          Upgrade to the Advanced plan to unlock AI-powered analysis of your customer behavior and revenue growth.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#c9a84c]/10 text-[#c9a84c] rounded-full text-xs font-bold uppercase tracking-widest">
          <Sparkles size={14} /> Advanced Feature
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1a2e] text-white rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a84c]/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#c9a84c] rounded-xl flex items-center justify-center text-[#1a1a2e]">
              <Brain size={20} />
            </div>
            <h2 className="font-['Playfair_Display'] text-2xl font-bold">AI Smart Insights</h2>
          </div>
          <p className="text-white/60 text-sm max-w-lg mb-8">
            Our AI analyzes your shop's performance in real-time to provide personalized recommendations for growth.
          </p>
          <button 
            onClick={generateInsights}
            disabled={loading}
            className="px-6 py-3 bg-white text-[#1a1a2e] font-bold rounded-xl hover:bg-[#c9a84c] hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-[#1a1a2e] border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={18} />}
            {loading ? 'Analyzing...' : 'Refresh Analysis'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights ? (
          insights.map((insight: any, idx: number) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border border-[#e8e4dc] rounded-3xl p-6 shadow-sm hover:border-[#c9a84c] transition-colors"
            >
              <div className="w-12 h-12 bg-[#f7f5f0] rounded-2xl flex items-center justify-center text-[#1a1a2e] mb-4">
                {insight.icon === 'trending' && <TrendingUp size={24} />}
                {insight.icon === 'users' && <Users size={24} />}
                {insight.icon === 'clock' && <Clock size={24} />}
                {insight.icon === 'alert' && <AlertCircle size={24} />}
              </div>
              <h3 className="font-bold text-lg mb-2">{insight.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{insight.description}</p>
            </motion.div>
          ))
        ) : loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-[#e8e4dc] rounded-3xl p-6 shadow-sm animate-pulse">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl mb-4"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-100 rounded w-5/6"></div>
            </div>
          ))
        ) : null}
      </div>
    </div>
  );
}
