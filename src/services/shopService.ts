import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../firebase';
import { Shop, Service, ShopConfig, EarningRecord } from '../types';

export const shopService = {
  async getShop(shopId: string): Promise<Shop | null> {
    try {
      const docRef = doc(db, 'shops', shopId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as Shop) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `shops/${shopId}`);
      return null;
    }
  },

  async getShopByPhone(phone: string): Promise<Shop | null> {
    try {
      const q = query(collection(db, 'shops'), where('phone', '==', phone));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      return querySnapshot.docs[0].data() as Shop;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'shops');
      return null;
    }
  },

  async registerShop(shopData: Partial<Shop> & { maxWaitingCapacity?: number }): Promise<string> {
    const nameSlug = (shopData.name || 'SHOP')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .slice(0, 15);
    const shopId = `${nameSlug}_${Math.floor(100000 + Math.random() * 900000)}`;
    
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

    const newShop: Shop = {
      id: shopId,
      name: shopData.name || '',
      ownerName: shopData.ownerName || '',
      phone: shopData.phone || '',
      city: shopData.city || '',
      country: shopData.country || 'India',
      currency: countryCurrencies[shopData.country || 'India'] || '₹',
      email: shopData.email || '',
      status: 'pending',
      plan: 'advanced',
      paidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      setupDate: new Date().toISOString(),
      queueOpen: true,
      pin: '1234',
      password: shopData.password || '',
      ...shopData
    };
    
    try {
      await setDoc(doc(db, 'shops', shopId), newShop);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `shops/${shopId}`);
    }
    
    try {
      // Initialize default config
      await setDoc(doc(db, 'shops', shopId, 'config', 'main'), {
        shopId,
        loyaltyThreshold: 10,
        loyaltyDiscountPct: 15,
        streakWindowDays: 90,
        avgServiceMin: 20,
        maxWaitingCapacity: shopData.maxWaitingCapacity || 5
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `shops/${shopId}/config/main`);
    }

    return shopId;
  },

  async updateShop(shopId: string, updates: Partial<Shop>) {
    try {
      const docRef = doc(db, 'shops', shopId);
      await updateDoc(docRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `shops/${shopId}`);
    }
  },

  async getServices(shopId: string): Promise<Service[]> {
    const q = query(collection(db, 'shops', shopId, 'services'), where('active', '==', true));
    const querySnapshot = await getDocs(q);
    const svcs = querySnapshot.docs.map(doc => doc.data() as Service);
    return svcs.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },

  async saveService(shopId: string, service: Partial<Service>) {
    const id = service.id || 'SVC_' + Date.now();
    await setDoc(doc(db, 'shops', shopId, 'services', id), {
      ...service,
      id,
      shopId,
      active: service.active ?? true,
      sortOrder: service.sortOrder ?? 0
    });
  },

  async getConfig(shopId: string): Promise<ShopConfig | null> {
    const docRef = doc(db, 'shops', shopId, 'config', 'main');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as ShopConfig) : null;
  },

  async saveConfig(shopId: string, config: Partial<ShopConfig>) {
    try {
      await setDoc(doc(db, 'shops', shopId, 'config', 'main'), config, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `shops/${shopId}/config/main`);
    }
  },

  async getEarnings(shopId: string): Promise<EarningRecord[]> {
    const q = query(collection(db, 'shops', shopId, 'earnings'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as EarningRecord);
  },

  async getCustomers(shopId: string): Promise<any[]> {
    const q = query(collection(db, 'shops', shopId, 'customers'), orderBy('totalVisits', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  },

  // Admin Functions
  async getAllShops(): Promise<Shop[]> {
    try {
      const q = query(collection(db, 'shops'), orderBy('setupDate', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Shop);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'shops');
      return [];
    }
  },

  async adminApproveShop(shopId: string, plan: string, paidUntil: string, adminNotes: string) {
    try {
      const docRef = doc(db, 'shops', shopId);
      await updateDoc(docRef, {
        status: 'active',
        plan,
        paidUntil,
        adminNotes
      });
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `shops/${shopId}`);
      return { success: false, message: 'Failed to approve shop' };
    }
  },

  async adminSuspendShop(shopId: string) {
    try {
      const docRef = doc(db, 'shops', shopId);
      await updateDoc(docRef, { status: 'suspended' });
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `shops/${shopId}`);
      return { success: false, message: 'Failed to suspend shop' };
    }
  },

  async registerAdmin(uid: string, pinOrType: string) {
    try {
      await setDoc(doc(db, 'admins', uid), {
        pin: pinOrType,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to register dynamic admin:', err);
    }
  },

  async verifyAdminPin(pin: string): Promise<boolean> {
    // In a real app, this would be a server-side check.
    // For this environment, we'll check against an environment variable.
    const masterPin = (import.meta as any).env.VITE_ADMIN_PIN || '123456';
    const isCorrect = pin === masterPin;
    if (isCorrect) {
      if (!auth.currentUser) {
        try {
          const { signInAnonymously } = await import('firebase/auth');
          await signInAnonymously(auth);
        } catch (authErr) {
          console.warn('Anonymous sign-in during admin PIN verification failed:', authErr);
        }
      }
      if (auth.currentUser) {
        await this.registerAdmin(auth.currentUser.uid, pin);
      }
    }
    return isCorrect;
  },

  async getReferralConfig(): Promise<{ enabled: boolean; validCodes: string[]; codePercentages?: Record<string, number> }> {
    try {
      const docRef = doc(db, 'referralSettings', 'main');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          enabled: data.enabled ?? true,
          validCodes: data.validCodes || [],
          codePercentages: data.codePercentages || {}
        };
      }
      // Return default config if document doesn't exist yet
      return {
        enabled: true,
        validCodes: ['SAVE15', 'BARBER15', 'VIP15', 'PARTNER15'],
        codePercentages: { 'SAVE15': 15, 'BARBER15': 15, 'VIP15': 15, 'PARTNER15': 15 }
      };
    } catch (error) {
      console.error('Error fetching referral config:', error);
      return { 
        enabled: true, 
        validCodes: ['SAVE15', 'BARBER15', 'VIP15', 'PARTNER15'],
        codePercentages: { 'SAVE15': 15, 'BARBER15': 15, 'VIP15': 15, 'PARTNER15': 15 }
      };
    }
  },

  async saveReferralConfig(config: { enabled: boolean; validCodes: string[]; codePercentages: Record<string, number> }): Promise<boolean> {
    try {
      const docRef = doc(db, 'referralSettings', 'main');
      await setDoc(docRef, config);
      return true;
    } catch (error) {
      console.error('Error saving referral config:', error);
      handleFirestoreError(error, OperationType.WRITE, 'referralSettings/main');
      return false;
    }
  }
};
