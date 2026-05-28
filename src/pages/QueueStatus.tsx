import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Scissors, 
  Users, 
  Clock, 
  Phone, 
  CheckCircle2, 
  Award,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { shopService } from '../services/shopService';
import { queueService } from '../services/queueService';
import { Shop, QueueEntry, ShopConfig, CustomerHistory } from '../types';
import { cn } from '../lib/utils';

import { useLanguage } from '../lib/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function QueueStatus() {
  const { t } = useLanguage();
  const { shopId, entryId } = useParams<{ shopId: string, entryId: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [entry, setEntry] = useState<QueueEntry | null>(null);
  const [config, setConfig] = useState<ShopConfig | null>(null);
  const [history, setHistory] = useState<CustomerHistory | null>(null);
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [waitingCount, setWaitingCount] = useState(0);
  const [occupancyCount, setOccupancyCount] = useState(0);
  const [servingToken, setServingToken] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId || !entryId) return;

    // Load static data
    const loadStatic = async () => {
      try {
        const [shopData, configData] = await Promise.all([
          shopService.getShop(shopId),
          shopService.getConfig(shopId)
        ]);
        setShop(shopData);
        setConfig(configData);
      } catch (err) {
        console.error('Error loading static data:', err);
      }
    };
    loadStatic();

    // Subscribe to entry updates
    const unsubEntry = onSnapshot(doc(db, 'shops', shopId, 'queue', entryId), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as QueueEntry;
        setEntry(data);
        
        // Load history if phone exists
        if (data.phone) {
          queueService.getCustomerHistory(shopId, data.phone).then(setHistory);
        }
      }
      setLoading(false);
    });

    // Subscribe to queue for stats
    const unsubQueue = queueService.subscribeToQueue(shopId, (entries) => {
      const active = entries.filter(e => ['waiting', 'called', 'in_service'].includes(e.status));
      setWaitingCount(active.filter(e => e.status === 'waiting').length);
      setOccupancyCount(entries.filter(e => e.waitingInShop && ['waiting', 'called', 'in_service'].includes(e.status)).length);
      
      const currentlyServing = entries.find(e => e.status === 'in_service' || e.status === 'called');
      setServingToken(currentlyServing?.tokenNo || null);
      
      const myEntry = entries.find(e => e.id === entryId);
      if (myEntry) {
        // People ahead are those with lower token number who are still in active status
        const ahead = active.filter(e => e.tokenNo < myEntry.tokenNo).length;
        setPeopleAhead(ahead);
      }
    });

    return () => {
      unsubEntry();
      unsubQueue();
    };
  }, [shopId, entryId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0f1a]">
        <div className="w-12 h-12 border-4 border-[#c9a84c] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-[#0d0f1a] text-white flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('common.tokenNotFound')}</h2>
          <Link to={`/shop/${shopId}`} className="text-[#c9a84c] hover:underline">{t('common.joinQueue')}</Link>
        </div>
      </div>
    );
  }

  const isCalled = entry.status === 'called' || entry.status === 'in_service';
  const isDone = entry.status === 'done';

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#0d0f1a] pb-20">
      {/* Hero */}
      <header 
        className="bg-[#1a1a2e] text-white pt-16 pb-12 px-6 text-center relative overflow-hidden"
        style={shop?.primaryColor ? { backgroundColor: shop.primaryColor } : {}}
      >
        <div className="absolute top-6 right-6 z-50">
          <LanguageSwitcher />
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)]"></div>
        <div className="relative z-10 flex flex-col items-center">
          {shop?.logoUrl && (
            <img 
              src={shop.logoUrl} 
              alt={shop.name} 
              className="w-16 h-16 rounded-xl mb-6 shadow-xl object-cover border-2 border-white/20"
              referrerPolicy="no-referrer"
            />
          )}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex flex-col items-center bg-white/10 border border-white/10 rounded-[2rem] px-10 py-8 backdrop-blur-md mb-4"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-black mb-2">{t('common.yourToken')}</span>
            <span className="text-6xl font-['Playfair_Display'] font-black">#{entry.tokenNo}</span>
            <span className="text-sm font-bold text-[#c9a84c] mt-4 uppercase tracking-widest">{entry.serviceName}</span>
          </motion.div>

          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              "inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-widest transition-all",
              isCalled ? "bg-green-500 text-white animate-pulse" : 
              isDone ? "bg-white/20 text-white" : "bg-white/10 text-white/70"
            )}>
              {isCalled ? `📞 ${t('common.yourTurn')}` : isDone ? `✓ ${t('common.serviceComplete')}` : `⏳ ${t('common.waiting')}`}
            </div>

            {config && (
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                  <span>{t('common.waitingOccupancy')}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full",
                    occupancyCount >= (config.maxWaitingCapacity || 5) ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                  )}>
                    {occupancyCount}/{config.maxWaitingCapacity || 5}
                  </span>
                </div>
                <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500",
                      occupancyCount >= (config.maxWaitingCapacity || 5) ? "bg-red-500" : "bg-[#c9a84c]"
                    )}
                    style={{ width: `${Math.min(100, (occupancyCount / (config.maxWaitingCapacity || 5)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6 -mt-8 relative z-20 space-y-4">
        <AnimatePresence mode="wait">
          {!isCalled && !isDone ? (
            <motion.div 
              key="waiting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e8e4dc] rounded-[2rem] p-8 shadow-xl text-center"
            >
              <div className="mb-6">
                <span className="text-7xl font-['Playfair_Display'] font-black text-[#1a1a2e] block leading-none">{peopleAhead}</span>
                <span className="text-xs font-black uppercase tracking-widest text-gray-400 mt-2 block">
                  {peopleAhead === 1 ? t('common.personAhead') : t('common.peopleAhead')}
                </span>
              </div>
              
              <div className="h-px bg-[#f7f5f0] w-full mb-6"></div>

              <div className="flex items-center justify-center gap-3 text-[#1a1a2e]">
                <Clock size={24} className="text-[#c9a84c]" />
                <div className="text-left">
                  <span className="text-2xl font-['Playfair_Display'] font-black block leading-none">
                    {Math.max(0, peopleAhead) * (config?.avgServiceMin || 20)} {t('common.min')}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t('common.estWait')}</span>
                </div>
              </div>

              {servingToken && (
                <div className="mt-6 pt-6 border-t border-[#f7f5f0] flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Now Serving: <span className="text-[#1a1a2e]">#{servingToken}</span>
                  </span>
                </div>
              )}

              <p className="mt-8 text-sm text-gray-400 leading-relaxed">
                {t('common.callWhenTurn')}. {t('common.pleaseStayNearby')}
              </p>
            </motion.div>
          ) : isCalled ? (
            <motion.div 
              key="called"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500 border-4 border-green-600 rounded-[2rem] p-8 shadow-xl text-center text-white"
            >
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone size={40} className="animate-bounce" />
              </div>
              <h2 className="font-['Playfair_Display'] text-3xl font-black mb-2">{t('common.yourTurnTitle')}</h2>
              <p className="text-white/80 text-lg font-medium">{t('common.pleaseComeToShop')}</p>
            </motion.div>
          ) : (
            <motion.div 
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-[#e8e4dc] rounded-[2rem] p-8 shadow-xl text-center"
            >
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-2">{t('common.done')}</h2>
              <p className="text-gray-400 text-sm">{t('common.seeYouNextTime')}</p>
              <Link to={`/shop/${shopId}`} className="mt-6 inline-block text-[#c9a84c] font-bold uppercase tracking-widest text-xs border-b-2 border-[#c9a84c] pb-1">{t('common.joinAgain')}</Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loyalty Card */}
        {config && config.loyaltyThreshold > 0 && (
          <div className="bg-gradient-to-br from-[#fdf6e3] to-[#fff8e8] border border-[#e8c96a] rounded-[2rem] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#7a5a00] flex items-center gap-2">
                <Award size={20} /> {t('loyalty.rewards')}
              </h3>
              <span className="bg-[#c9a84c] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                {config.loyaltyDiscountPct}% OFF
              </span>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              {Array.from({ length: config.loyaltyThreshold }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all",
                    i < (history?.streakCount || 0) 
                      ? "bg-[#c9a84c] text-white shadow-lg shadow-[#c9a84c]/30" 
                      : "bg-white border-2 border-dashed border-[#e8c96a]/50 text-transparent"
                  )}
                >
                  ✂
                </div>
              ))}
            </div>

            <p className="text-center text-[#7a5a00] text-sm font-medium">
              {history && history.streakCount >= config.loyaltyThreshold ? (
                <span className="flex flex-col gap-1">
                  <strong className="text-lg font-black block">🎉 {t('loyalty.rewardEarned')}</strong>
                  {t('loyalty.askDiscount').replace('{pct}', config.loyaltyDiscountPct.toString())}
                </span>
              ) : (
                <span><strong>{t('loyalty.moreVisits').replace('{count}', (config.loyaltyThreshold - (history?.streakCount || 0)).toString())}</strong></span>
              )}
            </p>
          </div>
        )}

        {/* Shop Info */}
        <div className="bg-white border border-[#e8e4dc] rounded-[2rem] p-6 shadow-sm divide-y divide-[#f7f5f0]">
          <div className="flex items-center gap-4 py-3">
            <div className="w-10 h-10 bg-[#f7f5f0] rounded-xl flex items-center justify-center text-[#1a1a2e]">
              <Scissors size={20} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">{t('common.shop')}</p>
              <p className="font-bold">{shop?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3">
            <div className="w-10 h-10 bg-[#f7f5f0] rounded-xl flex items-center justify-center text-[#1a1a2e]">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">{t('common.location')}</p>
              <p className="font-bold">{shop?.city}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3">
            <div className="w-10 h-10 bg-[#f7f5f0] rounded-xl flex items-center justify-center text-[#1a1a2e]">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">{t('common.contact')}</p>
              <a href={`tel:${shop?.phone}`} className="font-bold text-[#1a1a2e] underline decoration-[#c9a84c] decoration-2 underline-offset-4">{shop?.phone}</a>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <RefreshCw size={12} className="animate-spin" />
            {t('common.updatingLive')}
          </div>
        </div>
      </main>
    </div>
  );
}
