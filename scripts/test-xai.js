// Test xAI integration
import { generateText } from 'ai';
import { xai } from '@ai-sdk/xai';

const apiKey = process.env.VITE_XAI_API_KEY || process.env.XAI_API_KEY;

if (!apiKey) {
  console.error('❌ No API key found. Set VITE_XAI_API_KEY or XAI_API_KEY environment variable.');
  process.exit(1);
}

async function testXAI() {
  console.log('🧪 Testing xAI Integration...\n');

  try {
    console.log('API Key available:', !!apiKey);

    // Test 1: Direct API call
    console.log('\n1. Testing direct API call...');
    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'grok-3',
          messages: [{ role: 'user', content: 'Hello, just testing. Say "Test successful!"' }],
          temperature: 0.1,
          max_tokens: 100,
        }),
      });

      console.log('Direct API status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Direct API succeeded:', data.choices?.[0]?.message?.content || data);
      } else {
        const error = await response.text();
        console.log('❌ Direct API failed:', error);
      }
    } catch (error) {
      console.log('❌ Direct API error:', error.message);
    }

    // Test 2: AI SDK with API key
    console.log('\n2. Testing AI SDK with API key...');
    try {
      const model = xai('grok-3', { apiKey });
      const { text } = await generateText({
        model,
        prompt: 'Hello, just testing. Say "AI SDK successful!"',
        temperature: 0.1,
        maxTokens: 100,
      });
      console.log('✅ AI SDK with API key succeeded:', text);
    } catch (error) {
      console.log('❌ AI SDK with API key failed:', error.message);
    }

    // Test 3: AI SDK without API key (using env)
    console.log('\n3. Testing AI SDK with env var...');
    try {
      // Set env var
      process.env.XAI_API_KEY = apiKey;

      const model = xai('grok-3');
      const { text } = await generateText({
        model,
        prompt: 'Hello, just testing. Say "Env var successful!"',
        temperature: 0.1,
        maxTokens: 100,
      });
      console.log('✅ AI SDK with env var succeeded:', text);
    } catch (error) {
      console.log('❌ AI SDK with env var failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testXAI();
