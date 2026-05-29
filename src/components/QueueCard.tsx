import React, { FormEvent } from 'react';
import { 
  CheckCircle2, 
  Phone, 
  XCircle,
  MessageCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { QueueEntry } from '../types';
import { cn } from '../lib/utils';

import { useLanguage } from '../lib/LanguageContext';

interface QueueCardProps {
  entry: QueueEntry;
  isActive?: boolean;
  index?: number;
  onStatusUpdate: (id: string, status: any) => Promise<void>;
  onNotifyWhatsApp?: (entry: QueueEntry) => void;
}

export default function QueueCard({ entry, isActive, index, onStatusUpdate, onNotifyWhatsApp }: any) {
  const { t } = useLanguage();
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white border rounded-2xl p-5 shadow-sm relative overflow-hidden group",
        isActive ? "border-[#1a1a2e] bg-gradient-to-br from-white to-[#1a1a2e]/5" : "border-[#e8e4dc]"
      )}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
        <div className="min-w-0 pr-2">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className="font-['Playfair_Display'] text-lg sm:text-xl font-bold break-words">{entry.customerName}</h3>
            {entry.isCashOnly && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] sm:text-[10px] font-bold rounded-md uppercase tracking-wider">{t('common.cash')}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2 gap-y-1 text-gray-400 text-xs sm:text-sm">
            <span className="flex items-center gap-1 shrink-0 select-all"><Phone size={11} /> {entry.phone || t('common.noPhone')}</span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {entry.serviceName ? (
              entry.serviceName.split(' + ').map((svc: string, i: number) => (
                <span key={i} className="inline-block px-2.5 py-0.5 bg-[#f7f5f0] border border-[#e8e4dc] text-[#1a1a2e] text-[10px] font-black rounded-md uppercase tracking-wider">
                  {svc}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-gray-400 italic">No service selected</span>
            )}
          </div>
        </div>
        <div className={cn(
          "w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex flex-col items-center justify-center font-['Playfair_Display'] font-black text-lg sm:text-xl shrink-0 self-end sm:self-start",
          isActive ? "bg-[#1a1a2e] text-white" : "bg-[#f7f5f0] text-[#1a1a2e] border border-[#e8e4dc]"
        )}>
          <span className="text-[7px] sm:text-[8px] uppercase tracking-widest opacity-50 font-sans font-bold -mb-1">{t('common.token')}</span>
          #{entry.tokenNo}
        </div>
      </div>

      {!isActive && (
        <div className="mb-4">
          <div className="w-full h-1 bg-[#f7f5f0] rounded-full overflow-hidden">
            <div className="h-full bg-[#1a1a2e] rounded-full transition-all duration-1000" style={{ width: `${Math.max(5, 100 - (index || 0) * 20)}%` }}></div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">{t('common.estWait')}: {entry.estimatedWait} {t('common.min')}</p>
        </div>
      )}

      <div className="flex flex-col gap-2 w-full">
        {isActive ? (
          <button 
            type="button"
            onClick={() => onStatusUpdate(entry.id, 'done')}
            className="w-full py-3 bg-[#1a1a2e] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer text-sm"
          >
            <CheckCircle2 size={18} /> {t('common.markDone')}
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <button 
              type="button"
              onClick={() => onStatusUpdate(entry.id, 'in_service')}
              className="w-full sm:flex-[2] py-2.5 sm:py-3 bg-[#1a1a2e] text-white font-black rounded-xl flex items-center justify-center gap-1.5 hover:opacity-90 transition-all cursor-pointer text-xs sm:text-sm shadow-sm"
            >
              <CheckCircle2 size={16} /> {t('common.startService')}
            </button>
            <div className="grid grid-cols-3 sm:flex sm:flex-[2] gap-1.5 sm:gap-2 w-full">
              <a 
                href={`tel:${entry.phone}`}
                className="py-2.5 sm:py-3 bg-green-50 text-green-600 border border-green-100 font-bold rounded-xl flex items-center justify-center gap-1 hover:bg-green-100 transition-colors text-[10px] sm:text-xs text-center"
              >
                <Phone size={13} className="shrink-0" /> {t('common.call')}
              </a>
              <button 
                type="button"
                onClick={() => onNotifyWhatsApp && onNotifyWhatsApp(entry)}
                className="py-2.5 sm:py-3 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 font-bold rounded-xl flex items-center justify-center gap-1 hover:bg-[#25D366]/20 transition-colors text-[10px] sm:text-xs text-center cursor-pointer"
              >
                <MessageCircle size={13} className="shrink-0" /> WA
              </button>
              <button 
                type="button"
                onClick={() => onStatusUpdate(entry.id, 'no_show')}
                className="py-2.5 sm:py-3 bg-red-50 text-red-500 border border-red-100 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-1 text-[10px] sm:text-xs text-center cursor-pointer"
              >
                <XCircle size={13} className="shrink-0 text-red-500" /> {t('common.noShow')}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
