import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';
import { 
  QrCode, 
  PhoneCall, 
  Scissors, 
  ArrowRight,
  PlayCircle,
  Users,
  CheckCircle2,
  TrendingUp,
  Award,
  Smartphone
} from 'lucide-react';
import { motion } from 'motion/react';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Tutorial() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0d0f1a] text-white">
      <header className="bg-[#13162a] border-b border-white/5 p-6 sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#c9a84c] flex items-center justify-center text-[#0d0f1a]">
              <Scissors size={16} />
            </div>
            <span className="font-['Playfair_Display'] font-black tracking-tight">BarberWallah</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link to="/login" className="text-sm font-bold text-white/60 hover:text-white transition-colors">
              {t('nav.login')}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-6"
          >
            <PlayCircle size={14} /> {t('tutorial.title')}
          </motion.div>
          <h1 className="font-['Playfair_Display'] text-5xl md:text-6xl font-black mb-6 leading-tight">
            {t('tutorial.subtitle').split('3')[0]} <span className="text-[#c9a84c]">3</span> {t('tutorial.subtitle').split('3')[1]}
          </h1>
          <p className="text-white/40 text-lg leading-relaxed">
            {t('tutorial.desc')}
          </p>
        </div>

        {/* Customer Journey Section */}
        <section className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-widest">
              {t('tutorial.customerJourney')}
            </div>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

          <div className="space-y-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest mb-4 block">Step 1</span>
                <h3 className="text-3xl font-['Playfair_Display'] font-bold mb-6">{t('tutorial.customer.step1.title')}</h3>
                <p className="text-white/40 leading-relaxed mb-6">{t('tutorial.customer.step1.desc')}</p>
                <div className="p-4 bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl text-emerald-200/70 text-sm italic">
                  💡 Tip: Place your QR code at the entrance, on mirrors, and even on your WhatsApp Business profile.
                </div>
              </div>
              <div className="order-1 md:order-2 bg-[#13162a] rounded-[2.5rem] p-8 border border-white/5 flex justify-center">
                <QrCode size={120} className="text-[#c9a84c]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="bg-[#13162a] rounded-[2.5rem] p-8 border border-white/5 flex justify-center">
                <Smartphone size={120} className="text-emerald-500" />
              </div>
              <div>
                <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest mb-4 block">Step 2</span>
                <h3 className="text-3xl font-['Playfair_Display'] font-bold mb-6">{t('tutorial.customer.step2.title')}</h3>
                <p className="text-white/40 leading-relaxed mb-6">{t('tutorial.customer.step2.desc')}</p>
                <div className="p-4 bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl text-emerald-200/70 text-sm italic">
                  ✅ No OTP, no login. Just name and number — even elders can do it.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest mb-4 block">Step 3</span>
                <h3 className="text-3xl font-['Playfair_Display'] font-bold mb-6">{t('tutorial.customer.step3.title')}</h3>
                <p className="text-white/40 leading-relaxed mb-6">{t('tutorial.customer.step3.desc')}</p>
                <div className="p-4 bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl text-emerald-200/70 text-sm italic">
                  ☕ Customers can leave the shop and come back when it's almost their turn.
                </div>
              </div>
              <div className="order-1 md:order-2 bg-[#13162a] rounded-[2.5rem] p-8 border border-white/5 flex justify-center">
                <Users size={120} className="text-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="bg-[#13162a] rounded-[2.5rem] p-8 border border-white/5 flex justify-center">
                <PhoneCall size={120} className="text-green-500" />
              </div>
              <div>
                <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest mb-4 block">Step 4</span>
                <h3 className="text-3xl font-['Playfair_Display'] font-bold mb-6">{t('tutorial.customer.step4.title')}</h3>
                <p className="text-white/40 leading-relaxed mb-6">{t('tutorial.customer.step4.desc')}</p>
                <div className="p-4 bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl text-emerald-200/70 text-sm italic">
                  🌟 This premium experience keeps your customers loyal.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Barber Journey Section */}
        <section className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="px-4 py-1.5 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c] text-xs font-bold uppercase tracking-widest">
              {t('tutorial.barberJourney')}
            </div>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

          <div className="space-y-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest mb-4 block">Step 1</span>
                <h3 className="text-3xl font-['Playfair_Display'] font-bold mb-6">{t('tutorial.barber.step1.title')}</h3>
                <p className="text-white/40 leading-relaxed mb-6">{t('tutorial.barber.step1.desc')}</p>
                <div className="p-4 bg-[#c9a84c]/5 border-l-4 border-[#c9a84c] rounded-r-xl text-[#c9a84c]/70 text-sm italic">
                  📱 Bookmark the dashboard on your home screen for easy access.
                </div>
              </div>
              <div className="order-1 md:order-2 bg-[#13162a] rounded-[2.5rem] p-8 border border-white/5 flex justify-center">
                <Smartphone size={120} className="text-[#c9a84c]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="bg-[#13162a] rounded-[2.5rem] p-8 border border-white/5 flex justify-center">
                <Users size={120} className="text-indigo-500" />
              </div>
              <div>
                <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest mb-4 block">Step 2</span>
                <h3 className="text-3xl font-['Playfair_Display'] font-bold mb-6">{t('tutorial.barber.step2.title')}</h3>
                <p className="text-white/40 leading-relaxed mb-6">{t('tutorial.barber.step2.desc')}</p>
                <div className="p-4 bg-[#c9a84c]/5 border-l-4 border-[#c9a84c] rounded-r-xl text-[#c9a84c]/70 text-sm italic">
                  ✅ Walk-ins and online customers share the same fair queue.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest mb-4 block">Step 3</span>
                <h3 className="text-3xl font-['Playfair_Display'] font-bold mb-6">{t('tutorial.barber.step3.title')}</h3>
                <p className="text-white/40 leading-relaxed mb-6">{t('tutorial.barber.step3.desc')}</p>
                <div className="p-4 bg-[#c9a84c]/5 border-l-4 border-[#c9a84c] rounded-r-xl text-[#c9a84c]/70 text-sm italic">
                  ⚡ One tap. Five things happen automatically.
                </div>
              </div>
              <div className="order-1 md:order-2 bg-[#13162a] rounded-[2.5rem] p-8 border border-white/5 flex justify-center">
                <CheckCircle2 size={120} className="text-green-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="bg-[#13162a] rounded-[2.5rem] p-8 border border-white/5 flex justify-center">
                <Award size={120} className="text-[#c9a84c]" />
              </div>
              <div>
                <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest mb-4 block">Step 4</span>
                <h3 className="text-3xl font-['Playfair_Display'] font-bold mb-6">{t('tutorial.barber.step4.title')}</h3>
                <p className="text-white/40 leading-relaxed mb-6">{t('tutorial.barber.step4.desc')}</p>
                <div className="p-4 bg-[#c9a84c]/5 border-l-4 border-[#c9a84c] rounded-r-xl text-[#c9a84c]/70 text-sm italic">
                  💪 Your retention weapon. Regulars keep coming back.
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-32 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#c9a84c]/20 to-transparent blur-3xl -z-10 opacity-30"></div>
          <div className="bg-[#13162a] border border-white/5 rounded-[3rem] p-12 md:p-20 text-center overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-['Playfair_Display'] font-black mb-6">{t('tutorial.ready')}</h2>
              <p className="text-white/40 text-lg mb-12 max-w-xl mx-auto">
                {t('tutorial.join')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="px-10 py-5 bg-[#c9a84c] text-[#0d0f1a] font-black rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-[#c9a84c]/20">
                  {t('nav.register')}
                </Link>
                <Link to="/login" className="px-10 py-5 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 transition-colors border border-white/10">
                  {t('nav.login')}
                </Link>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a84c]/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 text-center text-white/20 text-xs uppercase tracking-[0.3em]">
        &copy; 2024 BARBERWALLAH TECHNOLOGY. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}
