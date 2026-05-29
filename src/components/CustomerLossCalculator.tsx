import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingDown, Calculator, DollarSign, Gift, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { shopService } from '../services/shopService';
import { Shop } from '../types';

interface CustomerLossCalculatorProps {
  shop: Shop;
  onUpdate: (updates: Partial<Shop>) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SOFTWARE_ACTUAL_PRICE = 4999; // Example base price

export default function CustomerLossCalculator({ shop, onUpdate }: CustomerLossCalculatorProps) {
  const { t } = useLanguage();
  const [losses, setLosses] = useState<Record<string, number>>({
    Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0
  });
  const [avgPrice, setAvgPrice] = useState(200);
  const [guess, setGuess] = useState('');
  const [showGame, setShowGame] = useState(false);
  const [discount, setDiscount] = useState<number | null>(shop.softwareDiscount || null);
  const [guessed, setGuessed] = useState(shop.softwarePriceGuessed || false);

  const weeklyLossCount = (Object.values(losses) as number[]).reduce((a, b) => a + b, 0);
  const weeklyRevenueLoss = weeklyLossCount * avgPrice;
  const monthlyRevenueLoss = weeklyRevenueLoss * 4.33;
  const yearlyRevenueLoss = weeklyRevenueLoss * 52;

  const handleGuess = async () => {
    if (!guess) return;
    
    let guessedPrice = parseInt(guess);
    
    // Apply price floors based on country
    if (shop.country === 'India') {
      if (guessedPrice < 20000) guessedPrice = 20000;
    } else {
      if (guessedPrice < 50000) guessedPrice = 50000;
    }

    const randomDiscount = Math.floor(Math.random() * (15 - 5 + 1)) + 5;
    const finalPrice = Math.round(guessedPrice * (1 - randomDiscount / 100));
    
    const updates = {
      softwareDiscount: randomDiscount,
      softwarePriceGuessed: true,
      softwarePrice: finalPrice
    };
    
    try {
      await shopService.updateShop(shop.id, updates);
      setDiscount(randomDiscount);
      setGuessed(true);
      onUpdate(updates);
    } catch (err) {
      console.error('Error saving discount:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    const symbol = shop.currency || '₹';
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#13162a] border border-white/5 rounded-3xl p-5 sm:p-8">
        <div className="mb-8">
          <div className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-semibold mb-2">{t('loss.step1')}</div>
          <h3 className="text-xl sm:text-2xl font-['Playfair_Display'] font-bold text-white mb-2">{t('loss.question')}</h3>
          <p className="text-white/40 text-sm">{t('loss.desc')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-semibold flex justify-between">
                {t('loss.avgPrice')} <span>{shop.currency}{avgPrice}</span>
              </label>
              <input 
                type="range" 
                min="50" 
                max="2000" 
                step="10"
                value={avgPrice}
                onChange={(e) => setAvgPrice(parseInt(e.target.value))}
                className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#c9a84c]"
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-white/60">{t('loss.dailyLoss')}</h3>
              {DAYS.map(day => (
                <div key={day} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">{day}</span>
                    <span className="text-[#c9a84c] font-mono">{losses[day]}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="250" 
                    value={losses[day]}
                    onChange={(e) => setLosses({...losses, [day]: parseInt(e.target.value)})}
                    className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#c9a84c]"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-6">
              <h3 className="text-sm font-semibold text-[#c9a84c] uppercase tracking-widest">{t('loss.estRevenueLoss')}</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center sm:items-end gap-2">
                  <span className="text-white/40 text-xs sm:text-sm shrink-0">{t('loss.weekly')}</span>
                  <span className="text-xl sm:text-2xl font-bold text-red-400 break-all text-right font-mono">{formatCurrency(weeklyRevenueLoss)}</span>
                </div>
                <div className="flex justify-between items-center sm:items-end gap-2">
                  <span className="text-white/40 text-xs sm:text-sm shrink-0">{t('loss.monthly')}</span>
                  <span className="text-2xl sm:text-3xl font-bold text-red-500 break-all text-right font-mono">{formatCurrency(monthlyRevenueLoss)}</span>
                </div>
                <div className="flex justify-between items-center sm:items-end gap-2 pt-4 border-t border-white/10">
                  <span className="text-white/40 text-xs sm:text-sm shrink-0">{t('loss.yearly')}</span>
                  <span className="text-3xl sm:text-4xl font-black text-red-600 break-all text-right font-mono">{formatCurrency(yearlyRevenueLoss)}</span>
                </div>
              </div>

              {!guessed && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowGame(true)}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#c9a84c] to-[#e8c96a] text-[#0d0f1a] text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 mt-6 sm:mt-8 hover:brightness-110 transition-all cursor-pointer shadow-md"
                >
                  <Gift size={16} className="shrink-0" /> {t('loss.recover')}
                </motion.button>
              )}
            </div>

            {guessed && discount && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-lg font-bold text-green-400 mb-2">{t('loss.guessCorrect')}</h4>
                <div className="text-2xl font-black text-white">
                  {formatCurrency(shop.softwarePrice || (SOFTWARE_ACTUAL_PRICE * (1 - discount/100)))}
                  <span className="text-sm font-normal text-white/40 line-through ml-2">
                    {formatCurrency(Math.round((shop.softwarePrice || (SOFTWARE_ACTUAL_PRICE * (1 - discount/100))) / (1 - discount/100)))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showGame && !guessed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0d0f1a]/95 backdrop-blur-xl flex items-center justify-center px-4 py-8 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-[#13162a] border border-white/10 rounded-[2rem] p-5 sm:p-8 text-center my-auto"
            >
              <div className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-semibold mb-3">{t('loss.step2')}</div>
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#c9a84c]/10 text-[#c9a84c] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <DollarSign size={28} className="sm:size-10" />
              </div>
              <h3 className="text-xl sm:text-2xl font-['Playfair_Display'] font-bold mb-3">{t('loss.guessQuestion')}</h3>
              <p className="text-white/50 text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed px-1">
                {t('loss.guessDesc').replace('{amount}', formatCurrency(yearlyRevenueLoss))}
              </p>

              <div className="grid gap-3">
                <input 
                  type="number" 
                  placeholder={t('loss.guessPlaceholder')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 sm:py-4 text-center text-xl sm:text-2xl font-bold text-white focus:border-[#c9a84c] outline-none"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                />
                <button 
                  onClick={handleGuess}
                  className="w-full py-3.5 bg-gradient-to-r from-[#c9a84c] to-[#e8c96a] text-[#0d0f1a] text-sm font-black uppercase tracking-wider rounded-xl cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-md"
                >
                  {t('loss.submit')}
                </button>
                <button 
                  onClick={() => setShowGame(false)}
                  className="text-white/30 text-xs sm:text-sm hover:text-white transition-colors cursor-pointer pt-1"
                >
                  {t('loss.maybeLater')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
