import { Link } from 'react-router-dom';
import { Scissors, Users, TrendingUp, Clock, ArrowRight, MessageSquare, Phone, Calculator, X, AlertTriangle, Flame, TrendingDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

import { useLanguage } from '../lib/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Home() {
  const { t } = useLanguage();
  const [showCalculator, setShowCalculator] = useState(false);
  const [weeklyLost, setWeeklyLost] = useState<{ [key: string]: number }>({
    Monday: 2,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 3,
    Friday: 5,
    Saturday: 7,
    Sunday: 6
  });
  const [avgPrice, setAvgPrice] = useState(35); // Default in Dollars
  const [tickerLoss, setTickerLoss] = useState(0);

  // sums up the lost customers across the week
  const totalWeeklyLost = (Object.values(weeklyLost) as number[]).reduce((sum, val) => sum + val, 0);

  // calculations per year (52 weeks)
  const actualLoss = totalWeeklyLost * avgPrice * 52;
  const maxLoss = Math.round(totalWeeklyLost * avgPrice * 52 * 1.25);
  const minLoss = Math.round(totalWeeklyLost * avgPrice * 40); // slightly lower bounds for low seasons

  // Live loss ticker updates when calculator is open
  useEffect(() => {
    if (!showCalculator) {
      setTickerLoss(0);
      return;
    }
    
    // actualLoss per second = actualLoss / (365 * 24 * 60 * 60)
    // We update every 50ms, so tick rate is: (actualLoss / 31536000) * 0.05
    const lossPerSecond = actualLoss / 31536000;
    const interval = setInterval(() => {
      setTickerLoss(prev => prev + (lossPerSecond * 0.05));
    }, 50);

    return () => clearInterval(interval);
  }, [showCalculator, actualLoss]);

  const handleUpdateDay = (day: string, val: number) => {
    setWeeklyLost(prev => ({
      ...prev,
      [day]: Math.max(0, Math.min(50, prev[day] + val))
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#0d0f1a] text-white overflow-x-hidden relative">
      {/* Language Switcher */}
      <div className="fixed top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      {/* Noise Texture */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-6 text-center bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(201,168,76,0.15)_0%,transparent_70%)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 mb-8"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#e8c96a] flex items-center justify-center text-[#0d0f1a]">
            <Scissors size={24} />
          </div>
          <span className="font-['Playfair_Display'] text-2xl font-black bg-gradient-to-r from-[#c9a84c] to-[#e8c96a] bg-clip-text text-transparent">
            BarberWallah
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-block px-4 py-1.5 rounded-full border border-[#c9a84c]/20 text-[#c9a84c] text-xs font-medium tracking-[0.2em] uppercase mb-6"
        >
          Smart Queue System
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-['Playfair_Display'] text-5xl md:text-7xl font-black leading-[1.1] mb-6 tracking-tight"
        >
          {t('home.hero.title').split(',')[0]},<br />
          <em className="italic text-[#c9a84c] not-underline">{t('home.hero.title').split(',')[1]}</em>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white/50 text-lg max-w-md mx-auto mb-10 leading-relaxed"
        >
          {t('home.hero.subtitle')}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center items-center px-4 w-full"
        >
          <Link 
            to="/register" 
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-[#c9a84c] to-[#e8c96a] text-[#0d0f1a] font-black rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-sm sm:text-base shadow-lg"
          >
            {t('nav.register')} <ArrowRight size={18} />
          </Link>
          <Link 
            to="/login" 
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors text-sm sm:text-base"
          >
            {t('nav.login')}
          </Link>
          <Link 
            to="/tutorial" 
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors text-sm sm:text-base"
          >
            {t('nav.tutorial')}
          </Link>
          <button 
            onClick={() => setShowCalculator(true)}
            className="w-full sm:w-auto relative px-6 sm:px-8 py-3.5 sm:py-4 bg-red-950/60 border border-red-500/50 text-red-100 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-900/70 hover:border-red-550 transition-all cursor-pointer shadow-lg shadow-red-900/30 group text-xs sm:text-sm"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full border border-[#0d0f1a] shadow-sm z-10" />
            <Calculator size={18} className="text-[#c9a84c] animate-pulse shrink-0" />
            <span className="tracking-wide">Calculate Cash Losses & Bleed rate 🚨</span>
          </button>
        </motion.div>
      </section>

      {/* Stats Strip */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-white/5">
          <div className="py-6 text-center">
            <span className="block font-['Playfair_Display'] text-2xl font-bold text-[#c9a84c]">50+</span>
            <span className="text-[10px] uppercase tracking-widest text-white/30">{t('home.stats.salons')}</span>
          </div>
          <div className="py-6 text-center">
            <span className="block font-['Playfair_Display'] text-2xl font-bold text-[#c9a84c]">₹7.5L</span>
            <span className="text-[10px] uppercase tracking-widest text-white/30">{t('home.stats.loss')}</span>
          </div>
          <div className="py-6 text-center">
            <span className="block font-['Playfair_Display'] text-2xl font-bold text-[#c9a84c]">45d</span>
            <span className="text-[10px] uppercase tracking-widest text-white/30">{t('home.stats.payback')}</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-[#13162a] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.1),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Users className="text-[#c9a84c] mb-6" size={32} />
            <h3 className="font-['Playfair_Display'] text-2xl font-bold mb-3">{t('home.features.qr.title')}</h3>
            <p className="text-white/40 leading-relaxed">{t('home.features.qr.desc')}</p>
          </div>

          <div className="p-8 rounded-3xl bg-[#13162a] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.1),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Clock className="text-[#c9a84c] mb-6" size={32} />
            <h3 className="font-['Playfair_Display'] text-2xl font-bold mb-3">{t('home.features.status.title')}</h3>
            <p className="text-white/40 leading-relaxed">{t('home.features.status.desc')}</p>
          </div>

          <div className="p-8 rounded-3xl bg-[#13162a] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.1),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <TrendingUp className="text-[#c9a84c] mb-6" size={32} />
            <h3 className="font-['Playfair_Display'] text-2xl font-bold mb-3">{t('home.features.earnings.title')}</h3>
            <p className="text-white/40 leading-relaxed">{t('home.features.earnings.desc')}</p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#1e1800] to-[#2a2000] border border-[#c9a84c]/20 relative overflow-hidden group">
            <Scissors className="text-[#c9a84c] mb-6" size={32} />
            <h3 className="font-['Playfair_Display'] text-2xl font-bold mb-3 text-[#c9a84c]">{t('home.features.loyalty.title')}</h3>
            <p className="text-white/60 leading-relaxed">{t('home.features.loyalty.desc')}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 text-center border-t border-white/5">
        <p className="text-white/20 text-sm mb-6">BarberWallah</p>
        <div className="flex justify-center gap-6">
          <a href="https://wa.me/918454015157" className="flex items-center gap-2 text-[#25D366] font-semibold text-sm">
            <MessageSquare size={18} /> WhatsApp Us
          </a>
          <a href="tel:8454015157" className="flex items-center gap-2 text-white/40 font-semibold text-sm">
            <Phone size={18} /> 8454015157
          </a>
        </div>
      </footer>

      {/* Customer Loss Calculator Modal */}
      <AnimatePresence>
        {showCalculator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCalculator(false)}
              className="absolute inset-0 bg-[#07080f]/94 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-[#0d0f1a] border-2 border-red-500/40 rounded-3xl w-full max-w-xl p-6 md:p-8 z-10 shadow-[0_0_50px_rgba(239,68,68,0.2)] overflow-y-auto max-h-[92vh]"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-[#c9a84c] to-red-600 animate-pulse" />

              {/* Close Button */}
              <button 
                onClick={() => setShowCalculator(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                aria-label="Close Calculator"
              >
                <X size={20} />
              </button>

              <div className="flex items-start gap-4 mb-3 pr-6">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0 animate-pulse">
                  <Flame size={24} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] uppercase tracking-widest font-black mb-1">
                    🔴 Silent Profit Hemorrhage
                  </div>
                  <h3 className="font-['Playfair_Display'] text-2xl md:text-3xl font-black text-white leading-tight">
                    Revenue Loss Analyzer
                  </h3>
                </div>
              </div>

              {/* Dynamic Realtime Lost Indicator */}
              <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-4 text-center mb-6 relative overflow-hidden">
                <span className="text-[10px] block uppercase text-red-400 tracking-widest font-black mb-1.5 animate-pulse">
                  ⚠️ CASH DRAIN TICKING RIGHT NOW:
                </span>
                <span className="text-3xl md:text-4xl font-mono font-black text-red-500 tracking-tight block">
                  ${tickerLoss.toFixed(5)}
                </span>
                <span className="text-[10.5px] text-white/50 block mt-1.5">
                  Real-time dollars wasted by customers backing out while you read this. 
                </span>
              </div>

              <div className="space-y-4 my-6">
                {/* Day-wise customer loss */}
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[11px] uppercase tracking-wider font-extrabold text-white/60">
                      Estimated Lost Customers / Day
                    </label>
                    <span className="text-xs font-mono font-bold text-[#c9a84c] bg-[#c9a84c]/10 px-3 py-1 rounded-lg">
                      {totalWeeklyLost} lost/week
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div 
                        key={day} 
                        className={`flex flex-col items-center justify-between p-2 rounded-xl border border-white/5 bg-white/[0.01] ${
                          day === 'Sunday' || day === 'Saturday' ? 'bg-[#c9a84c]/5 border-[#c9a84c]/10' : ''
                        }`}
                      >
                        <span className="text-[11px] text-white/50 font-semibold mb-1">
                          {day.substring(0, 3)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateDay(day, -1)}
                            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 active:scale-90 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer text-xs select-none font-bold"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-mono font-bold text-white">
                            {weeklyLost[day]}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateDay(day, 1)}
                            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 active:scale-90 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer text-xs select-none font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="bg-red-500/5 border border-red-500/10 p-2 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-[10px] text-red-400 font-extrabold uppercase">Queue Wait</span>
                      <span className="text-xs text-white/40 block font-mono">Walkouts</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] uppercase tracking-wider font-extrabold text-white/60">
                      Average Price Charged per Customer
                    </label>
                    <span className="text-xl font-mono font-extrabold text-[#c9a84c] bg-[#c9a84c]/10 px-3 py-1 rounded-lg">
                      {formatCurrency(avgPrice)}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="200" 
                    step="1"
                    value={avgPrice} 
                    onChange={(e) => setAvgPrice(Number(e.target.value))}
                    className="w-full accent-[#c9a84c] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-white/20 font-mono mt-1">
                    <span>$1</span>
                    <span>$100</span>
                    <span>$200</span>
                  </div>
                </div>
              </div>

              {/* Physical Comparison Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-6">
                <div className="bg-white/[0.01] border border-white/5 p-3 rounded-2xl text-center">
                  <span className="text-[9px] block uppercase text-white/40 font-bold mb-1">Monthly Cost</span>
                  <span className="text-md font-mono font-bold text-red-400">{formatCurrency(actualLoss / 12)}</span>
                </div>

                <div className="bg-gradient-to-b from-red-500/10 to-red-500/0 border border-red-500/30 p-3 rounded-2xl text-center shadow-[inset_0_1px_10px_rgba(239,68,68,0.1)]">
                  <span className="text-[9px] block uppercase text-red-500 font-black tracking-widest mb-1">TOTAL ANNUALLY WASTED</span>
                  <span className="text-xl font-mono font-black text-red-500">{formatCurrency(actualLoss)}</span>
                </div>

                <div className="bg-white/[0.01] border border-white/5 p-3 rounded-2xl text-center">
                  <span className="text-[9px] block uppercase text-white/40 font-bold mb-1">Weekly Waste</span>
                  <span className="text-md font-mono font-bold text-red-400">{formatCurrency(actualLoss / 52)}</span>
                </div>
              </div>

              {/* Physical/Tangible Impact Description */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-xs space-y-2 mb-6">
                <div className="text-[#c9a84c] font-black uppercase tracking-wider flex items-center gap-1">
                  <TrendingDown size={14} /> THAT IS THE EQUIVALENT OF WASTING:
                </div>
                <div className="text-white/70 space-y-1.5 font-sans leading-relaxed">
                  <p>🛋️ Over <strong className="text-white font-bold">{Math.max(1, Math.round(actualLoss / 450))} premium hydraulic barber chairs</strong> every year.</p>
                  <p>🚪 Up to <strong className="text-white font-bold">{Math.max(1, Math.round(actualLoss / 1200))} full months of shop rent</strong> paid completely for nothing.</p>
                  <p>✂️ Pure profits you could have used to hire another barber or expand your shop.</p>
                </div>
              </div>

              {/* Solution Impact Block & Referral Code Integration */}
              <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-2xl text-left space-y-2.5 mb-6">
                <div className="flex items-center gap-1.5 text-green-400">
                  <Sparkles size={16} className="animate-spin" />
                  <span className="text-xs uppercase tracking-wider font-extrabold">Instant Recovery Solution</span>
                </div>
                <p className="text-white/80 text-xs leading-relaxed">
                  BarberWallah queue management recovered up to <strong className="text-green-400">94%</strong> of queue walkouts. You stand to instantly save and pocket <strong className="text-green-400 text-sm font-bold">{formatCurrency(actualLoss * 0.94)}</strong> of your lost revenue.
                </p>
                <div className="bg-green-500/10 p-2.5 rounded-xl border border-green-500/20 text-[11px] text-green-300 font-mono flex items-center justify-between">
                  <span>🎁 PROMO: SECURE 15% PARTNER RATE</span>
                  <span className="font-bold underline text-white px-2 py-0.5 rounded bg-green-950/40">SAVE15</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to="/register"
                  onClick={() => setShowCalculator(false)}
                  className="w-full py-4 px-4 bg-gradient-to-r from-red-650 via-[#c9a84c] to-[#e8c96a] text-[#0d0f1a] font-extrabold rounded-xl flex flex-col items-center justify-center gap-0.5 hover:scale-[1.01] hover:brightness-110 active:scale-95 transition-all text-center shadow-lg shadow-[#c9a84c]/20"
                >
                  <span className="text-[12px] uppercase tracking-wider">STOP THE BLEEDING TODAY➜</span>
                  <span className="text-[9px] font-medium text-black/60">Claim my {formatCurrency(actualLoss * 0.94)}/year back using BarberWallah</span>
                </Link>
                <button
                  onClick={() => setShowCalculator(false)}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/40 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Close & Keep Losing Profit
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
