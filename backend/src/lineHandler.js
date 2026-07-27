const { askGeminiAboutAjarn } = require('./geminiService');

/**
 * Keywords for detecting queries about อ.วุฒิพงษ์ ชินศรี / อ.เณร
 */
const AJARN_KEYWORDS = [
  'อ.วุฒิพงษ์',
  'วุฒิพงษ์ ชินศรี',
  'วุฒิพงษ์',
  'อ.เณร',
  'อาจารย์เณร',
  'อาจารย์วุฒิพงษ์',
  'อ เณร',
];

/**
 * Main Webhook Event Handler for LINE
 * @param {Object} event - LINE event object
 * @param {MessagingApiClient} client - MessagingApiClient instance
 */
async function handleEvent(event, client) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const text = (event.message.text || '').trim();
  const replyToken = event.replyToken;
  const userId = event.source && event.source.userId;

  console.log(`[LineHandler] Received message: "${text}" from userId: ${userId}`);

  // Helper function to send reply message using @line/bot-sdk v11 API
  const replyText = async (textMsg) => {
    if (!client) return null;
    return client.replyMessage({
      replyToken,
      messages: [{ type: 'text', text: textMsg }],
    });
  };

  // Rule 1: Greeting ("สวัสดี")
  if (text === 'สวัสดี' || text.toLowerCase() === 'hello' || text.toLowerCase() === 'hi') {
    let displayName = 'คุณ';
    if (userId && client) {
      try {
        const profile = await client.getProfile(userId);
        displayName = profile.displayName || 'คุณ';
      } catch (err) {
        console.warn(`[LineHandler] Failed to get user profile: ${err.message}`);
      }
    }
    const greetingText = `สวัสดีครับ คุณ ${displayName}`;
    return replyText(greetingText);
  }

  // Rule 2: Question about อ.วุฒิพงษ์ ชินศรี / อ.เณร
  const isAjarnQuery = AJARN_KEYWORDS.some((kw) => text.toLowerCase().includes(kw.toLowerCase()));
  if (isAjarnQuery) {
    const aiAnswer = await askGeminiAboutAjarn(text);
    return replyText(aiAnswer);
  }

  // Rule 3: Fallback Message
  const fallbackMessage = 'รอ Admin ติดต่อกลับสักครู่';
  return replyText(fallbackMessage);
}

module.exports = {
  handleEvent,
  AJARN_KEYWORDS,
};
