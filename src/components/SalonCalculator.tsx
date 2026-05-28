import React, { useState } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Plus,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';

import { Shop } from '../types';
import { cn } from '../lib/utils';

interface SalonCalculatorProps {
  shop: Shop;
}

export default function SalonCalculator({ shop }: SalonCalculatorProps) {
  const { t } = useLanguage();
  const currency = shop.currency || '₹';
  const [revenue, setRevenue] = useState<number>(0);
  const [expenses, setExpenses] = useState<Record<string, number>>({
    rent: 0,
    products: 0,
    electricity: 0,
    staff: 0,
    other: 0
  });

  const totalExpenses: number = (Object.values(expenses) as number[]).reduce((a: number, b: number) => a + b, 0);
  const profit: number = revenue - totalExpenses;

  return (
    <div className="bg-white border border-[#e8e4dc] rounded-[2rem] p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#1a1a2e] text-white rounded-2xl flex items-center justify-center">
          <Calculator size={24} />
        </div>
        <div>
          <h2 className="font-['Playfair_Display'] text-2xl font-black">{t('calc.title')}</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Monthly Overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{t('calc.revenue')}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{currency}</span>
              <input 
                type="number" 
                className="w-full bg-[#f7f5f0] border border-[#e8e4dc] rounded-xl pl-8 pr-4 py-3 outline-none focus:border-[#1a1a2e] font-bold"
                value={revenue || ''}
                onChange={e => setRevenue(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="h-px bg-[#f7f5f0] w-full"></div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{t('calc.expenses')}</label>
            
            {Object.entries(expenses).map(([key, value]) => (
              <div key={key} className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-medium capitalize">{t(`calc.${key}`)}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{currency}</span>
                  <input 
                    type="number" 
                    className="w-full bg-[#f7f5f0] border border-[#e8e4dc] rounded-xl pl-8 pr-4 py-2 outline-none focus:border-[#1a1a2e]"
                    value={value || ''}
                    onChange={e => setExpenses({...expenses, [key]: Number(e.target.value)})}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-[#f7f5f0] rounded-2xl p-6 border border-[#e8e4dc]">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-2">{t('calc.profit')}</span>
            <div className={cn(
              "text-4xl font-['Playfair_Display'] font-black",
              profit >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {currency}{profit.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-4">
              {profit >= 0 ? (
                <div className="flex items-center gap-1 text-xs font-bold text-green-600 uppercase tracking-widest">
                  <TrendingUp size={14} /> Healthy Profit
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs font-bold text-red-600 uppercase tracking-widest">
                  <TrendingDown size={14} /> Loss Detected
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1a1a2e] text-white rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-white/40">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Revenue</span>
                <span className="font-bold">{currency}{revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Expenses</span>
                <span className="font-bold">{currency}{totalExpenses.toLocaleString()}</span>
              </div>
              <div className="h-px bg-white/10 w-full my-2"></div>
              <div className="flex justify-between text-lg font-bold">
                <span>Net</span>
                <span className={profit >= 0 ? "text-[#c9a84c]" : "text-red-400"}>{currency}{profit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

