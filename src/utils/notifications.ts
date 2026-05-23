/**
 * Service to send real-time notifications when an order is placed.
 */

interface NotificationFormData {
  name: string;
  phone: string;
  address: string;
  paymentMethod: string;
  senderNumber?: string;
  transactionId?: string;
}

/**
 * Sends a stylized Markdown message to a Telegram Bot chat.
 */
export async function sendTelegramNotification(
  orderId: string,
  items: any[],
  total: number,
  formData: NotificationFormData,
  siteSettings: any
) {
  if (
    !siteSettings.enableTelegramNotifications ||
    !siteSettings.telegramBotToken ||
    !siteSettings.telegramChatId
  ) {
    return;
  }

  try {
    let itemsText = '';
    items.forEach((item: any, idx: number) => {
      itemsText += `🔸 *${item.name}*${item.size ? ` (Size: ${item.size})` : ''} x ${item.quantity} - ৳${item.price}\n`;
    });

    const paymentText = formData.paymentMethod === 'cod'
      ? '💵 Cash on Delivery (ক্যাশ অন ডেলিভারি)'
      : `💳 ${formData.paymentMethod.toUpperCase()}`;

    const txDetails = formData.paymentMethod !== 'cod' && formData.senderNumber && formData.transactionId
      ? `🔹 *Sender Number:* ${formData.senderNumber}\n🔹 *Txn ID:* \`${formData.transactionId}\`\n`
      : '';

    const msg = `🔔 *নতুন অর্ডার এসেছে! (New Order)*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📄 *Order ID:* \`#${orderId.slice(-6).toUpperCase()}\`\n` +
      `👤 *Customer Name:* ${formData.name}\n` +
      `📞 *Phone Number:* ${formData.phone}\n` +
      `📍 *Delivery Address:* ${formData.address}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📦 *Ordered Items:*\n${itemsText}` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *Total Amount:* ৳${total}\n` +
      `💳 *Payment Method:* ${paymentText}\n` +
      txDetails +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🔗 [Admin Panel এ যান (Go to Dashboard)](${window.location.origin}/admin)`;

    const url = `https://api.telegram.org/bot${siteSettings.telegramBotToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: siteSettings.telegramChatId,
        text: msg,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      console.error('Telegram API error status:', response.status, await response.text());
    }
  } catch (err) {
    console.error('Error sending Telegram notification:', err);
  }
}

/**
 * Triggers a synthesized retro cash-register sound in the user browser using the Web Audio API.
 * This does not rely on any static files, so it is 100% reliable and doesn't get blocked.
 */
export function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Low frequency double ding
    const playDing = (freq: number, duration: number, delay: number) => {
      setTimeout(() => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq / 2, audioCtx.currentTime + duration);
        
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      }, delay);
    };

    // Quick cash register double ding sound
    playDing(880, 0.25, 0);       // High-ish ring
    playDing(1320, 0.35, 120);    // Immediate metallic overlay chime
  } catch (err) {
    console.error('Web Audio Playback failed/blocked by browser user gesture interaction rule:', err);
  }
}
