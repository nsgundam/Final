const { handleEvent } = require('../src/lineHandler');

async function runTests() {
  console.log('--- Running Backend Logic Verification Tests ---');

  // Mock LINE MessagingApiClient
  const mockClient = {
    getProfile: async (userId) => ({ displayName: 'สมชาย ใจดี' }),
    replyMessage: async ({ replyToken, messages }) => {
      return { replyToken, message: messages[0] };
    },
  };

  // Test Case 1: Greeting "สวัสดี"
  console.log('\n[Test 1] Testing Greeting "สวัสดี"...');
  const greetingEvent = {
    type: 'message',
    message: { type: 'text', text: 'สวัสดี' },
    replyToken: 'token_123',
    source: { userId: 'user_001' },
  };
  const res1 = await handleEvent(greetingEvent, mockClient);
  console.log('Result:', res1.message.text);
  if (res1.message.text === 'สวัสดีครับ คุณ สมชาย ใจดี') {
    console.log('✅ Test 1 Passed!');
  } else {
    console.error('❌ Test 1 Failed!', res1);
  }

  // Test Case 2: Question about อ.เณร / อ.วุฒิพงษ์
  console.log('\n[Test 2] Testing Question about "อ.วุฒิพงษ์ ชินศรี"...');
  const ajarnEvent = {
    type: 'message',
    message: { type: 'text', text: 'อ.วุฒิพงษ์ ชินศรี สอนวิชาอะไรครับ' },
    replyToken: 'token_456',
    source: { userId: 'user_001' },
  };
  const res2 = await handleEvent(ajarnEvent, mockClient);
  console.log('Result:', res2.message.text);
  if (res2.message.text) {
    console.log('✅ Test 2 Passed!');
  } else {
    console.error('❌ Test 2 Failed!');
  }

  // Test Case 3: Fallback Message
  console.log('\n[Test 3] Testing Fallback message...');
  const fallbackEvent = {
    type: 'message',
    message: { type: 'text', text: 'สภาพอากาศวันนี้เป็นอย่างไร' },
    replyToken: 'token_789',
    source: { userId: 'user_001' },
  };
  const res3 = await handleEvent(fallbackEvent, mockClient);
  console.log('Result:', res3.message.text);
  if (res3.message.text === 'รอ Admin ติดต่อกลับสักครู่') {
    console.log('✅ Test 3 Passed!');
  } else {
    console.error('❌ Test 3 Failed!');
  }

  console.log('\n--- All Backend Logic Tests Complete ---');
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
