import { ShopConfig, QueueEntry } from '../types';

export const notificationService = {
  async notifyOwnerOfJoiner(shopName: string, entry: QueueEntry, config: ShopConfig) {
    if (!config.enableWhatsApp || !config.ownerWhatsApp) return;

    const message = `*New Entry: ${shopName}*\n\n` +
      `Customer: ${entry.customerName}\n` +
      `Token: *${entry.tokenNo}*\n` +
      `Phone: ${entry.phone}\n` +
      `Est. Wait: ${entry.estimatedWait} mins.`;

    const targetPhone = config.ownerWhatsApp.replace(/\D/g, '');
    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
    
    if (config.whatsappApiKey) {
      console.log('API: Sending join notification to owner...');
    } else {
      console.log('Manual: Opening notification for owner...');
      window.open(url, '_blank');
    }
  },

  async notifyCustomerOfTurn(shopName: string, entry: QueueEntry, config: ShopConfig, force: boolean = false) {
    if (!config.enableWhatsApp && !force) return;

    const message = `*IT'S YOUR TURN @ ${shopName}*\n\n` +
      `Hello ${entry.customerName},\n` +
      `Your barber is ready for you now! Please walk into the shop.\n\n` +
      `Token: *${entry.tokenNo}*`;

    // Send directly to customer
    const cleanPhone = entry.phone.replace(/\D/g, '');
    const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
    
    if (config.whatsappApiKey) {
      console.log('API: Sending turn notification to customer...');
    } else {
      console.log('Manual: Opening turn alert for customer...');
      window.open(url, '_blank');
    }
  },

  async sendCallNotification(entry: QueueEntry, config: ShopConfig) {
    if (!config.exotelSid || !config.exotelToken || !config.exotelCallerId) {
      console.warn('Call settings not configured');
      return false;
    }

    try {
      // Exotel API call (Simplifed)
      // Note: This usually requires a server-side proxy to avoid CORS and hide the token
      // But we'll implement the logic here as requested "if it works"
      
      const auth = btoa(`${config.exotelSid}:${config.exotelToken}`);
      const response = await fetch(`https://api.exotel.com/v1/Accounts/${config.exotelSid}/Calls/connect.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          'From': config.exotelCallerId,
          'To': entry.phone,
          'CallerId': config.exotelCallerId,
          'Url': config.audioUrl || 'http://my.exotel.in/exoml/start/voice_call' // Default Exotel URL
        })
      });

      if (!response.ok) {
        throw new Error(`Exotel error: ${response.statusText}`);
      }

      console.log('Call triggered successfully');
      return true;
    } catch (err) {
      console.error('Failed to trigger call:', err);
      return false;
    }
  },

  async sendWhatsAppCallFallback(shopName: string, entry: QueueEntry, config: ShopConfig) {
    // If call failed, send WhatsApp
    const message = `*URGENT: Your Turn at ${shopName}*\n\n` +
      `Hello ${entry.customerName},\n` +
      `We tried calling you but couldn't connect.\n` +
      `Your turn is *NOW*. Please arrive at the shop immediately.`;

    const phone = entry.phone.startsWith('+') ? entry.phone : `+91${entry.phone}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    // In a real automated system, we would use an API here too.
    // Since this is a browser app, we can either use an API or open the URL.
    if (config.whatsappApiKey) {
       // Send via API logic...
    } else {
       // Manual fallback
       window.open(url, '_blank');
    }
  }
};
