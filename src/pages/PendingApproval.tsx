import { Link } from 'react-router-dom';
import { Clock, MessageSquare, Phone } from 'lucide-react';
import { motion } from 'motion/react';

export default function PendingApproval() {
  return (
    <div className="min-h-screen bg-[#0d0f1a] text-white flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#13162a] border border-white/5 rounded-[2.5rem] p-10 text-center shadow-2xl"
      >
        <div className="w-24 h-24 bg-[#c9a84c]/10 text-[#c9a84c] rounded-full flex items-center justify-center mx-auto mb-8">
          <Clock size={48} className="animate-pulse" />
        </div>
        
        <h1 className="font-['Playfair_Display'] text-3xl font-black mb-4">Approval Pending</h1>
        <p className="text-white/50 mb-10 leading-relaxed">
          Your registration is being reviewed by our team. We usually approve new salons within 24 hours.
        </p>

        <div className="space-y-4">
          <a 
            href="https://wa.me/918454015157" 
            target="_blank"
            className="w-full py-4 bg-[#25D366] text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
          >
            <MessageSquare size={20} /> WhatsApp BarberWallah
          </a>
          
          <a 
            href="tel:8454015157"
            className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-colors"
          >
            <Phone size={20} /> Call Support
          </a>
        </div>

        <div className="mt-10">
          <Link to="/login" className="text-white/30 text-sm hover:text-white transition-colors">
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
