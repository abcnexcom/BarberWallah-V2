import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Scissors, 
  Settings, 
  Users, 
  Clock, 
  CheckCircle2, 
  Phone, 
  XCircle, 
  Plus, 
  TrendingUp,
  LogOut,
  ChevronDown,
  ChevronUp,
  Menu,
  Calculator as CalcIcon,
  LayoutDashboard,
  HelpCircle,
  X,
  Brain,
  AlertCircle,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { shopService } from '../services/shopService';
import { queueService } from '../services/queueService';
import { notificationService } from '../services/notificationService';
import { Shop, QueueEntry, Service, ShopConfig, CustomerHistory } from '../types';
import { cn } from '../lib/utils';
import QueueCard from '../components/QueueCard';
import { useLanguage } from '../lib/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import SalonCalculator from '../components/SalonCalculator';
import CustomerLossCalculator from '../components/CustomerLossCalculator';
import AIInsights from '../components/AIInsights';
import { EarningRecord } from '../types';

export default function BarberDashboard() {
  const { t } = useLanguage();
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [config, setConfig] = useState<ShopConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'earnings' | 'customers' | 'calculator' | 'loss-calculator' | 'ai-insights'>('queue');
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerHistory[]>([]);
  const [walkInForm, setWalkInForm] = useState({
    name: '',
    phone: '',
    serviceId: '',
    isCashOnly: false,
    waitingInShop: true
  });

  useEffect(() => {
    if (!shopId) return;

    const loadData = async () => {
      try {
        const [shopData, servicesData, configData, earningsData, customersData] = await Promise.all([
          shopService.getShop(shopId),
          shopService.getServices(shopId),
          shopService.getConfig(shopId),
          shopService.getEarnings(shopId),
          shopService.getCustomers(shopId)
        ]);

        if (!shopData) {
          navigate('/login');
          return;
        }

        setShop(shopData);
        setServices(servicesData);
        setConfig(configData);
        setEarnings(earningsData);
        setCustomers(customersData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time queue updates
    const unsubscribe = queueService.subscribeToQueue(shopId, (entries) => {
      setQueue(entries);
    });

    return () => unsubscribe();
  }, [shopId, navigate]);

  const handleStatusUpdate = async (entryId: string, status: any) => {
    if (!shopId) return;
    
    // Optimistic UI update
    const originalQueue = [...queue];
    setQueue(prev => prev.map(e => e.id === entryId ? { ...e, status } : e));

    try {
      if (status === 'done') {
        const entry = originalQueue.find(e => e.id === entryId);
        const service = services.find(s => s.id === entry?.serviceId);
        if (entry && service && config) {
          await queueService.markDone(shopId, entryId, service.price, config);
        }
      } else if (status === 'in_service') {
        // When starting service, auto-call the person 2 spots ahead in waiting list
        await queueService.updateEntryStatus(shopId, entryId, status);
        
        const waitingList = originalQueue.filter(e => e.status === 'waiting');
        if (waitingList.length >= 2) {
          // Call the person at index 1 (2nd in waiting list)
          const personToCall = waitingList[1];
          await queueService.updateEntryStatus(shopId, personToCall.id, 'called');
          
          // Trigger the actual call and WhatsApp
          if (config) {
            const callSuccess = await notificationService.sendCallNotification(personToCall, config);
            
            // Send WhatsApp regardless or as fallback
            if (config.enableWhatsApp) {
              if (!callSuccess) {
                // Call failed, send WhatsApp fallback
                notificationService.notifyCustomerOfTurn(shop?.name || 'The Salon', personToCall, config);
              } else {
                // Call succeeded, but user said "can receive both"
                notificationService.notifyCustomerOfTurn(shop?.name || 'The Salon', personToCall, config);
              }
            }
          }
        }
      } else if (status === 'called') {
        // Manual call triggered from dashboard
        await queueService.updateEntryStatus(shopId, entryId, status);
        const entry = originalQueue.find(e => e.id === entryId);
        if (entry && config) {
          const callSuccess = await notificationService.sendCallNotification(entry, config);
          if (!callSuccess && config.enableWhatsApp) {
            notificationService.notifyCustomerOfTurn(shop?.name || 'The Salon', entry, config);
          }
        }
      } else {
        await queueService.updateEntryStatus(shopId, entryId, status);
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      // Revert on error
      setQueue(originalQueue);
      let errorMsg = 'Failed to update status. Please try again.';
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed && parsed.error) {
            errorMsg = `Firestore Error: ${parsed.error}`;
          }
        } catch {
          errorMsg = err.message;
        }
      }
      setToast({ message: errorMsg, type: 'error' });
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleNotifyWhatsApp = (entry: QueueEntry) => {
    if (!entry.phone) {
      setToast({ message: 'Customer does not have a phone number', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    if (!config) {
      setToast({ message: 'Configuration loading...', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    try {
      notificationService.notifyCustomerOfTurn(shop?.name || 'The Salon', entry, config, true);
      setToast({ message: 'Opening WhatsApp chat...', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to open WhatsApp', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/shop/${shopId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddWalkIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!shopId) return;
    
    if (!walkInForm.name) {
      setToast({ message: 'Please enter customer name', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    if (!walkInForm.serviceId) {
      setToast({ message: 'Please select a service', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      const service = services.find(s => s.id === walkInForm.serviceId);
      if (!service) {
        setToast({ message: 'Please select a service', type: 'error' });
        setTimeout(() => setToast(null), 3000);
        return;
      }
      
      const entryId = await queueService.joinQueue(shopId, {
        customerName: walkInForm.name,
        phone: walkInForm.isCashOnly ? '' : walkInForm.phone,
        serviceId: walkInForm.serviceId,
        serviceName: service.name,
        isCashOnly: walkInForm.isCashOnly,
        waitingInShop: walkInForm.waitingInShop,
        estimatedWait: waiting.length * (service.duration || config?.avgServiceMin || 20)
      });
      
      if (entryId) {
        setWalkInForm({ name: '', phone: '', serviceId: '', isCashOnly: false, waitingInShop: true });
        setIsWalkInOpen(false);
        setToast({ message: 'Walk-in customer added successfully', type: 'success' });
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({ message: 'Failed to add customer. Check your login session.', type: 'error' });
        setTimeout(() => setToast(null), 4000);
      }
    } catch (err: any) {
      console.error('Error adding walk-in:', err);
      let errorMsg = 'Failed to add customer';
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed && parsed.error) {
            errorMsg = `Firestore Error: ${parsed.error}`;
          }
        } catch {
          errorMsg = err.message;
        }
      }
      setToast({ message: errorMsg, type: 'error' });
      setTimeout(() => setToast(null), 5000);
    }
  };

  const toggleQueue = async () => {
    if (!shopId || !shop) return;
    try {
      const newStatus = !shop.queueOpen;
      await shopService.updateShop(shopId, { queueOpen: newStatus });
      setShop({ ...shop, queueOpen: newStatus });
    } catch (err) {
      console.error('Error toggling queue:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0f1a]">
        <div className="w-12 h-12 border-4 border-[#c9a84c] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const waiting = queue.filter(e => e.status === 'waiting');
  const inService = queue.filter(e => e.status === 'in_service');
  const called = queue.filter(e => e.status === 'called');
  const servedToday = queue.filter(e => e.status === 'done').length;
  const occupancyCount = queue.filter(e => e.waitingInShop && ['waiting', 'called', 'in_service'].includes(e.status)).length;
  const effectiveMaxCapacity = config?.maxWaitingCapacity || 5;

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#0d0f1a] pb-20">
      {/* Sidebar Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed top-0 left-0 h-full w-72 bg-[#1a1a2e] text-white z-[60] p-8 shadow-2xl"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-12">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#c9a84c] flex items-center justify-center text-[#1a1a2e]">
                      <Scissors size={20} />
                    </div>
                    <span className="font-['Playfair_Display'] text-xl font-black tracking-tight">BarberWallah</span>
                  </div>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <nav className="space-y-2 flex-1">
                  <button 
                    onClick={() => { setActiveTab('queue'); setIsMenuOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all",
                      activeTab === 'queue' ? "bg-[#c9a84c] text-white shadow-lg shadow-[#c9a84c]/20" : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <LayoutDashboard size={20} /> {t('nav.dashboard')}
                  </button>
                  <button 
                    onClick={() => { setActiveTab('calculator'); setIsMenuOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all",
                      activeTab === 'calculator' ? "bg-[#c9a84c] text-white shadow-lg shadow-[#c9a84c]/20" : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <CalcIcon size={20} /> {t('common.calculator')}
                  </button>
                  <button 
                    onClick={() => { setActiveTab('loss-calculator'); setIsMenuOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all",
                      activeTab === 'loss-calculator' ? "bg-[#c9a84c] text-white shadow-lg shadow-[#c9a84c]/20" : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <TrendingUp size={20} /> {t('nav.lossCalculator')}
                  </button>
                  <button 
                    onClick={() => { setActiveTab('ai-insights'); setIsMenuOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all",
                      activeTab === 'ai-insights' ? "bg-[#c9a84c] text-white shadow-lg shadow-[#c9a84c]/20" : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Brain size={20} /> {t('nav.aiInsights')}
                  </button>
                  <Link 
                    to={`/barber/${shopId}/settings`}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-white/60 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <Settings size={20} /> {t('nav.settings')}
                  </Link>
                  <Link 
                    to="/tutorial"
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-white/60 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <HelpCircle size={20} /> {t('nav.tutorial')}
                  </Link>
                </nav>

                <div className="pt-8 border-t border-white/5">
                  <button 
                    onClick={() => {
                      localStorage.removeItem('shopId');
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={20} /> {t('nav.logout')}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header 
        className="bg-[#1a1a2e] text-white p-6 sticky top-0 z-30 shadow-lg"
        style={shop?.primaryColor ? { backgroundColor: shop.primaryColor } : {}}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="font-['Playfair_Display'] text-2xl font-black tracking-tight">{shop?.name}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  shop?.queueOpen ? "bg-green-500 animate-pulse" : "bg-red-500"
                )}></div>
                <span className="hidden sm:inline text-xs text-white/60 uppercase tracking-widest font-bold">
                  {shop?.queueOpen ? t('common.open') : t('common.closed')}
                </span>
              </div>
              
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-xs font-bold"
              >
                <Share2 size={16} className={cn(copied ? "text-green-400" : "")} />
                {copied ? "Link Copied!" : "Share Shop"}
              </button>

              <button 
                onClick={() => setIsMenuOpen(true)}
                className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-[#1a1a2e] pb-12 pt-4" style={shop?.primaryColor ? { backgroundColor: shop.primaryColor } : {}}>
        <div className="max-w-4xl mx-auto px-6">
          {activeTab === 'loss-calculator' ? (
            <div className="text-center py-6">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#c9a84c] font-black mb-2">Free Tool — BarberWallah</div>
              <h2 className="text-4xl font-['Playfair_Display'] font-bold text-white mb-2">{t('loss.title')}</h2>
              <div className="flex items-center justify-center gap-4 text-white/30 text-xs font-medium">
                <span>barberwallah.com</span>
                <span className="w-1 h-1 rounded-full bg-white/10"></span>
                <span>8454015157</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={shop?.queueOpen} onChange={toggleQueue} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                  <span className="text-sm font-semibold text-white/80">{t('common.queueOpen')}</span>
                </div>
                <LanguageSwitcher />
              </div>

              {activeTab === 'queue' && (
                <div className={cn(
                  "grid gap-4",
                  "grid-cols-2 md:grid-cols-4"
                )}>
                  <div className="bg-[#c9a84c]/10 border border-[#c9a84c]/20 rounded-xl p-4 text-center shadow-lg transform hover:scale-105 transition-transform">
                    <span className="text-3xl font-black block text-[#c9a84c]">{waiting.length}</span>
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{t('common.waiting')}</span>
                  </div>
                  <div className="bg-[#c9a84c]/10 border border-[#c9a84c]/20 rounded-xl p-4 text-center shadow-lg transform hover:scale-105 transition-transform">
                    <span className="text-3xl font-black block text-[#c9a84c]">{servedToday}</span>
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{t('common.servedToday')}</span>
                  </div>
                  <div className="bg-[#c9a84c]/10 border border-[#c9a84c]/20 rounded-xl p-4 text-center shadow-lg transform hover:scale-105 transition-transform">
                    <span className="text-3xl font-black block text-[#c9a84c]">
                      {(waiting.length + called.length) * (config?.avgServiceMin || 20)}m
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{t('common.avgWait')}</span>
                  </div>
                  <div className={cn(
                    "border rounded-xl p-4 text-center shadow-lg transform hover:scale-105 transition-transform",
                    occupancyCount >= effectiveMaxCapacity ? "bg-red-500/10 border-red-500/20" : "bg-[#c9a84c]/10 border-[#c9a84c]/20"
                  )}>
                    <span className={cn(
                      "text-3xl font-black block",
                      occupancyCount >= effectiveMaxCapacity ? "text-red-500" : "text-[#c9a84c]"
                    )}>
                      {occupancyCount}/{effectiveMaxCapacity}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{t('common.waitingOccupancy')}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-6">
        {/* Tab Switcher */}
        {activeTab !== 'loss-calculator' && (
          <div className="bg-white border border-[#e8e4dc] rounded-2xl p-1.5 flex mb-8 shadow-sm">
            <button 
              onClick={() => setActiveTab('queue')}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all",
                activeTab === 'queue' ? "bg-[#1a1a2e] text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {t('common.queue')}
            </button>
            <button 
              onClick={() => setActiveTab('earnings')}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all",
                activeTab === 'earnings' ? "bg-[#1a1a2e] text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {t('common.earnings')}
            </button>
            <button 
              onClick={() => setActiveTab('customers')}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all",
                activeTab === 'customers' ? "bg-[#1a1a2e] text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {t('common.customers')}
            </button>
          </div>
        )}

        {activeTab === 'calculator' ? (
          shop && <SalonCalculator shop={shop} />
        ) : activeTab === 'loss-calculator' ? (
          shop && <CustomerLossCalculator shop={shop} onUpdate={(updates) => setShop({...shop, ...updates})} />
        ) : activeTab === 'ai-insights' ? (
          shop && <AIInsights shop={shop} earnings={earnings} queue={queue} />
        ) : activeTab === 'earnings' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-['Playfair_Display'] font-bold">{t('earnings.title')}</h2>
            <div className="bg-white border border-[#e8e4dc] rounded-[2rem] overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-[#f7f5f0] border-b border-[#e8e4dc]">
                  <tr>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black">{t('earnings.date')}</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black">{t('earnings.customers')}</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-black">{t('earnings.revenue')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f7f5f0]">
                  {earnings.length > 0 ? earnings.map(record => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium">{record.date}</td>
                      <td className="px-6 py-4">{record.totalCustomers}</td>
                      <td className="px-6 py-4 font-bold text-green-600">{shop?.currency}{record.netRevenue}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-gray-400">{t('earnings.empty')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'customers' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-['Playfair_Display'] font-bold">{t('loyalty.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customers.length > 0 ? customers.map(cust => (
                <div key={cust.id} className="bg-white border border-[#e8e4dc] rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{cust.customerName}</h3>
                      <p className="text-sm text-gray-400">{cust.phone}</p>
                    </div>
                    <div className="bg-[#fdf6e3] text-[#7a5a00] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {cust.totalVisits} {t('loyalty.visits')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#c9a84c]" 
                        style={{ width: `${(cust.streakCount / (config?.loyaltyThreshold || 5)) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-[#c9a84c]">{cust.streakCount}/{config?.loyaltyThreshold || 5}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">{t('loyalty.streak')}</p>
                </div>
              )) : (
                <div className="col-span-full bg-white border border-dashed border-[#e8e4dc] rounded-2xl p-10 text-center">
                  <p className="text-gray-400 text-sm font-medium">{t('loyalty.empty')}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Walk-in Form */}
            <div className="mb-8">
              <button 
                onClick={() => setIsWalkInOpen(!isWalkInOpen)}
                className="w-full bg-white border border-[#e8e4dc] rounded-xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <Plus size={20} className="text-gray-400 group-hover:text-[#1a1a2e]" />
                  <span className="font-bold text-gray-700">{t('common.addWalkIn')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-transform",
                    isWalkInOpen ? "rotate-180" : ""
                  )}>
                    <ChevronDown size={20} className="text-gray-400" />
                  </div>
                </div>
              </button>

          <AnimatePresence>
            {isWalkInOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <form onSubmit={handleAddWalkIn} className="bg-white border-x border-b border-[#e8e4dc] rounded-b-2xl p-6 space-y-4 shadow-sm">
                  {occupancyCount >= effectiveMaxCapacity && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-bold">
                      <AlertCircle size={16} />
                      {t('common.full')}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{t('common.name')}</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Rahul"
                        className="w-full bg-[#f7f5f0] border border-[#e8e4dc] rounded-xl px-4 py-3 outline-none focus:border-[#1a1a2e]"
                        value={walkInForm.name}
                        onChange={e => setWalkInForm({...walkInForm, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{t('common.phone')}</label>
                      <input 
                        type="tel" 
                        maxLength={10}
                        disabled={walkInForm.isCashOnly}
                        placeholder="10-digit mobile"
                        className="w-full bg-[#f7f5f0] border border-[#e8e4dc] rounded-xl px-4 py-3 outline-none focus:border-[#1a1a2e] disabled:opacity-50"
                        value={walkInForm.phone}
                        onChange={e => setWalkInForm({...walkInForm, phone: e.target.value.replace(/\D/g, '')})}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={walkInForm.isCashOnly} 
                        onChange={e => setWalkInForm({...walkInForm, isCashOnly: e.target.checked, phone: e.target.checked ? '' : walkInForm.phone})} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c9a84c]"></div>
                    </label>
                    <span className="text-sm font-medium text-gray-600">{t('common.cashOnlyDesc')}</span>
                  </div>

                  <div className="flex items-center gap-3 py-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={walkInForm.waitingInShop} 
                        onChange={e => setWalkInForm({...walkInForm, waitingInShop: e.target.checked})} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c9a84c]"></div>
                    </label>
                    <span className="text-sm font-medium text-gray-600">{t('common.waitingInShop')}</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{t('common.service')}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {services.length > 0 ? (
                        services.map(svc => (
                          <button
                            key={svc.id}
                            type="button"
                            onClick={() => setWalkInForm({...walkInForm, serviceId: svc.id})}
                            className={cn(
                              "p-3 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center",
                              walkInForm.serviceId === svc.id 
                                ? "bg-[#1a1a2e] text-white border-[#1a1a2e]" 
                                : "bg-[#f7f5f0] text-gray-600 border-[#e8e4dc] hover:border-gray-400"
                            )}
                          >
                            <span>{svc.name}</span>
                            <span className="text-[10px] opacity-60">{shop?.currency}{svc.price}</span>
                          </button>
                        ))
                      ) : (
                        <div className="col-span-full py-4 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
                          No active services found. <Link to="/barber/settings" className="text-[#c9a84c] underline">Add services</Link>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-[#1a1a2e] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    {t('common.addToQueue')}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Now Serving */}
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-black mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            {t('common.nowServing')}
          </h2>
          <div className="space-y-3">
            {inService.length > 0 ? (
              inService.map(entry => (
                <QueueCard 
                  key={entry.id} 
                  entry={entry} 
                  isActive 
                  onStatusUpdate={handleStatusUpdate}
                  onNotifyWhatsApp={handleNotifyWhatsApp}
                />
              ))
            ) : (
              <div className="bg-white/50 border border-dashed border-[#e8e4dc] rounded-2xl p-10 text-center">
                <p className="text-gray-400 text-sm font-medium">{t('common.noServing')}</p>
              </div>
            )}
          </div>
        </section>

        {/* Called / Arriving */}
        {called.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-black mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              {t('common.calledArriving')}
            </h2>
            <div className="space-y-3">
              {called.map(entry => (
                <QueueCard 
                  key={entry.id} 
                  entry={entry} 
                  onStatusUpdate={handleStatusUpdate}
                  onNotifyWhatsApp={handleNotifyWhatsApp}
                />
              ))}
            </div>
          </section>
        )}

        {/* Waiting List */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-black mb-4 flex items-center gap-2">
            <Users size={14} />
            {t('common.waitingCount')} ({waiting.length})
          </h2>
          <div className="space-y-3">
            {waiting.length > 0 ? (
              waiting.map((entry, idx) => (
                <QueueCard 
                  key={entry.id} 
                  entry={entry} 
                  index={idx}
                  onStatusUpdate={handleStatusUpdate}
                  onNotifyWhatsApp={handleNotifyWhatsApp}
                />
              ))
            ) : (
              <div className="bg-white/50 border border-dashed border-[#e8e4dc] rounded-2xl p-10 text-center">
                <p className="text-gray-400 text-sm font-medium">{t('common.queueEmpty')}</p>
              </div>
            )}
          </div>
        </section>
          </>
        )}
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className={cn(
              "fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-white text-sm font-bold shadow-2xl z-50",
              toast.type === 'success' ? "bg-green-600" : "bg-red-600"
            )}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

