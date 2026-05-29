import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  MoreVertical,
  Calendar,
  Phone,
  MapPin,
  MessageSquare,
  Lock,
  LogIn,
  Plus,
  Trash2,
  Percent,
  Receipt,
  CreditCard
} from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { shopService } from '../services/shopService';
import { Shop } from '../types';
import { cn } from '../lib/utils';

const PLAN_PRICES: Record<string, number> = { basic: 999, intermediate: 2999, advanced: 4999 };

export default function AdminPanel() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'all' | 'referrals' | 'revenue'>('pending');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  // Referrals configuration states
  const [referralEnabled, setReferralEnabled] = useState(true);
  const [referralCodesInput, setReferralCodesInput] = useState('');
  const [isSavingReferral, setIsSavingReferral] = useState(false);

  const loadReferralConfig = async () => {
    try {
      const config = await shopService.getReferralConfig();
      setReferralEnabled(config.enabled);
      
      const formatted = config.validCodes.map(code => {
        const pct = config.codePercentages?.[code] ?? 15;
        return `${code}:${pct}`;
      });
      setReferralCodesInput(formatted.join(', '));
    } catch (err) {
      console.error('Failed to load referral config:', err);
    }
  };

  const handleSaveReferrals = async () => {
    setIsSavingReferral(true);
    const validCodes: string[] = [];
    const codePercentages: Record<string, number> = {};

    referralCodesInput
      .split(',')
      .map(part => part.trim())
      .filter(part => part.length > 0)
      .forEach(part => {
        const colonIndex = part.indexOf(':');
        if (colonIndex !== -1) {
          const code = part.substring(0, colonIndex).trim().toUpperCase();
          const pctVal = Number(part.substring(colonIndex + 1).trim());
          const pct = isNaN(pctVal) ? 15 : pctVal;
          if (code) {
            validCodes.push(code);
            codePercentages[code] = pct;
          }
        } else {
          const code = part.trim().toUpperCase();
          if (code) {
            validCodes.push(code);
            codePercentages[code] = 15; // fallback default
          }
        }
      });

    const success = await shopService.saveReferralConfig({
      enabled: referralEnabled,
      validCodes,
      codePercentages
    });

    if (success) {
      showToast('Referral configuration saved!');
      loadReferralConfig(); // Refresh formatting
    } else {
      showToast('Failed to update referral configuration.', 'error');
    }
    setIsSavingReferral(false);
  };

  useEffect(() => {
    return auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      if (user && (user.email === 'abcnex.com@gmail.com' || user.uid === 'Q6Bw8rKstbejZXxIQf1NsOwQXZA3')) {
        setIsAuthorized(true);
        shopService.registerAdmin(user.uid, 'google_auth');
        shopService.getAllShops().then(data => setShops(data));
        loadReferralConfig();
      }
    });
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const user = res.user;
      if (user && (user.email === 'abcnex.com@gmail.com' || user.uid === 'Q6Bw8rKstbejZXxIQf1NsOwQXZA3')) {
        setIsAuthorized(true);
        await shopService.registerAdmin(user.uid, 'google_auth');
        const data = await shopService.getAllShops();
        setShops(data);
        loadReferralConfig();
      }
      showToast('Logged in successfully');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setIsAuthorized(false);
    showToast('Signed out');
  };

  const verifyPin = async () => {
    const ok = await shopService.verifyAdminPin(pin);
    if (ok) {
      setIsAuthorized(true);
      loadShops();
      loadReferralConfig();
    } else {
      setError('Invalid Admin PIN');
      setPin('');
    }
  };

  const loadShops = async () => {
    setLoading(true);
    const data = await shopService.getAllShops();
    setShops(data);
    setLoading(false);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (shopId: string, plan: string, paidUntil: string, notes: string) => {
    const res = await shopService.adminApproveShop(shopId, plan, paidUntil, notes);
    if (res.success) {
      showToast(`Shop ${shopId} approved!`);
      loadShops();
    } else {
      showToast(res.message || 'Failed to approve', 'error');
    }
  };

  const handleSuspend = async (shopId: string) => {
    if (!window.confirm(`Suspend ${shopId}?`)) return;
    const res = await shopService.adminSuspendShop(shopId);
    if (res.success) {
      showToast(`Shop ${shopId} suspended`);
      loadShops();
    } else {
      showToast(res.message || 'Failed to suspend', 'error');
    }
  };

  const filteredShops = shops.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery);
    
    if (activeTab === 'pending') return s.status === 'pending' && matchesSearch;
    if (activeTab === 'active') return s.status === 'active' && matchesSearch;
    if (activeTab === 'all') return matchesSearch;
    return false;
  });

  const stats = {
    pending: shops.filter(s => s.status === 'pending').length,
    active: shops.filter(s => s.status === 'active').length,
    suspended: shops.filter(s => s.status === 'suspended').length,
    mrr: shops.filter(s => s.status === 'active').reduce((sum, s) => sum + (PLAN_PRICES[s.plan] || 0), 0)
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0d0f1a] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#13162a] border border-white/5 rounded-3xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-[#c9a84c]/10 text-[#c9a84c] rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-white/40 text-sm mb-8">Master account access only</p>
          
          <div className="space-y-4">
            <input 
              type="password" 
              placeholder="••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center text-3xl tracking-[0.5em] text-white focus:border-[#c9a84c] outline-none"
              value={pin}
              onChange={e => setPin(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && verifyPin()}
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button 
              onClick={verifyPin}
              className="w-full py-4 bg-gradient-to-r from-[#c9a84c] to-[#e8c96a] text-[#0d0f1a] font-bold rounded-xl"
            >
              Enter Admin Panel
            </button>

            <div className="pt-4 border-t border-white/5 mt-4">
              <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-4">Or identify with Google</p>
              <button 
                onClick={loginWithGoogle}
                className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all text-sm"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
                Sign in with Google
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#0d0f1a] pb-20">
      <header className="bg-[#0d0f1a] text-white p-4 sm:p-6 sticky top-0 z-30 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="font-['Playfair_Display'] text-xl sm:text-2xl font-black">BarberWallah <span className="text-[#c9a84c]">Admin</span></h1>
              <p className="text-white/40 text-[8px] sm:text-[10px] uppercase tracking-widest font-bold">Master Control Panel</p>
            </div>
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="text-right select-none max-w-[200px] sm:max-w-none">
                    <div className="text-[9px] sm:text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">
                      {currentUser.isAnonymous ? 'Anonymous Admin' : currentUser.email}
                    </div>
                    <button onClick={handleSignOut} className="text-[8px] text-[#c9a84c] uppercase tracking-widest font-black hover:underline cursor-pointer">Sign Out</button>
                  </div>
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} className="w-8 h-8 rounded-full border border-[#c9a84c]/20" alt="" />
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-[#c9a84c]/20 bg-white/5 flex items-center justify-center text-[10px] font-bold text-[#c9a84c]">
                      {currentUser.email?.charAt(0).toUpperCase() || 'A'}
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={loginWithGoogle} className="p-2 bg-white/5 rounded-lg text-[#c9a84c] hover:bg-white/10 transition-colors cursor-pointer">
                  <LogIn size={20} />
                </button>
              )}
              <ShieldCheck className={cn("transition-colors", currentUser ? "text-[#c9a84c]" : "text-white/20")} size={24} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
              <span className="block text-[8px] uppercase tracking-widest text-white/40 mb-1">Pending</span>
              <span className="text-lg sm:text-xl font-bold text-white">{stats.pending}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
              <span className="block text-[8px] uppercase tracking-widest text-white/40 mb-1">Active</span>
              <span className="text-lg sm:text-xl font-bold text-white">{stats.active}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
              <span className="block text-[8px] uppercase tracking-widest text-white/40 mb-1">Suspended</span>
              <span className="text-lg sm:text-xl font-bold text-white">{stats.suspended}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
              <span className="block text-[8px] uppercase tracking-widest text-white/40 mb-1">MRR</span>
              <span className="text-lg sm:text-xl font-bold text-[#c9a84c]">₹{stats.mrr.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        {(!currentUser || (currentUser.email !== 'abcnex.com@gmail.com' && currentUser.uid !== 'Q6Bw8rKstbejZXxIQf1NsOwQXZA3')) && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-amber-950 text-xs font-semibold">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle size={18} />
              </div>
              <div>
                <p className="font-bold text-sm mb-1 text-amber-900">Firestore Authorization Required</p>
                <p className="text-amber-800/80 leading-relaxed font-normal">
                  You are viewing the dashboard with client PIN access, but Firestore database writes (like the "Approve" button) require full authentication. Please Sign In with Google using your admin email (<span className="font-bold underline">abcnex.com@gmail.com</span>) to execute updates.
                </p>
              </div>
            </div>
            <button 
              onClick={loginWithGoogle}
              className="px-5 py-3 bg-[#0d0f1a] hover:bg-[#0d0f1a]/80 text-[#c9a84c] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shrink-0 shadow-sm cursor-pointer"
            >
              Sign In with Google
            </button>
          </div>
        )}

        <div className="flex bg-white border border-[#e8e4dc] rounded-2xl p-1 mb-6 overflow-x-auto scrollbar-none gap-0.5">
          {(['pending', 'active', 'all', 'referrals', 'revenue'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 min-w-[85px] sm:min-w-[100px] py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all cursor-pointer",
                activeTab === tab ? "bg-[#0d0f1a] text-white shadow-md" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab !== 'revenue' && activeTab !== 'referrals' && (
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by shop name, ID, phone..."
              className="w-full bg-white border border-[#e8e4dc] rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-[#0d0f1a] shadow-sm text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {activeTab === 'revenue' ? (
          <RevenueView shops={shops} />
        ) : activeTab === 'referrals' ? (
          <ReferralSettingsView 
            enabled={referralEnabled}
            setEnabled={setReferralEnabled}
            codesInput={referralCodesInput}
            setCodesInput={setReferralCodesInput}
            onSave={handleSaveReferrals}
            isSaving={isSavingReferral}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredShops.map(shop => (
              <ShopCard 
                key={shop.id} 
                shop={shop} 
                onApprove={handleApprove}
                onSuspend={handleSuspend}
              />
            ))}
            {filteredShops.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-400">
                <Users size={48} className="mx-auto mb-4 opacity-20" />
                <p>No shops found in this category</p>
              </div>
            )}
          </div>
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

function ShopCard({ shop, onApprove, onSuspend }: any) {
  const [plan, setPlan] = useState(shop.plan);
  const [paidUntil, setPaidUntil] = useState(shop.paidUntil?.split('T')[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [notes, setNotes] = useState(shop.adminNotes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // Billing calculation states
  const [showBilling, setShowBilling] = useState(false);

  const getInitialStartDate = () => {
    if (shop.paidUntil) {
      return shop.paidUntil.split('T')[0];
    }
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return thirtyDaysAgo.toISOString().split('T')[0];
  };

  const getInitialEndDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [billingStartDate, setBillingStartDate] = useState(getInitialStartDate());
  const [billingEndDate, setBillingEndDate] = useState(getInitialEndDate());

  const [billingRevenueOverride, setBillingRevenueOverride] = useState<string>('');
  const [billingCustomersOverride, setBillingCustomersOverride] = useState<string>('');
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loadingEarnings, setLoadingEarnings] = useState(false);

  const isExpired = shop.paidUntil && shop.status === 'active' ? new Date(shop.paidUntil).getTime() < Date.now() : false;

  useEffect(() => {
    if (showBilling) {
      setLoadingEarnings(true);
      shopService.getEarnings(shop.id)
        .then(data => {
          setEarnings(data || []);
        })
        .catch(err => {
          console.error('Failed to load earnings history:', err);
        })
        .finally(() => {
          setLoadingEarnings(false);
        });
    }
  }, [showBilling, shop.id]);

  useEffect(() => {
    // Dynamically filter and sum matching earning sheet days
    const filtered = (earnings || []).filter(earn => earn.date >= billingStartDate && earn.date <= billingEndDate);
    const sumRev = filtered.reduce((sum, earn) => sum + (earn.netRevenue || 0), 0);
    const sumCust = filtered.reduce((sum, earn) => sum + (earn.totalCustomers || 0), 0);
    setBillingRevenueOverride(String(sumRev || 0));
    setBillingCustomersOverride(String(sumCust || 0));
  }, [billingStartDate, billingEndDate, earnings]);

  const handleApproveClick = async () => {
    setIsUpdating(true);
    try {
      await onApprove(shop.id, plan, new Date(paidUntil).toISOString(), notes);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteBilling = async (totalOwed: number, method: string) => {
    setIsUpdating(true);
    try {
      const currentExp = shop.paidUntil ? new Date(shop.paidUntil) : new Date();
      const baseDate = currentExp.getTime() < Date.now() ? new Date() : currentExp;
      const nextDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      const formattedNextDate = nextDate.toISOString().split('T')[0];

      const paymentStamp = `\n[Paid ₹${totalOwed} (${method}) for period ${billingStartDate} to ${billingEndDate} on ${new Date().toLocaleDateString()} - Active until ${nextDate.toLocaleDateString()}]`;
      const updatedNotes = notes + paymentStamp;

      await onApprove(shop.id, plan, nextDate.toISOString(), updatedNotes);
      setNotes(updatedNotes);
      setPaidUntil(formattedNextDate);
      setShowBilling(false);
    } catch (err) {
      console.error('Failed to update billing payment:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const isPartnership = !!shop.wantsPartnership;
  const partnershipPct = shop.partnershipPercentage || 20;

  const ovRevenue = billingRevenueOverride !== '' ? Number(billingRevenueOverride) : 0;
  const ovCustomers = billingCustomersOverride !== '' ? Number(billingCustomersOverride) : 0;

  let calculatedBill = 0;
  let labelText = '';

  if (isPartnership) {
    calculatedBill = Math.round(ovRevenue * (partnershipPct / 100));
    labelText = `Partnership (${partnershipPct}%)`;
  } else {
    if (plan === 'advanced') {
      calculatedBill = 4999;
      labelText = 'Advanced Subscription';
    } else if (plan === 'intermediate') {
      calculatedBill = 2999;
      labelText = 'Intermediate Subscription';
    } else {
      calculatedBill = 999;
      labelText = 'Basic Subscription';
    }
  }

  return (
    <motion.div 
      layout
      className={cn(
        "bg-white border rounded-3xl p-6 shadow-sm relative overflow-hidden transition-all duration-300",
        isExpired && shop.status === 'active' 
          ? "border-red-500 bg-red-50/10 ring-2 ring-red-500/20 shadow-red-100 shadow-md" 
          : shop.status === 'pending' ? "border-amber-200 bg-amber-50/30" 
          : shop.status === 'suspended' ? "border-red-200 bg-red-50/30" 
          : "border-[#e8e4dc]"
      )}
    >
      {isExpired && shop.status === 'active' && (
        <div className="mb-4 -mx-6 -mt-6 bg-red-600 text-white text-center text-[10px] font-black py-2.5 uppercase tracking-widest flex items-center justify-center gap-1.5 animate-pulse shadow-md z-10 relative">
          <AlertCircle size={14} /> Days Are Over — Billing Required
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div className="min-w-0 pr-2">
          <h3 className="font-['Playfair_Display'] text-xl font-bold break-words">{shop.name}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-[10px] font-mono bg-[#0d0f1a] text-white px-2 py-0.5 rounded uppercase tracking-widest truncate max-w-[180px] sm:max-w-none" title={shop.id}>{shop.id}</span>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shrink-0",
              shop.status === 'active' ? "bg-green-100 text-green-700" :
              shop.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
            )}>
              {shop.status}
            </span>
          </div>
        </div>
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-dashed border-gray-200">
          <div className="text-left sm:text-right">
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Registered</div>
            <div className="text-xs font-bold font-mono mt-0.5">{new Date(shop.setupDate).toLocaleDateString()}</div>
          </div>
          {shop.wantsPartnership && (
            <div className="flex sm:flex-col items-center sm:items-end gap-1.5 mt-0 sm:mt-2">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20 rounded-md text-[8px] font-black uppercase tracking-widest">
                Partnership {shop.partnershipPercentage || 20}%
              </div>
              {shop.referralCodeUsed && (
                <div className="text-[9px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100 font-mono tracking-wide">
                  CODE: {shop.referralCodeUsed}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 border-b border-[#e8e4dc]/50 pb-5">
        <div className="flex items-center gap-2.5 text-xs text-gray-700 min-w-0">
          <Users size={15} className="text-gray-400 shrink-0" />
          <span className="truncate" title={shop.ownerName}>{shop.ownerName}</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-gray-700 min-w-0">
          <Phone size={15} className="text-gray-400 shrink-0" />
          <span className="truncate">{shop.phone}</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-gray-700 min-w-0">
          <MapPin size={15} className="text-gray-400 shrink-0" />
          <span className="truncate" title={`${shop.city}, ${shop.country}`}>{shop.city}, {shop.country}</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-gray-700 min-w-0">
          <Calendar size={15} className="text-[#c9a84c] shrink-0" />
          <span className="truncate font-semibold text-[#0d0f1a]">
            Expires: <span className="font-mono text-xs">{shop.paidUntil ? new Date(shop.paidUntil).toLocaleDateString() : '—'}</span>
          </span>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Subscription Plan</label>
          <div className="flex gap-1.5 sm:gap-2">
            {(['basic', 'intermediate', 'advanced'] as const).map(p => (
              <button
                key={p}
                disabled={shop.wantsPartnership}
                onClick={() => setPlan(p)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border transition-all cursor-pointer",
                  shop.wantsPartnership ? "bg-gray-100 text-gray-400 border-gray-100 opacity-60" :
                  plan === p ? "bg-[#0d0f1a] text-white border-[#0d0f1a]" : "bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300"
                )}
              >
                {p}
              </button>
            ))}
          </div>
          {shop.wantsPartnership && (
            <p className="text-[9px] text-[#c9a84c] font-black uppercase tracking-widest">
              💼 Active Model: PARTNERSHIP COMMISSION (Plans disabled)
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Paid Until</label>
          <input 
            type="date" 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs outline-none focus:border-[#0d0f1a]"
            value={paidUntil}
            onChange={e => setPaidUntil(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Admin Notes</label>
          <textarea 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs outline-none focus:border-[#0d0f1a] resize-none"
            rows={2}
            placeholder="Internal notes..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Dynamic Billing UI expansion panel */}
        <AnimatePresence>
          {showBilling && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 border-t border-dashed border-[#e8e4dc] overflow-hidden space-y-4"
            >
              <div className="bg-[#0b0c16] text-white border border-[#232742] rounded-2xl p-4 space-y-3.5 shadow-lg">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-[9px] uppercase font-bold text-white/55 tracking-widest flex items-center gap-1.5">
                    <Receipt size={12} className="text-[#c9a84c]" /> Billing Calculations
                  </span>
                  <span className="text-[9px] font-mono bg-[#c9a84c]/20 text-[#c9a84c] px-2 py-0.5 rounded tracking-wide font-black uppercase">
                    {labelText}
                  </span>
                </div>

                {isPartnership ? (
                  <div className="space-y-3">
                    <p className="text-[10px] text-gray-300 leading-relaxed font-sans">
                      💡 Calculated at <strong className="text-[#c9a84c]">{partnershipPct}%</strong> partnership commission.
                    </p>

                    {/* Date Range Selection for Billing Period */}
                    <div className="space-y-2 bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="text-[8px] uppercase tracking-widest text-[#c9a84c] font-black">
                        📅 Select Earning Range
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8px] uppercase tracking-wider text-white/40 block mb-1">From</label>
                          <input 
                            type="date"
                            className="w-full bg-[#13162a]/90 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white outline-none focus:border-[#c9a84c] font-mono [color-scheme:dark]"
                            value={billingStartDate}
                            onChange={e => setBillingStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[8px] uppercase tracking-wider text-white/40 block mb-1">To</label>
                          <input 
                            type="date"
                            className="w-full bg-[#13162a]/90 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white outline-none focus:border-[#c9a84c] font-mono [color-scheme:dark]"
                            value={billingEndDate}
                            onChange={e => setBillingEndDate(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <p className="text-[7.5px] uppercase text-white/30 tracking-wide block">
                        Default set from unpaid date: {shop.paidUntil ? new Date(shop.paidUntil).toLocaleDateString() : 'None'} to today
                      </p>
                    </div>

                    {loadingEarnings ? (
                      <div className="text-[10px] text-[#c9a84c]/80 animate-pulse font-bold p-2 text-center bg-white/5 rounded-xl">
                        Fetching latest earnings records from database...
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-[9px] text-[#c9a84c]/85 bg-white/5 py-1.5 px-2.5 rounded-lg border border-[#c9a84c]/10 flex items-center justify-between">
                          <span>📊 Autofetched data for range:</span>
                          <span className="font-bold underline text-white">
                            {(earnings || []).filter(earn => earn.date >= billingStartDate && earn.date <= billingEndDate).length} day(s) found
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold block mb-1">Aggregate Revenue (₹)</label>
                            <input 
                              type="number"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#c9a84c] font-mono"
                              value={billingRevenueOverride}
                              onChange={e => setBillingRevenueOverride(e.target.value)}
                              placeholder="0"
                            />
                            <span className="text-[8px] text-white/35 block mt-0.5">Edit value to override manually</span>
                          </div>
                          <div>
                            <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold block mb-1">Total Customers</label>
                            <input 
                              type="number"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#c9a84c] font-mono"
                              value={billingCustomersOverride}
                              onChange={e => setBillingCustomersOverride(e.target.value)}
                              placeholder="0"
                            />
                            <span className="text-[8px] text-white/35 block mt-0.5">Edit value to override manually</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      This shop is registered on the standard fixed-price <span className="font-bold text-[#c9a84c]">{plan.toUpperCase()}</span> subscription plan. No customer revenue percentage applied.
                    </p>
                  </div>
                )}

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center bg-gradient-to-r from-white/0 to-white/5">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest block text-white/40 font-bold">Total Bill Amount</span>
                    <span className="text-[10px] font-mono text-white/60 block mt-0.5 font-bold">
                      {isPartnership ? `₹${ovRevenue.toLocaleString()} × ${partnershipPct}%` : `Fixed Price Plan: ₹${calculatedBill}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#c9a84c] font-mono">
                      ₹{calculatedBill.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={() => handleCompleteBilling(calculatedBill, 'Cash')}
                    disabled={isUpdating}
                    className="py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <CreditCard size={12} /> Cash Received
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCompleteBilling(calculatedBill, 'Online / UPI')}
                    disabled={isUpdating}
                    className="py-2.5 bg-[#c9a84c] hover:bg-opacity-95 text-[#0d0f1a] font-bold rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <CreditCard size={12} /> UPI / Online
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-2 pt-2 w-full">
          {shop.status !== 'active' ? (
            <div className="flex gap-2 w-full">
              <button 
                onClick={handleApproveClick}
                disabled={isUpdating}
                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-green-700 transition-colors disabled:opacity-50 shadow-md active:scale-95 duration-150 cursor-pointer"
              >
                {isUpdating ? 'Working...' : 'Approve & Activate'}
              </button>
              <a 
                href={`https://wa.me/91${shop.phone}?text=Hello ${shop.ownerName}! This is BarberWallah regarding your salon registration.`}
                target="_blank"
                className="p-3 bg-green-50 text-green-600 border border-green-100 rounded-xl hover:bg-green-100 transition-colors shadow-sm shrink-0 flex items-center justify-center"
              >
                <MessageSquare size={18} />
              </a>
            </div>
          ) : (
            <div className="space-y-2 w-full">
              {/* Row 1 for Active: Billing and Save Info */}
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setShowBilling(!showBilling)}
                  className={cn(
                    "py-3 font-bold rounded-xl text-xs uppercase tracking-widest transition-all gap-1.5 flex items-center justify-center border shadow-md active:scale-95 duration-150 cursor-pointer",
                    showBilling 
                      ? "bg-[#c9a84c] text-white border-[#c9a84c]"
                      : isExpired 
                        ? "bg-red-600 hover:bg-red-700 text-white border-red-600 animate-pulse animate-duration-1000"
                        : "bg-[#0d0f1a] hover:bg-opacity-90 text-white border-[#0d0f1a]"
                  )}
                >
                  <Receipt size={14} />
                  {isExpired ? "BILL NOW!" : "Billing"}
                </button>
                
                <button 
                  onClick={handleApproveClick}
                  disabled={isUpdating}
                  className="py-3 bg-gray-50 hover:bg-gray-100 text-[#0d0f1a] border border-gray-200 font-bold rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 duration-150 cursor-pointer"
                  title="Update and save notes, plans, and/or expiration dates manually"
                >
                  Save Info
                </button>
              </div>

              {/* Row 2 for Active: Suspend and WhatsApp */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <button 
                  onClick={() => onSuspend(shop.id)}
                  className="py-3 bg-red-50 text-red-600 border border-red-100 font-bold rounded-xl text-[10px] sm:text-xs uppercase tracking-widest hover:bg-red-100 transition-colors shadow-sm active:scale-95 duration-150 cursor-pointer"
                >
                  Suspend Shop
                </button>
                <a 
                  href={`https://wa.me/91${shop.phone}?text=Hello ${shop.ownerName}! This is BarberWallah regarding your salon registration.`}
                  target="_blank"
                  className="p-3 bg-green-50 text-green-600 border border-green-100 rounded-xl hover:bg-green-100 transition-colors shadow-sm flex items-center justify-center shrink-0"
                >
                  <MessageSquare size={18} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function RevenueView({ shops }: { shops: Shop[] }) {
  const active = shops.filter(s => s.status === 'active');
  const basic = active.filter(s => s.plan === 'basic').length;
  const inter = active.filter(s => s.plan === 'intermediate').length;
  const adv = active.filter(s => s.plan === 'advanced').length;
  const mrr = basic * 999 + inter * 2999 + adv * 4999;

  const now = new Date();
  const soon = new Date(); soon.setDate(soon.getDate() + 14);
  const expiring = active.filter(s => {
    const d = new Date(s.paidUntil);
    return d >= now && d <= soon;
  }).sort((a, b) => new Date(a.paidUntil).getTime() - new Date(b.paidUntil).getTime());

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#e8e4dc] rounded-3xl p-8 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Revenue Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Basic (₹999)</span>
              <span className="font-bold">{basic} shops</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Intermediate (₹2,999)</span>
              <span className="font-bold">{inter} shops</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Advanced (₹4,999)</span>
              <span className="font-bold">{adv} shops</span>
            </div>
            <div className="h-px bg-gray-100 my-4"></div>
            <div className="flex justify-between items-end">
              <span className="text-gray-400 text-xs uppercase tracking-widest font-bold">Monthly Revenue</span>
              <span className="text-3xl font-black text-[#c9a84c]">₹{mrr.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-gray-400 text-xs uppercase tracking-widest font-bold">Annual Run Rate</span>
              <span className="text-xl font-bold text-gray-400">₹{(mrr * 12).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0d0f1a] text-white rounded-3xl p-8 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Growth Stats</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#c9a84c]">
                <TrendingUp size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold">+{shops.filter(s => new Date(s.setupDate).getMonth() === now.getMonth()).length}</div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">New Shops This Month</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-green-500">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold">{((active.length / shops.length) * 100).toFixed(1)}%</div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Conversion Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-500" /> Expiring Soon (14 Days)
        </h3>
        <div className="space-y-3">
          {expiring.map(shop => (
            <div key={shop.id} className="bg-white border border-red-100 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <div className="font-bold">{shop.name}</div>
                <div className="text-xs text-gray-400">Expires: {new Date(shop.paidUntil).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-full uppercase tracking-widest">
                  {Math.ceil((new Date(shop.paidUntil).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days left
                </span>
              </div>
            </div>
          ))}
          {expiring.length === 0 && (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400">
              No shops expiring soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReferralSettingsView({ 
  enabled, 
  setEnabled, 
  codesInput, 
  setCodesInput, 
  onSave, 
  isSaving 
}: { 
  enabled: boolean; 
  setEnabled: (e: boolean) => void; 
  codesInput: string; 
  setCodesInput: (c: string) => void; 
  onSave: () => void; 
  isSaving: boolean; 
}) {
  const [newCode, setNewCode] = useState('');
  const [newPct, setNewPct] = useState('12');

  const parsedCodes = codesInput
    .split(',')
    .map(part => part.trim())
    .filter(part => part.length > 0)
    .map(part => {
      const index = part.indexOf(':');
      if (index !== -1) {
        const code = part.substring(0, index).trim().toUpperCase();
        const pctStr = part.substring(index + 1).trim();
        const pct = pctStr ? (Number(pctStr) || 15) : 15;
        return { code, pct, isValid: !!code && !isNaN(pct) };
      } else {
        const code = part.trim().toUpperCase();
        return { code, pct: 15, isValid: !!code };
      }
    });

  const handleQuickAdd = () => {
    if (!newCode.trim()) return;
    const cleanCode = newCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const pctVal = Math.max(1, Math.min(100, Number(newPct) || 12));

    const currentParts = codesInput
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const listWithoutDup = currentParts.filter(p => {
      const idx = p.indexOf(':');
      const c = idx !== -1 ? p.substring(0, idx).trim().toUpperCase() : p.toUpperCase();
      return c !== cleanCode;
    });

    listWithoutDup.push(`${cleanCode}:${pctVal}`);
    setCodesInput(listWithoutDup.join(', '));
    setNewCode('');
    setNewPct('12');
  };

  const handleRemoveCode = (codeToRemove: string) => {
    const currentParts = codesInput
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const updated = currentParts.filter(p => {
      const idx = p.indexOf(':');
      const c = idx !== -1 ? p.substring(0, idx).trim().toUpperCase() : p.toUpperCase();
      return c !== codeToRemove.toUpperCase();
    });
    setCodesInput(updated.join(', '));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#e8e4dc] rounded-3xl p-8 shadow-sm max-w-2xl mx-auto space-y-8"
    >
      <div>
        <h3 className="font-['Playfair_Display'] text-2xl font-bold mb-2">Referral System Settings</h3>
        <p className="text-gray-400 text-sm">
          Configure valid codes that barbers can key-in during registration to lock in custom partnership rates (instead of 20%).
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl">
          <div>
            <div className="font-bold text-sm">Enable Referral Codes</div>
            <div className="text-xs text-gray-400">Allow registration form to accept referral codes</div>
          </div>
          <button 
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
              enabled ? "bg-green-600" : "bg-gray-200"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                enabled ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {/* Quick Add Form Container */}
        <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl space-y-4">
          <span className="text-[10px] uppercase font-bold text-[#c9a84c] tracking-widest block">
            Add New Referral Rule
          </span>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input 
                type="text"
                placeholder="PROMO CODE (e.g. SPECIAL12)"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#0d0f1a] font-mono"
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-32 flex border border-gray-200 rounded-xl bg-white focus-within:border-[#0d0f1a] overflow-hidden">
              <input 
                type="number"
                min="1"
                max="100"
                placeholder="Rate (%)"
                className="w-full bg-transparent px-3 py-3 text-xs outline-none font-mono text-center"
                value={newPct}
                onChange={e => setNewPct(e.target.value)}
              />
              <span className="bg-gray-50 px-2 flex items-center justify-center text-gray-400 border-l border-gray-100 select-none text-xs">
                %
              </span>
            </div>
            <button
              type="button"
              onClick={handleQuickAdd}
              className="px-5 py-3 bg-[#0d0f1a] hover:bg-opacity-90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
            >
              <Plus size={14} /> Add Pattern
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">
            Current Referral List (Editable Text)
          </label>
          <textarea
            rows={4}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-mono focus:border-[#0d0f1a] outline-none resize-none uppercase"
            placeholder="e.g. SAVE15:15, BARBER12:12, SPECIAL10:10"
            value={codesInput}
            onChange={e => setCodesInput(e.target.value)}
          />
          <p className="text-xs text-gray-400 italic">
            💡 Separate multiple codes with commas. Use the <strong>CODE:PERCENTAGE</strong> pattern (e.g. <code>SAVE12:12</code> for a 12% rate). If specified as a plain code (e.g. <code>SAVE</code>), it defaults to a 15% rate.
          </p>
        </div>

        {/* Visual parsed list */}
        {parsedCodes.length > 0 && (
          <div className="space-y-2.5">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">
              Active Referral Rates ({parsedCodes.length})
            </span>
            <div className="flex flex-wrap gap-2.5">
              {parsedCodes.map((item, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "inline-flex items-center gap-2 pl-3.5 pr-2 py-1.5 border rounded-full text-xs font-semibold shadow-sm transition-all",
                    item.isValid 
                      ? "bg-[#c9a84c]/5 border-[#c9a84c]/20 text-gray-800" 
                      : "bg-red-50 border-red-100 text-red-700"
                  )}
                >
                  <span className="font-mono tracking-wide">{item.code}</span>
                  <span className="px-1.5 py-0.5 bg-white border rounded font-mono text-[10px] text-gray-500 font-black">
                    {item.pct}%
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCode(item.code)}
                    className="w-5 h-5 rounded-full hover:bg-black/5 flex items-center justify-center text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                    title="Remove referral code"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#c9a84c]/5 border border-[#c9a84c]/20 rounded-2xl p-4 text-xs space-y-2 text-gray-700">
          <p className="font-bold text-[#c9a84c]">How it works:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>When registration is complete with a mapped code, the partnership rate is assigned instantly (e.g. 10% rate for code `VIP10:10` instead of the standard 20%).</li>
            <li>Default partnership rate without any promotional code is <span className="font-bold">20%</span>.</li>
            <li>Codes entered during registration are case-insensitive and spacing-insensitive inside the form.</li>
          </ul>
        </div>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="w-full py-4 bg-[#0d0f1a] text-white font-bold rounded-2xl text-xs uppercase tracking-widest hover:opacity-95 transition-opacity disabled:opacity-50 shadow-md"
        >
          {isSaving ? 'Saving Settings...' : 'Save Referral Settings'}
        </button>
      </div>
    </motion.div>
  );
}
