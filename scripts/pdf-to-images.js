#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const pdf2image = require('pdf2image');

/**
 * Convert PDF to high-quality images using pdf2image
 * This script runs on the server side and can be called from the frontend
 */

async function convertPDFToImages(pdfPath, outputDir = './temp') {
  try {
    console.log(`📄 Converting PDF: ${pdfPath}`);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Convert PDF to images with high DPI
    const convertOptions = {
      density: 200,           // DPI=200 for high quality
      saveFilename: 'page',   // Base filename
      savePath: outputDir,    // Output directory
      format: 'png',         // PNG format for best quality
      singleFile: false,     // One file per page
      page: null,            // Convert all pages
      quality: 100           // Maximum quality
    };

    console.log('🔄 Starting pdf2image conversion...');
    const result = await pdf2image.convert(pdfPath, convertOptions);
    
    console.log(`✅ pdf2image conversion completed: ${result.length} pages`);
    
    const imageData = [];
    
    for (let i = 0; i < result.length; i++) {
      try {
        const imagePath = result[i];
        console.log(`📸 Processing page ${i + 1}: ${imagePath}`);
        
        // Read the image file
        const imageBuffer = fs.readFileSync(imagePath);
        
        // Convert to base64
        const base64Data = imageBuffer.toString('base64');
        
        console.log(`✅ Page ${i + 1} converted to base64, length: ${base64Data.length}`);
        
        imageData.push({
          pageNumber: i + 1,
          base64Data: base64Data,
          size: imageBuffer.length
        });
        
        // Clean up temporary file
        fs.unlinkSync(imagePath);
        
      } catch (pageError) {
        console.error(`❌ Error processing page ${i + 1}:`, pageError);
      }
    }

    // Clean up output directory if empty
    try {
      const files = fs.readdirSync(outputDir);
      if (files.length === 0) {
        fs.rmdirSync(outputDir);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    console.log(`🎉 Successfully converted ${imageData.length} pages to high-quality images`);
    return imageData;

  } catch (error) {
    console.error('❌ Error converting PDF to images:', error);
    throw error;
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node pdf-to-images.js <pdf-file> [output-dir]');
    console.log('Example: node pdf-to-images.js document.pdf ./temp');
    process.exit(1);
  }

  const pdfPath = args[0];
  const outputDir = args[1] || './temp';

  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ PDF file not found: ${pdfPath}`);
    process.exit(1);
  }

  convertPDFToImages(pdfPath, outputDir)
    .then((result) => {
      console.log('📊 Conversion Summary:');
      result.forEach((page, index) => {
        console.log(`  Page ${page.pageNumber}: ${page.size} bytes, ${page.base64Data.length} base64 chars`);
      });
      
      // Save result to JSON file for frontend consumption
      const resultPath = path.join(outputDir, 'conversion-result.json');
      fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
      console.log(`💾 Result saved to: ${resultPath}`);
    })
    .catch((error) => {
      console.error('❌ Conversion failed:', error);
      process.exit(1);
    });
}

module.exports = { convertPDFToImages };
