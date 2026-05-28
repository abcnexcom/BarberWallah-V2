import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  QrCode, 
  Scissors, 
  Award, 
  PhoneCall,
  Download,
  Copy,
  Check,
  Palette,
  Lock,
  Settings,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { QRCodeCanvas } from 'qrcode.react';
import { shopService } from '../services/shopService';
import { Service, ShopConfig, Shop } from '../types';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/LanguageContext';

export default function BarberSettings() {
  const { t } = useLanguage();
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [config, setConfig] = useState<ShopConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'services' | 'loyalty' | 'notifications' | 'qr' | 'branding'>('general');
  const [copied, setCopied] = useState(false);

  // New service form
  const [newSvc, setNewSvc] = useState({ name: '', price: '', duration: '' });

  useEffect(() => {
    if (!shopId) return;
    const loadData = async () => {
      try {
        const [shopData, servicesData, configData] = await Promise.all([
          shopService.getShop(shopId),
          shopService.getServices(shopId),
          shopService.getConfig(shopId)
        ]);
        setShop(shopData);
        setServices(servicesData);
        setConfig(configData);
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [shopId]);

  const handleAddService = async (e: FormEvent) => {
    e.preventDefault();
    if (!shopId || !newSvc.name || !newSvc.price) return;
    try {
      await shopService.saveService(shopId, {
        name: newSvc.name,
        price: Number(newSvc.price),
        duration: Number(newSvc.duration) || 20,
        sortOrder: services.length
      });
      const updated = await shopService.getServices(shopId);
      setServices(updated);
      setNewSvc({ name: '', price: '', duration: '' });
    } catch (err) {
      console.error('Error saving service:', err);
    }
  };

  const handleDeleteService = async (svcId: string) => {
    if (!shopId || !window.confirm('Remove this service?')) return;
    try {
      await shopService.saveService(shopId, { id: svcId, active: false });
      setServices(services.filter(s => s.id !== svcId));
    } catch (err) {
      console.error('Error deleting service:', err);
    }
  };

  const handleSaveConfig = async () => {
    if (!shopId || !config || saving) return;
    setSaving(true);
    try {
      await shopService.saveConfig(shopId, config);
      showToast(t('settings.saveSuccess'));
    } catch (err: any) {
      console.error('Error saving config:', err);
      showToast('Error saving settings: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const customerUrl = `${window.location.origin}/shop/${shopId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(customerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const canvas = document.querySelector('#shop-qr canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `qr-${shopId}.png`;
    link.href = url;
    link.click();
  };

  const printQR = () => {
    const canvas = document.querySelector('#shop-qr canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${shop?.name}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
            img { width: 300px; height: 300px; margin-bottom: 20px; }
            h1 { margin: 0; }
            p { color: #666; }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <img src="${url}" />
          <h1>${shop?.name}</h1>
          <p>Scan to join the queue</p>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#0d0f1a] pb-20">
      <header className="bg-[#1a1a2e] text-white p-6 sticky top-0 z-30 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link to={`/barber/${shopId}`} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-['Playfair_Display'] text-xl font-bold">Shop Settings</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Toast Notif */}
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              "fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2 text-sm font-bold",
              toast.type === 'success' ? "bg-green-600 text-white" : "bg-red-600 text-white"
            )}
          >
            {toast.type === 'success' ? <Check size={18} /> : <span>⚠️</span>}
            {toast.message}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex bg-white border border-[#e8e4dc] rounded-2xl p-1 mb-8 overflow-x-auto no-scrollbar">
          {(['general', 'services', 'loyalty', 'notifications', 'qr', 'branding'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === tab ? "bg-[#1a1a2e] text-white" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {tab === 'notifications' ? 'Alerts' : tab}
            </button>
          ))}
        </div>

        {/* General Tab */}
        {activeTab === 'general' && config && (
          <div className="space-y-6">
            <div className="bg-white border border-[#e8e4dc] rounded-3xl p-6 shadow-sm">
              <h2 className="font-['Playfair_Display'] text-xl font-bold mb-6 flex items-center gap-2">
                <Settings size={20} className="text-[#c9a84c]" /> {t('nav.general')}
              </h2>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">{t('settings.avgService')}</label>
                    <span className="text-2xl font-['Playfair_Display'] font-black">{config.avgServiceMin}m</span>
                  </div>
                  <input 
                    type="range" min="5" max="120" step="5"
                    className="w-full accent-[#1a1a2e]"
                    value={config.avgServiceMin}
                    onChange={e => setConfig({...config, avgServiceMin: Number(e.target.value)})}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">{t('common.maxCapacity')}</label>
                    <span className="text-2xl font-['Playfair_Display'] font-black">{config.maxWaitingCapacity || 0}</span>
                  </div>
                  <input 
                    type="range" min="0" max="50" 
                    className="w-full accent-[#1a1a2e]"
                    value={config.maxWaitingCapacity || 0}
                    onChange={e => setConfig({...config, maxWaitingCapacity: Number(e.target.value)})}
                  />
                  <p className="text-[10px] text-gray-400">{t('common.maxCapacityDesc') || 'Set to 0 for unlimited capacity. This will be shown to customers.'}</p>
                </div>

                <button 
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="w-full py-4 bg-[#1a1a2e] text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} /> {saving ? 'Saving...' : t('common.saveSettings') || 'Save General Settings'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#e8e4dc] rounded-3xl p-6 shadow-sm">
              <h2 className="font-['Playfair_Display'] text-xl font-bold mb-6 flex items-center gap-2">
                <Scissors size={20} className="text-[#c9a84c]" /> Your Services
              </h2>
              
              <div className="space-y-4 mb-8">
                {services.map(svc => (
                  <div key={svc.id} className="flex items-center justify-between p-4 bg-[#f7f5f0] rounded-2xl border border-[#e8e4dc]">
                    <div>
                      <h3 className="font-bold">{svc.name}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">₹{svc.price} · {svc.duration} min</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteService(svc.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddService} className="pt-6 border-t border-dashed border-[#e8e4dc] space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Add New Service</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    type="text" 
                    placeholder="Service Name" 
                    className="bg-[#f7f5f0] border border-[#e8e4dc] rounded-xl px-4 py-3 outline-none focus:border-[#1a1a2e]"
                    value={newSvc.name}
                    onChange={e => setNewSvc({...newSvc, name: e.target.value})}
                  />
                  <input 
                    type="number" 
                    placeholder="Price (₹)" 
                    className="bg-[#f7f5f0] border border-[#e8e4dc] rounded-xl px-4 py-3 outline-none focus:border-[#1a1a2e]"
                    value={newSvc.price}
                    onChange={e => setNewSvc({...newSvc, price: e.target.value})}
                  />
                  <input 
                    type="number" 
                    placeholder="Duration (min)" 
                    className="bg-[#f7f5f0] border border-[#e8e4dc] rounded-xl px-4 py-3 outline-none focus:border-[#1a1a2e]"
                    value={newSvc.duration}
                    onChange={e => setNewSvc({...newSvc, duration: e.target.value})}
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-[#1a1a2e] text-white font-bold rounded-xl flex items-center justify-center gap-2">
                  <Plus size={18} /> Add Service
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Loyalty Tab */}
        {activeTab === 'loyalty' && config && (
          <div className="space-y-6">
            <div className="bg-white border border-[#e8e4dc] rounded-3xl p-6 shadow-sm">
              <h2 className="font-['Playfair_Display'] text-xl font-bold mb-6 flex items-center gap-2">
                <Award size={20} className="text-[#c9a84c]" /> Loyalty Program
              </h2>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Visits to earn reward</label>
                    <span className="text-2xl font-['Playfair_Display'] font-black">{config.loyaltyThreshold}</span>
                  </div>
                  <input 
                    type="range" min="5" max="20" 
                    className="w-full accent-[#1a1a2e]"
                    value={config.loyaltyThreshold}
                    onChange={e => setConfig({...config, loyaltyThreshold: Number(e.target.value)})}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Discount Percentage</label>
                    <span className="text-2xl font-['Playfair_Display'] font-black">{config.loyaltyDiscountPct}%</span>
                  </div>
                  <input 
                    type="range" min="5" max="50" step="5"
                    className="w-full accent-[#1a1a2e]"
                    value={config.loyaltyDiscountPct}
                    onChange={e => setConfig({...config, loyaltyDiscountPct: Number(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Streak Window (Days)</label>
                  <input 
                    type="number" 
                    className="w-full bg-[#f7f5f0] border border-[#e8e4dc] rounded-xl px-4 py-3 outline-none focus:border-[#1a1a2e]"
                    value={config.streakWindowDays}
                    onChange={e => setConfig({...config, streakWindowDays: Number(e.target.value)})}
                  />
                  <p className="text-[10px] text-gray-400">If customer doesn't visit within this many days, streak resets to 0.</p>
                </div>

                <button 
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="w-full py-4 bg-[#1a1a2e] text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} /> {saving ? 'Saving...' : 'Save Loyalty Settings'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Tab */}
        {activeTab === 'qr' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#e8e4dc] rounded-3xl p-8 shadow-sm text-center">
              <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-2">{shop?.name}</h2>
              <p className="text-gray-400 text-sm mb-8">Scan to join the queue — no app needed</p>
              
              <div id="shop-qr" className="inline-block p-6 bg-white border-8 border-[#1a1a2e] rounded-3xl mb-8">
                <QRCodeCanvas 
                  value={customerUrl} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#f7f5f0] border border-[#e8e4dc] rounded-2xl flex items-center justify-between gap-4">
                  <span className="text-xs font-mono text-gray-500 truncate">{customerUrl}</span>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 bg-white border border-[#e8e4dc] rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button 
                    onClick={downloadQR}
                    className="py-4 bg-[#1a1a2e] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <Download size={18} /> Download Image
                  </button>
                  <button 
                    onClick={printQR} 
                    className="py-4 bg-[#c9a84c] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <QrCode size={18} /> Print QR Code
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a2e] text-white p-6 rounded-3xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Where to use this QR</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]"></div> Print and stick at shop entrance</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]"></div> Share on WhatsApp broadcast to regulars</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]"></div> Add to Instagram bio link</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]"></div> Add to Google Maps profile</li>
              </ul>
            </div>
          </div>
        )}

        {/* Notifications (Calls & WhatsApp) Tab */}
        {activeTab === 'notifications' && config && (
          <div className="space-y-6">
            <div className="bg-white border border-[#e8e4dc] rounded-3xl p-6 shadow-sm">
              <h2 className="font-['Playfair_Display'] text-xl font-bold mb-6 flex items-center gap-2">
                <PhoneCall size={20} className="text-[#c9a84c]" /> Automated Calls (Exotel)
              </h2>

              <div className="space-y-6">
                {(!config.exotelSid || !config.exotelToken) && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
                    <PhoneCall size={18} />
                    <span>Exotel not configured — calls will be made manually.</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Account SID</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#f7f5f0] border border-[#e8e4dc] rounded-xl px-4 py-3 outline-none focus:border-[#1a1a2e]"
                      value={config.exotelSid || ''}
                      onChange={e => setConfig({...config, exotelSid: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">API Token</label>
                    <input 
                      type="password" 
                      className="w-full bg-[#f7f5f0] border border-[#e8e4dc] rounded-xl px-4 py-3 outline-none focus:border-[#1a1a2e]"
                      value={config.exotelToken || ''}
                      onChange={e => setConfig({...config, exotelToken: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Caller ID (Virtual No)</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#f7f5f0] border border-[#e8e4dc] rounded-xl px-4 py-3 outline-none focus:border-[#1a1a2e]"
                      value={config.exotelCallerId || ''}
                      onChange={e => setConfig({...config, exotelCallerId: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#e8e4dc] rounded-3xl p-6 shadow-sm">
              <h2 className="font-['Playfair_Display'] text-xl font-bold mb-6 flex items-center gap-2">
                <HelpCircle size={20} className="text-[#25D366]" /> WhatsApp Notifications
              </h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[#25D366]/5 border border-[#25D366]/20 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                      <HelpCircle size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Enable WhatsApp Alerts</p>
                      <p className="text-[10px] text-gray-400">Send confirmation when joining queue</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={config.enableWhatsApp || false}
                      onChange={e => setConfig({...config, enableWhatsApp: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Admin WhatsApp Number (for start)</label>
                    <input 
                      type="text" 
                      placeholder="+919876543210"
                      className="w-full bg-[#f7f5f0] border border-[#e8e4dc] rounded-xl px-4 py-3 outline-none focus:border-[#1a1a2e]"
                      value={config.ownerWhatsApp || ''}
                      onChange={e => setConfig({...config, ownerWhatsApp: e.target.value})}
                    />
                    <p className="text-[10px] text-gray-400 italic">All notifications will be sent to this number for testing purpose as requested.</p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">WhatsApp API Key (Optional for automation)</label>
                    <input 
                      type="password" 
                      placeholder="Enter API key for automated messages"
                      className="w-full bg-[#f7f5f0] border border-[#e8e4dc] rounded-xl px-4 py-3 outline-none focus:border-[#1a1a2e]"
                      value={config.whatsappApiKey || ''}
                      onChange={e => setConfig({...config, whatsappApiKey: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="w-full py-4 bg-[#1a1a2e] text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} /> {saving ? 'Saving...' : 'Save Notification Settings'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Branding Tab (Advanced only) */}
        {activeTab === 'branding' && shop && (
          <div className="space-y-6">
            <div className="bg-white border border-[#e8e4dc] rounded-3xl p-6 shadow-sm">
              <h2 className="font-['Playfair_Display'] text-xl font-bold mb-6 flex items-center gap-2">
                <Palette size={20} className="text-[#c9a84c]" /> Custom Branding
              </h2>
              {shop.plan !== 'advanced' ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Lock size={32} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Advanced Plan Required</p>
                  <p className="text-xs text-gray-400 mt-2">Upgrade to unlock custom colors and logo.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Primary Brand Color</label>
                    <div className="flex gap-4 items-center">
                      <input 
                        type="color" 
                        className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                        value={shop.primaryColor || '#1a1a2e'}
                        onChange={e => setShop({...shop, primaryColor: e.target.value})}
                      />
                      <input 
                        type="text" 
                        className="flex-1 bg-[#f7f5f0] border border-[#e8e4dc] rounded-xl px-4 py-3 outline-none focus:border-[#1a1a2e] font-mono"
                        value={shop.primaryColor || '#1a1a2e'}
                        onChange={e => setShop({...shop, primaryColor: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Logo URL</label>
                    <input 
                      type="url" 
                      placeholder="https://example.com/logo.png"
                      className="w-full bg-[#f7f5f0] border border-[#e8e4dc] rounded-xl px-4 py-3 outline-none focus:border-[#1a1a2e]"
                      value={shop.logoUrl || ''}
                      onChange={e => setShop({...shop, logoUrl: e.target.value})}
                    />
                    <p className="text-[10px] text-gray-400">Provide a direct link to your salon logo image.</p>
                  </div>

                  {shop.logoUrl && (
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
                      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4">Preview</span>
                      <img 
                        src={shop.logoUrl} 
                        alt="Logo Preview" 
                        className="w-20 h-20 object-cover rounded-xl shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <button 
                    onClick={async () => {
                      try {
                        await shopService.updateShop(shop.id, { 
                          primaryColor: shop.primaryColor, 
                          logoUrl: shop.logoUrl 
                        });
                        setToast({ message: 'Branding updated successfully!', type: 'success' });
                        setTimeout(() => setToast(null), 3000);
                      } catch (err: any) {
                        setToast({ message: err.message || 'Failed to update branding', type: 'error' });
                        setTimeout(() => setToast(null), 4000);
                      }
                    }}
                    className="w-full py-4 bg-[#1a1a2e] text-white font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    <Save size={18} /> Save Branding
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
