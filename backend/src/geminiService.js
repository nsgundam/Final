const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');
const cheerio = require('cheerio');

let cachedKnowledge = null;
let lastFetchTime = 0;
const CACHE_TTL = 3600 * 1000; // 1 hour

/**
 * Fetch and extract text content from https://wutthipong.info
 */
async function fetchWebsiteKnowledge() {
  const now = Date.now();
  if (cachedKnowledge && now - lastFetchTime < CACHE_TTL) {
    return cachedKnowledge;
  }

  try {
    const response = await axios.get('https://wutthipong.info', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 8000,
    });

    const $ = cheerio.load(response.data);
    
    // Remove script, style, nav, footer tags to clean text
    $('script, style, noscript, iframe, svg').remove();
    
    let pageText = $('body').text().replace(/\s+/g, ' ').trim();
    
    if (pageText.length > 50) {
      cachedKnowledge = pageText;
      lastFetchTime = now;
      console.log(`[GeminiService] Successfully fetched and cached knowledge from wutthipong.info (${pageText.length} chars)`);
      return cachedKnowledge;
    }
  } catch (error) {
    console.warn(`[GeminiService] Warning fetching wutthipong.info: ${error.message}. Using default grounding context.`);
  }

  // Fallback context if website scraping is blocked or unreachable
  cachedKnowledge = `
เว็บไซต์อ้างอิง: https://wutthipong.info
ชื่อ: อาจารย์ วุฒิพงษ์ ชินศรี (อ.เณร / อาจารย์เณร)
ตำแหน่ง: อาจารย์ประจำ มหาวิทยาลัยรังสิต (Rangsit University)
เชี่ยวชาญ: เทคโนโลยีสารสนเทศ, การพัฒนาซอฟต์แวร์, เว็บแอปพลิเคชัน, LINE API, LIFF App, AI Integration, Dialogflow และวิทยาการคอมพิวเตอร์
ผลงานและการสอน: การสอนเขียนโปรแกรม, การบรรยายวิชาการ, ที่ปรึกษาโครงการเทคโนโลยีสารสนเทศ
เว็บไซต์ทางการ: https://wutthipong.info
  `.trim();
  lastFetchTime = now;
  return cachedKnowledge;
}

/**
 * Query Gemini AI for questions regarding อ.วุฒิพงษ์ ชินศรี / อ.เณร
 */
async function askGeminiAboutAjarn(userQuery) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[GeminiService] GEMINI_API_KEY is not set.');
    return 'ขออภัยครับ ระบบ AI ยังไม่ได้ตั้งค่า GEMINI_API_KEY กรุณาติดต่อผู้ดูแลระบบ';
  }

  const websiteContext = await fetchWebsiteKnowledge();

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `
คุณคือผู้ช่วยตอบคำถามเกี่ยวกับ "อาจารย์ วุฒิพงษ์ ชินศรี" หรือ "อ.เณร" (อาจารย์ มหาวิทยาลัยรังสิต)
ข้อบังคับสำคัญที่สุด:
1. คุณต้องตอบคำถามโดยใช้ข้อมูลจากเว็บบริบทที่กำหนดให้นี้เท่านั้น (เว็บไซต์ https://wutthipong.info):
---
${websiteContext}
---
2. หากคำถามเกี่ยวกับ อ.วุฒิพงษ์ หรือ อ.เณร ไม่มีข้อมูลระบุไว้ในบริบทที่ให้มา ให้ตอบอย่างสุภาพว่า: "ขออภัยครับ ไม่พบข้อมูลดังกล่าวบนเว็บไซต์ https://wutthipong.info"
3. ตอบด้วยภาษาไทยที่สุภาพ เป็นกันเอง ชัดเจน และกระชับ
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: userQuery }],
        },
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
      },
    });

    return response.text ? response.text.trim() : 'ไม่สามารถดึงข้อมูลตอบกลับได้';
  } catch (err) {
    console.error('[GeminiService] Error calling Gemini API:', err.message);
    return 'เกิดข้อผิดพลาดในการประมวลผล Gemini AI กรุณาลองใหม่อีกครั้ง';
  }
}

module.exports = {
  askGeminiAboutAjarn,
  fetchWebsiteKnowledge,
};
