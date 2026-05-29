import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Scissors, Users, Clock, ArrowRight, AlertCircle, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { shopService } from '../services/shopService';
import { queueService } from '../services/queueService';
import { notificationService } from '../services/notificationService';
import { Shop, Service, ShopConfig } from '../types';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/LanguageContext';

export default function JoinQueue() {
  const { t } = useLanguage();
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [config, setConfig] = useState<ShopConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [waitingCount, setWaitingCount] = useState(0);
  const [occupancyCount, setOccupancyCount] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    serviceId: ''
  });

  useEffect(() => {
    if (!shopId) return;
    const loadData = async () => {
      try {
        const [shopData, servicesData, configData] = await Promise.all([
          shopService.getShop(shopId),
          shopService.getServices(shopId),
          shopService.getConfig(shopId)
        ]);

        if (!shopData) {
          setError(t('common.shopNotFound'));
          return;
        }

        setShop(shopData);
        setServices(servicesData);
        setConfig(configData);

        // Get current queue count
        const unsubscribe = queueService.subscribeToQueue(shopId, (entries) => {
          setWaitingCount(entries.filter(e => e.status === 'waiting').length);
          setOccupancyCount(entries.filter(e => e.waitingInShop && (e.status === 'waiting' || e.status === 'called')).length);
        });
        return () => unsubscribe();
      } catch (err) {
        console.error('Error loading shop data:', err);
        setError(t('common.connectionError'));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [shopId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!shopId || !formData.name || !formData.phone || !formData.serviceId) return;

    if (formData.phone.length !== 10) {
      setError(t('common.invalidPhone'));
      return;
    }

    setJoining(true);
    try {
      const selectedServiceIds = formData.serviceId.split(',').filter(Boolean);
      const selectedServices = services.filter(s => selectedServiceIds.includes(s.id));
      const compositeName = selectedServices.map(s => s.name).join(' + ');
      const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0) || config?.avgServiceMin || 20;

      const entryId = await queueService.joinQueue(shopId, {
        customerName: formData.name,
        phone: formData.phone,
        serviceId: formData.serviceId,
        serviceName: compositeName,
        estimatedWait: waitingCount * totalDuration
      });
      
      if (entryId) {
        // Send WhatsApp Notification
        if (config && config.enableWhatsApp) {
          const entry = {
            id: entryId,
            customerName: formData.name,
            phone: formData.phone,
            tokenNo: (waitingCount + 1), // Approximate
            estimatedWait: waitingCount * totalDuration
          } as any;
          
          notificationService.notifyOwnerOfJoiner(shop?.name || 'The Salon', entry, config);
        }
        
        navigate(`/shop/${shopId}/status/${entryId}`);
      } else {
        setError(t('common.joinFailed'));
      }
    } catch (err: any) {
      setError(err.message || t('common.joinFailed'));
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0f1a]">
        <div className="w-12 h-12 border-4 border-[#c9a84c] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !shop) {
    return (
      <div className="min-h-screen bg-[#0d0f1a] text-white flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{error}</h2>
          <Link to="/" className="text-[#c9a84c] hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#0d0f1a]">
      {/* Shop Hero */}
      <header 
        className="bg-[#1a1a2e] text-white pt-16 pb-12 px-6 text-center relative overflow-hidden"
        style={shop?.primaryColor ? { backgroundColor: shop.primaryColor } : {}}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)]"></div>
        <div className="relative z-10">
          {shop?.logoUrl ? (
            <img 
              src={shop.logoUrl} 
              alt={shop.name} 
              className="w-20 h-20 rounded-2xl mx-auto mb-6 shadow-xl object-cover border-2 border-white/20"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-[#c9a84c] to-[#e8c96a] rounded-2xl flex items-center justify-center text-[#0d0f1a] mx-auto mb-6 shadow-xl">
              <Scissors size={32} />
            </div>
          )}
          <h1 className="font-['Playfair_Display'] text-3xl font-black mb-2 tracking-tight">{shop?.name}</h1>
          <p className="text-white/50 text-sm mb-6 uppercase tracking-widest font-bold">{shop?.city}</p>
          
          <div className="flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 border border-white/10 rounded-full backdrop-blur-sm">
              <Users size={18} className="text-[#c9a84c]" />
              <span className="text-sm font-bold">{t('common.waitingNow')}: <span className="text-[#c9a84c]">{waitingCount}</span> {t('common.people')}</span>
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
                {occupancyCount >= (config.maxWaitingCapacity || 5) && (
                  <span className="text-[8px] font-bold text-red-400 uppercase tracking-tighter">{t('common.full')}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {!shop?.queueOpen && (
        <div className="bg-red-500 text-white text-center py-3 px-6 font-bold text-sm">
          ⚠️ {t('common.shopClosed')}
        </div>
      )}

      <main className="max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8 -mt-8 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#e8e4dc] rounded-[2rem] p-5 sm:p-8 shadow-xl"
        >
          <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-6">{t('common.joinQueue')}</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">{t('common.yourName')}</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-[#f7f5f0] border border-[#e8e4dc] rounded-2xl px-5 py-4 outline-none focus:border-[#1a1a2e] transition-colors"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">{t('common.mobileNumber')}</label>
              <input 
                type="tel" 
                required
                maxLength={10}
                placeholder="10-digit mobile"
                className="w-full bg-[#f7f5f0] border border-[#e8e4dc] rounded-2xl px-5 py-4 outline-none focus:border-[#1a1a2e] transition-colors font-mono"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">{t('common.service')}</label>
              <div className="space-y-2">
                {services.map(svc => {
                  const isSelected = formData.serviceId.split(',').filter(Boolean).includes(svc.id);
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => {
                        const ids = formData.serviceId ? formData.serviceId.split(',').filter(Boolean) : [];
                        const nextIds = ids.includes(svc.id)
                          ? ids.filter(id => id !== svc.id)
                          : [...ids, svc.id];
                        setFormData({...formData, serviceId: nextIds.join(',')});
                      }}
                      className={cn(
                        "w-full p-4 rounded-2xl border flex items-center justify-between transition-all group cursor-pointer",
                        isSelected 
                          ? "bg-[#1a1a2e] border-[#1a1a2e] text-white shadow-lg shadow-[#1a1a2e]/20" 
                          : "bg-[#f7f5f0] border-[#e8e4dc] text-gray-600 hover:border-gray-400"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                          isSelected ? "border-white" : "border-gray-300"
                        )}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-bold">{svc.name}</span>
                          <span className="text-[10px] opacity-60">{shop?.currency}{svc.price}</span>
                        </div>
                      </div>
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-widest",
                        isSelected ? "text-white/50" : "text-gray-400"
                      )}>{svc.duration} min</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {formData.serviceId && (
              <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-sm flex items-center gap-3">
                <Clock size={18} />
                <span>{t('common.estWait')}: <strong>{waitingCount * (services.filter(s => formData.serviceId.split(',').filter(Boolean).includes(s.id)).reduce((sum, s) => sum + s.duration, 0) || config?.avgServiceMin || 20)} {t('common.min')}</strong></span>
              </div>
            )}

            <button 
              type="submit"
              disabled={joining || !shop?.queueOpen}
              className="w-full py-5 bg-[#1a1a2e] text-white font-black uppercase tracking-[0.2em] text-sm rounded-2xl shadow-xl shadow-[#1a1a2e]/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
              style={shop?.primaryColor ? { backgroundColor: shop.primaryColor } : {}}
            >
              {joining ? t('common.joining') : t('common.joinQueue')}
            </button>

            <div className="text-center">
              <Link to="/token-recovery" className="text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-[#1a1a2e] transition-colors flex items-center justify-center gap-2">
                🎫 {t('common.alreadyJoined')}
              </Link>
            </div>
          </form>
        </motion.div>

        <footer className="mt-12 text-center text-gray-400 text-xs leading-relaxed">
          {t('common.noAppNeeded')}<br />
          {t('common.callWhenTurn')}
        </footer>
      </main>
    </div>
  );
}
