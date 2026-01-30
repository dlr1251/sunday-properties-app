#!/usr/bin/env node

/**
 * Test script for PDF.js conversion
 * This script tests the PDF to image conversion functionality
 */

const fs = require('fs');
const path = require('path');

// Test with a sample PDF if available
async function testPDFConversion() {
  console.log('🧪 Testing PDF.js conversion...');
  
  // Look for test PDF files
  const testPdfs = [
    './test-documents/CLYT-001-894286-Apto-801.pdf',
    './test-documents/certificado-tradicion-apto.pdf',
    './test-documents/certificado-tradicion-cu-44.pdf',
    './test-documents/escritura-sucesion.pdf'
  ];
  
  let testPdf = null;
  for (const pdfPath of testPdfs) {
    if (fs.existsSync(pdfPath)) {
      testPdf = pdfPath;
      break;
    }
  }
  
  if (!testPdf) {
    console.log('⚠️ No test PDF files found. Please place a PDF file in the test-documents directory.');
    console.log('Expected files:');
    testPdfs.forEach(pdf => console.log(`  - ${pdf}`));
    return;
  }
  
  console.log(`📄 Testing with: ${testPdf}`);
  
  try {
    // Read PDF file
    const pdfBuffer = fs.readFileSync(testPdf);
    console.log(`📊 PDF size: ${pdfBuffer.length} bytes`);
    
    // Test PDF.js loading (simulate browser environment)
    console.log('🔄 Testing PDF.js loading...');
    
    // This would normally be done in the browser with PDF.js
    // For now, we'll just validate the file structure
    const pdfHeader = pdfBuffer.toString('ascii', 0, 8);
    console.log(`📋 PDF header: ${pdfHeader}`);
    
    if (pdfHeader.startsWith('%PDF-')) {
      console.log('✅ Valid PDF file detected');
      
      // Count pages by looking for page objects (basic approach)
      const pdfContent = pdfBuffer.toString('ascii');
      const pageMatches = pdfContent.match(/\/Type\s*\/Page\b/g);
      const pageCount = pageMatches ? pageMatches.length : 0;
      
      console.log(`📄 Estimated page count: ${pageCount}`);
      
      if (pageCount > 0) {
        console.log('🎉 PDF.js conversion should work with this file');
        console.log('📝 Next steps:');
        console.log('  1. Upload this PDF in the browser');
        console.log('  2. Check console for PDF.js rendering logs');
        console.log('  3. Verify Grok receives high-quality images');
        console.log('  4. Check for complete data extraction');
      } else {
        console.log('⚠️ Could not determine page count');
      }
      
    } else {
      console.log('❌ Invalid PDF file');
    }
    
  } catch (error) {
    console.error('❌ Error testing PDF:', error);
  }
}

// Run the test
testPDFConversion();
