import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scissors, ArrowRight, CheckCircle2, AlertCircle, Plus, Trash2, Clock, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { shopService } from '../services/shopService';

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  duration: number;
  selected: boolean;
}

const getCurrencySymbol = (country: string) => {
  const countryCurrencies: Record<string, string> = {
    'India': '₹',
    'USA': '$',
    'UK': '£',
    'UAE': 'AED',
    'Canada': 'CA$',
    'Australia': 'AU$',
    'Germany': '€',
    'France': '€',
    'Italy': '€',
    'Spain': '€',
    'Ireland': '€',
    'Netherlands': '€',
    'New Zealand': 'NZ$',
    'Singapore': 'SG$',
    'Saudi Arabia': 'SAR',
    'South Africa': 'R',
    'Japan': '¥',
    'Malaysia': 'RM',
    'Philippines': '₱',
    'Indonesia': 'Rp',
    'Thailand': '฿',
    'Vietnam': '₫',
    'Nepal': 'NPR',
    'Bangladesh': 'BDT',
    'Pakistan': 'PKR',
    'Sri Lanka': 'LKR',
    'Brazil': 'R$',
    'Mexico': 'MX$',
    'Switzerland': 'CHF',
    'Sweden': 'kr',
    'Norway': 'kr',
    'Denmark': 'kr',
    'Turkey': '₺',
    'Qatar': 'QAR',
    'Kuwait': 'KWD',
    'Oman': 'OMR',
    'Bahrain': 'BHD',
    'Nigeria': '₦',
    'Kenya': 'KSh',
    'Ghana': 'GH₵',
    'Egypt': 'E£'
  };
  return countryCurrencies[country] || '₹';
};

const getDefaultServices = (country: string): ServiceItem[] => {
  const isIndia = country === 'India';
  if (isIndia) {
    return [
      { id: 'def_1', name: 'Haircut', price: 150, duration: 25, selected: true },
      { id: 'def_2', name: 'Beard Grooming & Shape', price: 100, duration: 15, selected: true },
      { id: 'def_3', name: 'Shampoo & Wash', price: 80, duration: 10, selected: false },
      { id: 'def_4', name: 'Head Massage', price: 120, duration: 15, selected: false },
      { id: 'def_5', name: 'Face Scrub & Facial', price: 200, duration: 20, selected: false },
      { id: 'def_6', name: 'Hair Color (Garnier)', price: 250, duration: 30, selected: false }
    ];
  } else {
    return [
      { id: 'def_1', name: 'Classic Haircut', price: 25, duration: 25, selected: true },
      { id: 'def_2', name: 'Beard Grooming & Shave', price: 15, duration: 15, selected: true },
      { id: 'def_3', name: 'Shampoo & Wash', price: 10, duration: 10, selected: false },
      { id: 'def_4', name: 'Head Massage', price: 15, duration: 15, selected: false },
      { id: 'def_5', name: 'Face Clean up & Facial', price: 30, duration: 20, selected: false },
      { id: 'def_6', name: 'Hair Coloring', price: 45, duration: 30, selected: false }
    ];
  }
};

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shopId, setShopId] = useState('');

  const [referralConfig, setReferralConfig] = useState<{ 
    enabled: boolean; 
    validCodes: string[]; 
    codePercentages?: Record<string, number>;
  } | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [referralMessage, setReferralMessage] = useState('');
  const [isReferralValid, setIsReferralValid] = useState<boolean | null>(null);

  useEffect(() => {
    shopService.getReferralConfig().then(config => {
      setReferralConfig(config);
    });
  }, []);

  const handleReferralCodeChange = (codeVal: string) => {
    setReferralCode(codeVal);
    const cleanedCode = codeVal.trim().toUpperCase();
    if (!cleanedCode) {
      setIsReferralValid(null);
      setReferralMessage('');
      return;
    }

    if (referralConfig) {
      if (!referralConfig.enabled) {
        setIsReferralValid(false);
        setReferralMessage('Referral program is currently disabled.');
        return;
      }

      const matchingCode = referralConfig.validCodes.find(
        c => c.trim().toUpperCase() === cleanedCode
      );

      if (matchingCode) {
        setIsReferralValid(true);
        const pct = referralConfig.codePercentages?.[matchingCode] ?? 15;
        setReferralMessage(`Valid code! Your partnership rate is reduced to ${pct}%. 🎉`);
      } else {
        setIsReferralValid(false);
        setReferralMessage('Invalid referral code.');
      }
    } else {
      // Fallback if not loaded yet
      setIsReferralValid(null);
      setReferralMessage('');
    }
  };

  const getActivePercentage = () => {
    if (isReferralValid && referralConfig) {
      const matchingCode = referralConfig.validCodes.find(
        c => c.trim().toUpperCase() === referralCode.trim().toUpperCase()
      );
      if (matchingCode) {
        return referralConfig.codePercentages?.[matchingCode] ?? 15;
      }
    }
    return 15;
  };

  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    phone: '',
    city: '',
    country: 'India',
    email: '',
    password: '',
    confirmPassword: '',
    maxWaitingCapacity: '5',
    wantsPartnership: false
  });

  const [customCountryName, setCustomCountryName] = useState('');
  const [customCurrencySymbol, setCustomCurrencySymbol] = useState('$');

  const getDisplayCurrency = () => {
    if (formData.country === 'Other') {
      return customCurrencySymbol.trim() || '$';
    }
    return getCurrencySymbol(formData.country);
  };

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState('');
  const [customServiceDuration, setCustomServiceDuration] = useState('20');

  useEffect(() => {
    setServices(getDefaultServices(formData.country));
  }, [formData.country]);

  const handleToggleService = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  const handleUpdatePrice = (id: string, newPrice: number) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, price: Math.max(0, newPrice) } : s));
  };

  const handleUpdateDuration = (id: string, newDuration: number) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, duration: Math.max(1, newDuration) } : s));
  };

  const handleAddCustomService = () => {
    if (!customServiceName.trim()) return;
    const priceVal = Number(customServicePrice) || 0;
    const durVal = Number(customServiceDuration) || 20;
    const newItem: ServiceItem = {
      id: 'custom_' + Date.now(),
      name: customServiceName.trim(),
      price: priceVal,
      duration: durVal,
      selected: true
    };
    setServices(prev => [...prev, newItem]);
    setCustomServiceName('');
    setCustomServicePrice('');
    setCustomServiceDuration('20');
  };

  const handleRemoveCustom = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.ownerName || !formData.phone || !formData.city || !formData.country || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (referralCode.trim() !== '' && !isReferralValid) {
      setError('The entered referral code is invalid. Please clear it or enter a valid code.');
      return;
    }

    const activeServices = services.filter(s => s.selected);
    if (activeServices.length === 0) {
      setError('Please select or add at least one service that your salon offers.');
      return;
    }

    setLoading(true);
    try {
      const wantsPartnership = formData.wantsPartnership || !!isReferralValid;
      let partnershipPercentage = undefined;
      if (wantsPartnership) {
        if (isReferralValid) {
          const matchingCode = referralConfig?.validCodes.find(
            c => c.trim().toUpperCase() === referralCode.trim().toUpperCase()
          );
          partnershipPercentage = (matchingCode && referralConfig?.codePercentages?.[matchingCode]) ?? 15;
        } else {
          partnershipPercentage = 20;
        }
      }

      const finalCountry = formData.country === 'Other' ? (customCountryName.trim() || 'Other') : formData.country;
      const finalCurrency = formData.country === 'Other' ? (customCurrencySymbol.trim() || '$') : getCurrencySymbol(formData.country);

      const id = await shopService.registerShop({
        name: formData.name,
        ownerName: formData.ownerName,
        phone: formData.phone,
        city: formData.city,
        country: finalCountry,
        currency: finalCurrency,
        email: formData.email,
        password: formData.password,
        maxWaitingCapacity: Number(formData.maxWaitingCapacity),
        wantsPartnership,
        referralCodeUsed: isReferralValid ? referralCode.trim().toUpperCase() : undefined,
        partnershipPercentage
      });

      // Save setup services with unique IDs
      let order = 0;
      for (const s of activeServices) {
        const uniqueSvcId = `SVC_${Date.now()}_${order}`;
        await shopService.saveService(id, {
          id: uniqueSvcId,
          name: s.name,
          price: Number(s.price) || 0,
          duration: Number(s.duration) || 20,
          active: true,
          sortOrder: order++
        });
      }

      setShopId(id);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0d0f1a] text-white flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#13162a] border border-white/5 rounded-3xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="font-['Playfair_Display'] text-3xl font-bold mb-4">Registration Submitted!</h2>
          <p className="text-white/50 mb-8 leading-relaxed">
            BarberWallah will review your request and approve within 24 hours. Save your Shop ID below — you'll need it to access your dashboard.
          </p>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 overflow-hidden">
            <span className="block text-[10px] uppercase tracking-widest text-[#c9a84c] mb-2">Your Shop ID</span>
            <span className="text-xl md:text-3xl font-['Playfair_Display'] font-black tracking-widest break-all block selection:bg-[#c9a84c] selection:text-[#0d0f1a]">{shopId}</span>
          </div>

          <p className="text-xs text-white/30 mb-8 italic">
            ⚠️ Screenshot this ID. You'll enter it every time you open your dashboard.
          </p>

          <a 
            href={`https://wa.me/918454015157?text=Hello BarberWallah! I just registered my salon. Shop: ${formData.name}, ID: ${shopId}. Please approve.`}
            target="_blank"
            className="w-full py-4 bg-[#25D366] text-white font-bold rounded-xl flex items-center justify-center gap-2 mb-4"
          >
            WhatsApp Us to Speed Up
          </a>
          
          <Link to="/login" className="text-white/40 text-sm hover:text-white transition-colors">
            Back to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f1a] text-white py-20 px-6 relative">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <div className="max-w-md mx-auto relative z-10">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#e8c96a] flex items-center justify-center text-[#0d0f1a]">
              <Scissors size={20} />
            </div>
            <span className="font-['Playfair_Display'] text-xl font-black bg-gradient-to-r from-[#c9a84c] to-[#e8c96a] bg-clip-text text-transparent">
              BarberWallah
            </span>
          </Link>
          <h1 className="font-['Playfair_Display'] text-4xl font-bold mb-3">Register Your Salon</h1>
          <p className="text-white/40 text-sm">Submit your details. We'll approve within 24 hours.</p>
        </div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-[#13162a] border border-white/5 rounded-3xl p-8 space-y-6"
        >
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-semibold">Shop Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Raja Hair Salon"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-[#c9a84c] outline-none transition-colors"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-semibold">Owner Name</label>
            <input 
              type="text" 
              required
              placeholder="Your full name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-[#c9a84c] outline-none transition-colors"
              value={formData.ownerName}
              onChange={e => setFormData({...formData, ownerName: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-semibold">Country</label>
              <select 
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#c9a84c] outline-none transition-colors appearance-none"
                value={formData.country}
                onChange={e => setFormData({...formData, country: e.target.value})}
              >
                {/* Popular countries list */}
                <option value="India" className="bg-[#13162a]">India</option>
                <option value="USA" className="bg-[#13162a]">USA</option>
                <option value="UK" className="bg-[#13162a]">UK</option>
                <option value="UAE" className="bg-[#13162a]">UAE</option>
                <option value="Canada" className="bg-[#13162a]">Canada</option>
                <option value="Australia" className="bg-[#13162a]">Australia</option>
                {/* Separator */}
                <option disabled className="bg-[#13162a] text-white/30">------------------</option>
                {/* Rest of countries alphabetically */}
                <option value="Bahrain" className="bg-[#13162a]">Bahrain</option>
                <option value="Bangladesh" className="bg-[#13162a]">Bangladesh</option>
                <option value="Brazil" className="bg-[#13162a]">Brazil</option>
                <option value="Denmark" className="bg-[#13162a]">Denmark</option>
                <option value="Egypt" className="bg-[#13162a]">Egypt</option>
                <option value="France" className="bg-[#13162a]">France</option>
                <option value="Germany" className="bg-[#13162a]">Germany</option>
                <option value="Ghana" className="bg-[#13162a]">Ghana</option>
                <option value="Indonesia" className="bg-[#13162a]">Indonesia</option>
                <option value="Ireland" className="bg-[#13162a]">Ireland</option>
                <option value="Italy" className="bg-[#13162a]">Italy</option>
                <option value="Japan" className="bg-[#13162a]">Japan</option>
                <option value="Kenya" className="bg-[#13162a]">Kenya</option>
                <option value="Kuwait" className="bg-[#13162a]">Kuwait</option>
                <option value="Malaysia" className="bg-[#13162a]">Malaysia</option>
                <option value="Mexico" className="bg-[#13162a]">Mexico</option>
                <option value="Nepal" className="bg-[#13162a]">Nepal</option>
                <option value="Netherlands" className="bg-[#13162a]">Netherlands</option>
                <option value="New Zealand" className="bg-[#13162a]">New Zealand</option>
                <option value="Nigeria" className="bg-[#13162a]">Nigeria</option>
                <option value="Norway" className="bg-[#13162a]">Norway</option>
                <option value="Oman" className="bg-[#13162a]">Oman</option>
                <option value="Pakistan" className="bg-[#13162a]">Pakistan</option>
                <option value="Philippines" className="bg-[#13162a]">Philippines</option>
                <option value="Qatar" className="bg-[#13162a]">Qatar</option>
                <option value="Saudi Arabia" className="bg-[#13162a]">Saudi Arabia</option>
                <option value="Singapore" className="bg-[#13162a]">Singapore</option>
                <option value="South Africa" className="bg-[#13162a]">South Africa</option>
                <option value="Spain" className="bg-[#13162a]">Spain</option>
                <option value="Sri Lanka" className="bg-[#13162a]">Sri Lanka</option>
                <option value="Sweden" className="bg-[#13162a]">Sweden</option>
                <option value="Switzerland" className="bg-[#13162a]">Switzerland</option>
                <option value="Thailand" className="bg-[#13162a]">Thailand</option>
                <option value="Turkey" className="bg-[#13162a]">Turkey</option>
                <option value="Vietnam" className="bg-[#13162a]">Vietnam</option>
                {/* Option for custom input */}
                <option value="Other" className="bg-[#13162a] font-bold text-[#c9a84c]">Other (Custom)...</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-semibold">City</label>
              <input 
                type="text" 
                required
                placeholder="Mumbai"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-[#c9a84c] outline-none transition-colors"
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
              />
            </div>
          </div>

          {formData.country === 'Other' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-[#c9a84c]/20 bg-[#c9a84c]/5"
            >
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-[#c9a84c] font-bold block">Custom Country Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Greece"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:border-[#c9a84c] outline-none transition-colors"
                  value={customCountryName}
                  onChange={e => setCustomCountryName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-[#c9a84c] font-bold block">Currency Symbol</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. € or €"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:border-[#c9a84c] outline-none transition-colors font-mono"
                  value={customCurrencySymbol}
                  onChange={e => setCustomCurrencySymbol(e.target.value)}
                />
              </div>
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-semibold">WhatsApp</label>
            <input 
              type="tel" 
              required
              maxLength={10}
              placeholder="10 digits"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-[#c9a84c] outline-none transition-colors font-mono"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-semibold">Password</label>
            <input 
              type="password" 
              required
              placeholder="Min 4 characters"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-[#c9a84c] outline-none transition-colors"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-semibold">Confirm Password</label>
            <input 
              type="password" 
              required
              placeholder="Re-enter password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-[#c9a84c] outline-none transition-colors"
              value={formData.confirmPassword}
              onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-semibold">Max Waiting Capacity (Seats)</label>
            <input 
              type="number" 
              required
              min="1"
              max="50"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-[#c9a84c] outline-none transition-colors font-mono"
              value={formData.maxWaitingCapacity}
              onChange={e => setFormData({...formData, maxWaitingCapacity: e.target.value})}
            />
          </div>

          {/* Services Configuration Section */}
          <div className="space-y-4 border-t border-white/5 pt-6">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-black block">
                Configure Services Offered
              </label>
              <p className="text-white/40 text-[11px] mt-0.5 leading-relaxed">
                Check default services below and specify your price, or add completely custom items.
              </p>
            </div>

            <div className="space-y-3">
              {services.map(svc => (
                <div 
                  key={svc.id}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 ${
                    svc.selected 
                      ? 'bg-white/[0.04] border-[#c9a84c]/30 shadow-md shadow-[#c9a84c]/5' 
                      : 'bg-white/[0.01] border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleService(svc.id)}
                      className="flex items-center gap-3 text-left flex-1"
                    >
                      <div className={`w-5 h-5 rounded-lg border transition-all flex items-center justify-center shrink-0 ${
                        svc.selected 
                          ? 'bg-[#c9a84c] border-[#c9a84c] text-[#0d0f1a]' 
                          : 'border-white/20 hover:border-white/40'
                      }`}>
                        {svc.selected && <Check size={14} className="stroke-[3]" />}
                      </div>
                      <div>
                        <span className={`text-sm font-semibold transition-colors ${svc.selected ? 'text-white' : 'text-white/50'}`}>
                          {svc.name}
                        </span>
                        {!svc.selected && (
                          <span className="text-[10px] text-white/30 block">Click to select/offer service</span>
                        )}
                      </div>
                    </button>

                    {svc.id.startsWith('custom_') && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCustom(svc.id)}
                        className="text-white/30 hover:text-red-400 p-1 rounded-lg hover:bg-white/5 transition-all"
                        title="Remove service"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {svc.selected && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-3"
                    >
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold block mb-1">
                          Price ({getDisplayCurrency()})
                        </label>
                        <div className="flex border border-white/10 rounded-xl bg-white/5 focus-within:border-[#c9a84c] transition-colors overflow-hidden">
                          <span className="bg-white/5 px-2.5 py-1.5 text-white/40 text-xs font-mono flex items-center justify-center border-r border-white/5 shrink-0 select-none">
                            {getDisplayCurrency()}
                          </span>
                          <input 
                            type="number"
                            min="0"
                            required
                            className="w-full bg-transparent px-3 py-1.5 text-xs text-white font-mono outline-none"
                            value={svc.price === 0 ? '' : svc.price}
                            placeholder="Price"
                            onChange={e => handleUpdatePrice(svc.id, Number(e.target.value))}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold block mb-1">
                          Duration (min)
                        </label>
                        <div className="flex border border-white/10 rounded-xl bg-white/5 focus-within:border-[#c9a84c] transition-colors overflow-hidden">
                          <span className="bg-white/5 px-2.5 py-1.5 text-white/40 flex items-center justify-center border-r border-white/5 shrink-0 select-none">
                            <Clock size={13} />
                          </span>
                          <input 
                            type="number"
                            min="1"
                            required
                            className="w-full bg-transparent px-3 py-1.5 text-xs text-white font-mono outline-none"
                            value={svc.duration}
                            placeholder="Mins"
                            onChange={e => handleUpdateDuration(svc.id, Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Custom Service Inline container */}
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
              <span className="text-[10px] uppercase font-bold text-[#c9a84c] tracking-widest block">
                + Add Custom Service
              </span>
              
              <div className="space-y-2">
                <input 
                  type="text"
                  placeholder="e.g. Hair Detan or Shave Spa"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/20 focus:border-[#c9a84c] outline-none"
                  value={customServiceName}
                  onChange={e => setCustomServiceName(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex border border-white/10 rounded-xl bg-white/5 focus-within:border-[#c9a84c] transition-colors overflow-hidden">
                    <span className="bg-white/5 px-2.5 py-2 text-white/40 text-xs font-mono flex items-center justify-center border-r border-white/5 shrink-0 select-none">
                      {getDisplayCurrency()}
                    </span>
                    <input 
                      type="number"
                      placeholder="Price"
                      className="w-full bg-transparent px-3 py-2 text-xs text-white font-mono outline-none"
                      value={customServicePrice}
                      onChange={e => setCustomServicePrice(e.target.value)}
                    />
                  </div>

                  <div className="flex border border-white/10 rounded-xl bg-white/5 focus-within:border-[#c9a84c] transition-colors overflow-hidden">
                    <span className="bg-white/5 px-2.5 py-2 text-white/40 flex items-center justify-center border-r border-white/5 shrink-0 select-none">
                      <Clock size={13} />
                    </span>
                    <input 
                      type="number"
                      placeholder="Duration (m)"
                      className="w-full bg-transparent px-3 py-2 text-xs text-white font-mono outline-none"
                      value={customServiceDuration}
                      onChange={e => setCustomServiceDuration(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomService}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-xs font-bold text-[#c9a84c] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                >
                  <Plus size={14} /> Add to list
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-[#c9a84c]/5 border border-[#c9a84c]/10 rounded-xl">
            <div className="flex items-center h-5">
              <input
                id="partnership"
                name="partnership"
                type="checkbox"
                className="h-4 w-4 rounded border-white/10 bg-white/5 text-[#c9a84c] focus:ring-[#c9a84c] focus:ring-offset-[#0d0f1a]"
                checked={formData.wantsPartnership || !!isReferralValid}
                disabled={!!isReferralValid}
                onChange={e => setFormData({...formData, wantsPartnership: e.target.checked})}
              />
            </div>
            <div className="text-sm">
              <label htmlFor="partnership" className="font-bold text-[#c9a84c] cursor-pointer">
                {isReferralValid ? `Avail ${getActivePercentage()}% partnership (Referral Active!)` : 'Avail 20% partnership'}
              </label>
              <p className="text-white/40 text-xs mt-1">
                {isReferralValid 
                  ? `Your referral code automatically joins you as a partner with a discounted ${getActivePercentage()}% fee.` 
                  : 'Partner with us and get exclusive benefits and feature releases.'}
              </p>
            </div>
          </div>

          {referralConfig?.enabled !== false && (
            <div className="space-y-2 p-4 bg-white/5 border border-white/10 rounded-xl">
              <label className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-semibold block">
                Have a Referral Code?
              </label>
              <input 
                type="text" 
                placeholder="e.g. BARBER15"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:border-[#c9a84c] outline-none transition-colors uppercase font-mono text-sm"
                value={referralCode}
                onChange={e => handleReferralCodeChange(e.target.value)}
              />
              {referralMessage && (
                <p className={`text-xs mt-1 font-medium ${isReferralValid ? "text-green-400" : "text-amber-400"}`}>
                  {referralMessage}
                </p>
              )}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#c9a84c] to-[#e8c96a] text-[#0d0f1a] font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Registration'} <ArrowRight size={20} />
          </button>

          <div className="text-center">
            <span className="text-white/30 text-sm">Already registered? </span>
            <Link to="/login" className="text-[#c9a84c] text-sm font-semibold hover:underline">Login here</Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
