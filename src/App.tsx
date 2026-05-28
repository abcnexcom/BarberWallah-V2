import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import BarberDashboard from './pages/BarberDashboard';
import BarberSettings from './pages/BarberSettings';
import JoinQueue from './pages/JoinQueue';
import QueueStatus from './pages/QueueStatus';
import TokenRecovery from './pages/TokenRecovery';
import AdminPanel from './pages/AdminPanel';
import PendingApproval from './pages/PendingApproval';
import Suspended from './pages/Suspended';

import ErrorBoundary from './components/ErrorBoundary';

import { LanguageProvider } from './lib/LanguageContext';
import Tutorial from './pages/Tutorial';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0f1a]">
        <div className="w-12 h-12 border-4 border-[#c9a84c] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <ErrorBoundary>
        <Router>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/tutorial" element={<Tutorial />} />
            <Route path="/token-recovery" element={<TokenRecovery />} />
            
            {/* Customer Pages (Shop Specific) */}
            <Route path="/shop/:shopId" element={<JoinQueue />} />
            <Route path="/shop/:shopId/status/:entryId" element={<QueueStatus />} />

            {/* Barber Pages (Protected) */}
            <Route path="/barber/:shopId" element={<BarberDashboard />} />
            <Route path="/barber/:shopId/settings" element={<BarberSettings />} />
            
            {/* System Pages */}
            <Route path="/pending" element={<PendingApproval />} />
            <Route path="/suspended" element={<Suspended />} />
            <Route path="/admin" element={<AdminPanel />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </LanguageProvider>
  );
}
