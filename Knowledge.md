# Knowledge & Implementation Task Guide: LINE OA + Express Backend + Gemini AI + Next.js LIFF App

เอกสารฉบับนี้สรุปความต้องการ โครงสร้างสถาปัตยกรรมระบบ ข้อกำหนดด้านฟังก์ชันการทำงาน (Functional Requirements) และแผนการดำเนินงาน (Task Checklist) สำหรับการสร้าง **LINE Official Account (LINE OA)** ร่วมกับ **Express Backend Webhook** และ **Next.js LIFF Frontend**

---

## 1. ภาพรวมระบบ (System Overview)

ระบบประกอบด้วย 2 ส่วนหลัก:
1. **Express Backend (Webhook Server):**
   - เชื่อมต่อกับ LINE Messaging API และ Dialogflow
   - จัดการระบบตอบกลับอัตโนมัติ (Auto-reply)
   - เมื่อผู้ใช้ส่งข้อคววามมาว่า "สวัสดี" ให้ตอบกลับว่า "สวัสดีครับ
คุณ [displayName]"
   - ตรวจจับคีย์เวิร์ด และคำถามเกี่ยวกับ "อ.วุฒิพงษ์ ชินศรี / อ.เณร" แล้วเรียกใช้ **Google Generative AI (Gemini)** ดึงข้อมูลอ้างอิงจากเว็บ `https://wutthipong.info` เท่านั้น
   - Fallback กรณีไม่ตรงเงื่อนไข ตอบกลับว่า "รอ Admin ติดต่อกลับสักครู่"
2. **Next.js LIFF Frontend (Mobile-First Web App):**
   - เชื่อมต่อกับ LIFF SDK ใช้งานบนสมาร์ทโฟน
   - ระบบ Auto-Login ผ่าน LIFF
   - แสดงทักทาย "สวัสดี [displayName]" พร้อมรูปโปรไฟล์ (`pictureUrl`)
   - ฟอร์มสร้างนามบัตรตัวเอง (กรอกรหัสนักศึกษา และหลักสูตรที่เรียน) พร้อมพรีวิว Flex Card
   - **ปุ่ม "Send My Card":** ส่ง Flex Message นามบัตรตนเองเข้าแชทปัจจุบัน (`liff.sendMessages()`)
   - **ปุ่ม "Share Coach Card" (แชร์นามบัตร อ.เณร):** ส่ง Flex Message นามบัตร อ.เณร ให้เพื่อนหรือกลุ่ม (`liff.shareTargetPicker()`)
   - **ปุ่ม "Scan QR Code":** สแกน QR Code ผ่านกล้อง (`liff.scanCodeV2()`) และแสดงผลบนหน้าจอ/ส่งเข้าแชท

---

## 2. สถาปัตยกรรมระบบ (System Architecture)

```
[ LINE App / User ]
       │
       ├────► [ Express Backend Webhook ] ───► [ Dialogflow Intent Check ]
       │              │
       │              ├──► Keyword: "สวัสดี" ──► Reply: "สวัสดีครับ คุณ [displayName]"
       │              ├──► Keyword: "อ.วุฒิพงษ์/อ.เณร" ──► [ Gemini AI ] ◄── (Source: wutthipong.info)
       │              └──► Default Fallback ──► Reply: "รอ Admin ติดต่อกลับสักครู่"
       │
       └────► [ Next.js LIFF Frontend ]
                      ├── Auto Login (liff.init)
                      ├── Display Profile (liff.getProfile)
                      ├── Send My Card (liff.sendMessages)
                      ├── Share Coach Card (liff.shareTargetPicker)
                      └── Scan QR Code (liff.scanCodeV2)
```

---

## 3. รายละเอียดข้อกำหนดการทำงาน (Functional Requirements)

### 3.1 Backend (Express.js)
* **LINE & Dialogflow Webhook Handler:**
  - รับ Webhook event จาก LINE / Dialogflow
* **Rule 1 - ทักทาย ("สวัสดี"):**
  - ตรวจสอบคำว่า "สวัสดี"
  - ดึงข้อมูล Profile จาก LINE Messaging API (`/v2/bot/profile/{userId}`)
  - ตอบกลับ: `สวัสดีครับ คุณ [displayName]`
* **Rule 2 - ถามเกี่ยวกับ อ.วุฒิพงษ์ ชินศรี / อ.เณร:**
  - ตรวจจับคีย์เวิร์ดที่เกี่ยวข้อง เช่น `อ.วุฒิพงษ์`, `วุฒิพงษ์ ชินศรี`, `อ.เณร`, `อาจารย์เณร`
  - ส่ง Prompt พร้อมบริบท (Context Grounding) บังคับใช้ข้อมูลเฉพาะจาก `https://wutthipong.info` เข้าสู่ **Google Gemini API**
  - ตอบกลับคำตอบที่ได้จาก Gemini ให้กับผู้ใช้
* **Rule 3 - Fallback Message:**
  - กรณีข้อความไม่ตรงกับเงื่อนไขใดๆ ข้างต้น และ Dialogflow ไม่พบ Intent
  - ตอบกลับ: `รอ Admin ติดต่อกลับสักครู่`

---

### 3.2 Frontend (Next.js + LIFF SDK)
* **Design & UX:**
  - Responsive Mobile-First Design
  - Modern UI / Glassmorphism / Vibrant & Premium Flex Layout
* **Initialization & Profile Authentication:**
  - Call `liff.init({ liffId })` เมื่อโหลดหน้าแรก
  - ถ้ายังไม่ได้ Login ให้ทำการ Auto-Login (`liff.login()`)
  - ดึงข้อมูลผู้ใช้ด้วย `liff.getProfile()` ได้แก่ `displayName`, `pictureUrl`, `userId`, `statusMessage`
* **หน้าจอหลัก (Hero Section & Profile):**
  - แสดงข้อความ: `สวัสดี [displayName]`
  - แสดงรูปโปรไฟล์ `pictureUrl` ในกรอบวงกลมสวยงาม
* **ส่วนนามบัตรตัวเอง (Digital Business Card):**
  - ฟอร์ม input ให้ผู้ใช้งานใส่ข้อมูลเพิ่มเติม:
    1. **รหัสนักศึกษา (Student ID)**
    2. **หลักสูตรที่เรียน (Program / Course)**
  - แสดง Live Preview เป็น Flex Card นามบัตร
* **Action Buttons:**
  1. **ปุ่ม "Send My Card" (ส่งนามบัตรตัวเอง):**
     - เรียกใช้ `liff.sendMessages()`
     - ส่ง Flex Message นามบัตรของผู้ใช้ (รูปโปรไฟล์, displayName, รหัสนักศึกษา, หลักสูตรที่เรียน) เข้าไปในแชทปัจจุบัน
  2. **ปุ่ม "Share Coach Card" (แชร์นามบัตร อ.เณร):**
     - เรียกใช้ `liff.shareTargetPicker()`
     - ส่ง Flex Message นามบัตร อ.เณร ประกอบด้วย:
       - รูปภาพ: รูป อ.เณร (URL Image)
       - ชื่อ-นามสกุล: `วุฒิพงษ์ ชินศรี`
       - ตำแหน่ง: `อาจารย์ ม.รังสิต`
       - ปุ่ม URI Action: `Website` เปิดลิงก์ `https://wutthipong.info`
  3. **ปุ่ม "Scan QR Code":**
     - เรียกใช้ `liff.scanCodeV2()` เปิดกล้องสแกน QR Code
     - แสดงผลลัพธ์ข้อความ/URL ที่สแกนได้บนหน้าจอ LIFF พร้อมตัวเลือกส่งกลับเข้าห้องแชท

---

## 4. โครงสร้าง Flex Message Templates (JSON Schemas)

### 4.1 นามบัตรตัวเอง (User Business Card)
```json
{
  "type": "flex",
  "altText": "นามบัตรของคุณ {displayName}",
  "contents": {
    "type": "bubble",
    "hero": {
      "type": "image",
      "url": "{pictureUrl}",
      "size": "full",
      "aspectRatio": "1:1",
      "aspectMode": "cover"
    },
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        { "type": "text", "text": "{displayName}", "weight": "bold", "size": "xl" },
        { "type": "text", "text": "รหัสนักศึกษา: {studentId}", "size": "sm", "color": "#666666" },
        { "type": "text", "text": "หลักสูตร: {courseName}", "size": "sm", "color": "#666666" }
      ]
    }
  }
}
```

### 4.2 นามบัตร อ.เณร (Coach Business Card)
```json
{
  "type": "flex",
  "altText": "นามบัตร อ.วุฒิพงษ์ ชินศรี (อ.เณร)",
  "contents": {
    "type": "bubble",
    "hero": {
      "type": "image",
      "url": "https://wutthipong.info/wp-content/uploads/2023/profile.jpg",
      "size": "full",
      "aspectRatio": "1:1",
      "aspectMode": "cover"
    },
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        { "type": "text", "text": "วุฒิพงษ์ ชินศรี", "weight": "bold", "size": "xl" },
        { "type": "text", "text": "อาจารย์ ม.รังสิต", "size": "md", "color": "#888888", "margin": "md" }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "button",
          "action": {
            "type": "uri",
            "label": "Website",
            "uri": "https://wutthipong.info"
          },
          "style": "primary",
          "color": "#06C755"
        }
      ]
    }
  }
}
```

---

## 5. การตั้งค่า Environment Variables (`.env`)

```env
# LINE Official Account Settings
LINE_CHANNEL_SECRET=your_channel_secret_here
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here

# LIFF Settings
NEXT_PUBLIC_LIFF_ID=your_liff_id_here

# Google Gemini AI Settings
GEMINI_API_KEY=your_gemini_api_key_here

# Dialogflow Settings (Optional / Fulfillment)
DIALOGFLOW_PROJECT_ID=your_project_id
```

---

## 6. รายการงานสำหรับการพัฒนา (Development Tasks Roadmap)

- [ ] **Task 1: Project Initialization & Directory Setup**
  - สร้างโครงสร้างโปรเจกต์ (Backend: Express.js, Frontend: Next.js App Router)
  - ติดตั้ง Package สำคัญ: `@line/bot-sdk`, `@google/genai`, `@line/liff`, `axios`, `express`, `dotenv`, `cors`
- [ ] **Task 2: Express Webhook & Auto-Reply Implementation**
  - สร้าง Webhook Endpoint (`POST /api/webhook`) รองรับ signature validation
  - พัฒนา Handler สำหรับคำว่า `"สวัสดี"` -> ดึงชื่อผู้ใช้และตอบกลับ `สวัสดีครับ คุณ [displayName]`
  - พัฒนา Fallback Response -> ตอบกลับ `รอ Admin ติดต่อกลับสักครู่`
- [ ] **Task 3: Gemini AI Integration (Grounding from https://wutthipong.info)**
  - พัฒนาโมดูล Scraping/Knowledge Fetcher หรือ System Instruction ให้ Gemini
  - ตั้งค่า Constraint: บังคับให้ Gemini ตอบคำถามเกี่ยวกับ อ.วุฒิพงษ์ ชินศรี / อ.เณร จากข้อมูลเว็บ `https://wutthipong.info` เท่านั้น
- [ ] **Task 4: Next.js LIFF Frontend & Mobile-First UI**
  - ออกแบบ UI (Mobile-First) ด้วย CSS / Glassmorphism
  - ติดตั้ง LIFF SDK และสร้าง Provider/Hook สำหรับ `liff.init()` และ Auto-Login
  - พัฒนาหน้าแรกแสดง `สวัสดี [displayName]` และรูปภาพโปรไฟล์ `pictureUrl`
- [ ] **Task 5: Business Card Form & Flex Message (`liff.sendMessages`)**
  - สร้างฟอร์มกรอก "รหัสนักศึกษา" และ "หลักสูตรที่เรียน"
  - สร้างพรีวิว Flex Card นามบัตรตนเอง
  - พัฒนาฟังก์ชันสำหรับปุ่ม `"Send My Card"` ส่งเข้าแชทด้วย `liff.sendMessages()`
- [ ] **Task 6: Share Coach Card (`liff.shareTargetPicker`)**
  - สร้างโมดูล Flex Message สำหรับนามบัตร อ.เณร (วุฒิพงษ์ ชินศรี, อาจารย์ ม.รังสิต, ปุ่ม Website)
  - พัฒนาฟังก์ชันสำหรับปุ่ม `"Share Coach Card"` เรียกใช้ `liff.shareTargetPicker()`
- [ ] **Task 7: QR Code Scanner (`liff.scanCodeV2`)**
  - พัฒนาฟังก์ชันสำหรับปุ่ม `"Scan QR Code"`
  - จัดการผลลัพธ์จากการสแกน (แสดงผลบน UI / ตัวเลือกส่งเข้าแชท)
- [ ] **Task 8: End-to-End Testing & Verification**
  - ทดสอบ Webhook บน LINE OA
  - ทดสอบ LIFF App บนอุปกรณ์จริงผ่าน LINE Browser
