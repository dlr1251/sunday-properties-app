// Test script for document analysis service
import { createClient } from '@supabase/supabase-js';

// Test Supabase connection
const supabaseUrl = 'http://127.0.0.1:54328';
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDocumentAnalysis() {
  console.log('🧪 Testing Document Analysis Service...\n');

  try {
    // Test 1: Check environment variables
    console.log('1. Environment Variables:');
    console.log('   VITE_XAI_API_KEY:', import.meta.env.VITE_XAI_API_KEY ? '✅ Set' : '❌ Missing');

    // Test 2: Test basic Supabase connection
    console.log('\n2. Supabase Connection:');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.log('   ❌ Connection failed:', error.message);
    } else {
      console.log('   ✅ Connection successful');
    }

    // Test 3: Test xAI integration (simple text generation)
    console.log('\n3. xAI Integration:');
    try {
      const { generateText } = await import('ai');
      const { xai } = await import('@ai-sdk/xai');

      const apiKey = import.meta.env.VITE_XAI_API_KEY;
      if (!apiKey) {
        console.log('   ❌ API key missing');
      } else {
        console.log('   📝 Testing simple text generation...');
        const { text } = await generateText({
          model: xai('grok-beta', { apiKey }),
          prompt: 'Hello, just testing. Respond with "Test successful"',
          temperature: 0.1,
        });
        console.log('   ✅ xAI working:', text);
      }
    } catch (error) {
      console.log('   ❌ xAI error:', error.message);
    }

    // Test 4: Test PDF parsing
    console.log('\n4. PDF Parsing:');
    try {
      const pdfParseModule = await import('pdf-parse');
      const pdfParse = pdfParseModule.default || pdfParseModule;
      console.log('   ✅ pdf-parse imported successfully');
      console.log('   📄 Type:', typeof pdfParse);
    } catch (error) {
      console.log('   ❌ pdf-parse import failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDocumentAnalysis();
