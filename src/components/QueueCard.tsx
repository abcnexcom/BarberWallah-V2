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
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-['Playfair_Display'] text-xl font-bold">{entry.customerName}</h3>
            {entry.isCashOnly && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-md uppercase tracking-wider">{t('common.cash')}</span>}
          </div>
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <span className="flex items-center gap-1"><Phone size={12} /> {entry.phone || t('common.noPhone')}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span className="px-2 py-0.5 bg-[#f7f5f0] border border-[#e8e4dc] text-[#1a1a2e] text-[10px] font-bold rounded-full uppercase tracking-wider">
              {entry.serviceName}
            </span>
          </div>
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex flex-col items-center justify-center font-['Playfair_Display'] font-black text-xl",
          isActive ? "bg-[#1a1a2e] text-white" : "bg-[#f7f5f0] text-[#1a1a2e] border border-[#e8e4dc]"
        )}>
          <span className="text-[8px] uppercase tracking-widest opacity-50 font-sans font-bold -mb-1">{t('common.token')}</span>
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

      <div className="flex gap-2">
        {isActive ? (
          <button 
            onClick={() => onStatusUpdate(entry.id, 'done')}
            className="flex-1 py-3 bg-[#1a1a2e] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <CheckCircle2 size={18} /> {t('common.markDone')}
          </button>
        ) : (
          <>
            <button 
              onClick={() => onStatusUpdate(entry.id, 'in_service')}
              className="flex-[2] py-3 bg-[#1a1a2e] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <CheckCircle2 size={18} /> {t('common.startService')}
            </button>
            <a 
              href={`tel:${entry.phone}`}
              className="flex-1 py-3 bg-green-50 text-green-600 border border-green-100 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-green-100 transition-colors"
            >
              <Phone size={18} /> {t('common.call')}
            </a>
            <button 
              onClick={() => onNotifyWhatsApp && onNotifyWhatsApp(entry)}
              className="flex-1 py-3 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#25D366]/20 transition-colors"
            >
              <MessageCircle size={18} /> WhatsApp
            </button>
            <button 
              onClick={() => onStatusUpdate(entry.id, 'no_show')}
              className="p-3 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-100 transition-colors"
            >
              <XCircle size={18} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
