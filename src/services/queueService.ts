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
  limit,
  runTransaction
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { QueueEntry, QueueEntryStatus, CustomerHistory, ShopConfig } from '../types';

export const queueService = {
  async joinQueue(shopId: string, entryData: Partial<QueueEntry>): Promise<string> {
    const entryId = 'Q_' + Date.now();
    
    try {
      // Get next token number for today
      const today = new Date().toISOString().split('T')[0];
      const q = query(
        collection(db, 'shops', shopId, 'queue'), 
        where('joinedAt', '>=', today)
      );
      
      let nextToken = 1;
      try {
        const snap = await getDocs(q);
        if (!snap.empty) {
          const tokens = snap.docs.map(doc => (doc.data() as QueueEntry).tokenNo);
          nextToken = Math.max(...tokens) + 1;
        }
      } catch (err) {
        console.error('Error fetching last token, defaulting to 1:', err);
      }

      const entry: QueueEntry = {
        id: entryId,
        shopId,
        customerName: entryData.customerName || '',
        phone: entryData.phone || '',
        serviceId: entryData.serviceId || '',
        serviceName: entryData.serviceName || '',
        tokenNo: nextToken,
        status: 'waiting',
        joinedAt: new Date().toISOString(),
        estimatedWait: entryData.estimatedWait || 0,
        isCashOnly: entryData.isCashOnly || false,
        waitingInShop: entryData.waitingInShop || false,
        ...entryData
      };

      await setDoc(doc(db, 'shops', shopId, 'queue', entryId), entry);
      return entryId;
    } catch (error) {
      console.error('Critical error in joinQueue:', error);
      handleFirestoreError(error, OperationType.WRITE, `shops/${shopId}/queue/${entryId}`);
      return '';
    }
  },

  subscribeToQueue(shopId: string, callback: (entries: QueueEntry[]) => void) {
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, 'shops', shopId, 'queue'),
      where('joinedAt', '>=', today)
    );
    return onSnapshot(q, (snap) => {
      const entries = snap.docs.map(doc => doc.data() as QueueEntry);
      // Sort in-memory to prevent requiring composite indexes in Firestore
      entries.sort((a, b) => (a.tokenNo || 0) - (b.tokenNo || 0));
      callback(entries);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `shops/${shopId}/queue`);
    });
  },

  async updateEntryStatus(shopId: string, entryId: string, status: QueueEntryStatus) {
    try {
      const docRef = doc(db, 'shops', shopId, 'queue', entryId);
      const updates: any = { status };
      if (status === 'called') updates.calledAt = new Date().toISOString();
      if (status === 'done') updates.completedAt = new Date().toISOString();
      await updateDoc(docRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `shops/${shopId}/queue/${entryId}`);
    }
  },

  async findTokenByPhone(shopId: string, phone: string): Promise<QueueEntry | null> {
    try {
      const q = query(
        collection(db, 'shops', shopId, 'queue'),
        where('phone', '==', phone)
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;

      const today = new Date().toISOString().split('T')[0];
      const activeStatuses = ['waiting', 'called', 'in_service'];

      // Perform range/status matching and sorting in-memory to eliminate composite index requirement
      const filtered = snap.docs
        .map(doc => doc.data() as QueueEntry)
        .filter(entry => entry.joinedAt >= today && activeStatuses.includes(entry.status))
        .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));

      return filtered.length > 0 ? filtered[0] : null;
    } catch (error) {
      console.error('Error finding token by phone:', error);
      return null;
    }
  },

  async getCustomerHistory(shopId: string, phone: string): Promise<CustomerHistory | null> {
    const q = query(collection(db, 'shops', shopId, 'customers'), where('phone', '==', phone));
    const snap = await getDocs(q);
    return snap.empty ? null : (snap.docs[0].data() as CustomerHistory);
  },

  async markDone(shopId: string, entryId: string, servicePrice: number, config: ShopConfig) {
    const entryRef = doc(db, 'shops', shopId, 'queue', entryId);
    const entrySnap = await getDoc(entryRef);
    if (!entrySnap.exists()) return;
    const entry = entrySnap.data() as QueueEntry;

    // Use phone number as deterministic ID for customer history
    const custRef = entry.phone ? doc(db, 'shops', shopId, 'customers', entry.phone) : null;

    await runTransaction(db, async (transaction) => {
      // 1. Get all necessary data (READS FIRST)
      let custSnap = null;
      if (custRef && !entry.isCashOnly) {
        custSnap = await transaction.get(custRef);
      }

      const today = new Date().toISOString().split('T')[0];
      const earnId = 'EARN_' + today;
      const earnRef = doc(db, 'shops', shopId, 'earnings', earnId);
      const earnSnap = await transaction.get(earnRef);

      // 2. Perform updates (WRITES AFTER)
      
      // Update entry status
      transaction.update(entryRef, { status: 'done', completedAt: new Date().toISOString() });

      // Update customer history
      if (custSnap) {
        if (!custSnap.exists()) {
          const history: CustomerHistory = {
            id: entry.phone,
            shopId,
            customerName: entry.customerName,
            phone: entry.phone,
            totalVisits: 1,
            streakCount: 1,
            lastVisitDate: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          transaction.set(custRef, history);
        } else {
          const data = custSnap.data() as CustomerHistory;
          let newStreak = data.streakCount + 1;
          
          const lastVisit = new Date(data.lastVisitDate);
          const daysSince = (Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSince > config.streakWindowDays) newStreak = 1;

          if (newStreak >= config.loyaltyThreshold) {
            newStreak = 0;
          }

          transaction.update(custRef, {
            totalVisits: data.totalVisits + 1,
            streakCount: newStreak,
            lastVisitDate: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }

      // Update earnings
      if (!earnSnap.exists()) {
        transaction.set(earnRef, {
          id: earnId,
          shopId,
          date: today,
          totalCustomers: 1,
          totalRevenue: servicePrice,
          discountsGiven: 0,
          netRevenue: servicePrice
        });
      } else {
        const data = earnSnap.data() as any;
        transaction.update(earnRef, {
          totalCustomers: data.totalCustomers + 1,
          totalRevenue: data.totalRevenue + servicePrice,
          netRevenue: data.netRevenue + servicePrice
        });
      }
    });
  }
};
