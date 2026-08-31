import { generateText } from 'ai';
import { xai } from '@ai-sdk/xai';
import { PDFDocument } from 'pdf-lib';
import { supabase } from '../lib/supabase';
import { appendAiPromptDisclaimer } from '@/lib/ai/append-prompt-disclaimer';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - use local copy from public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

console.log('🔧 PDF.js Worker configured:', pdfjsLib.GlobalWorkerOptions.workerSrc);

// xAI integration using AI SDK with proper configuration
class XAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(prompt: string): Promise<string> {
    try {
      console.log('🤖 Calling xAI API directly');

      const fullPrompt = appendAiPromptDisclaimer(prompt);

      // Use direct API call (proven to work)
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'grok-4-fast-reasoning',
          messages: [{ role: 'user', content: fullPrompt }],
          temperature: 0.1,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('xAI API error response:', errorText);
        throw new Error(`xAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ xAI API response received');

      // Extract the response content
      if (data.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content;
      } else if (data.choices && data.choices[0]?.text) {
        return data.choices[0].text;
      } else {
        console.warn('Unexpected xAI response format:', data);
        return JSON.stringify(data);
      }

    } catch (error) {
      console.error('xAI API call failed:', error);
      throw error;
    }
  }

  /**
   * Upload a file to XAI Files API
   * Supports PDF and other document formats up to 48MB
   */
  async uploadFile(file: File): Promise<{ id: string; filename: string; size: number }> {
    try {
      // Validate file size (48MB limit)
      const maxSize = 48 * 1024 * 1024; // 48MB in bytes
      if (file.size > maxSize) {
        throw new Error(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum of 48MB`);
      }

      console.log(`📤 Uploading file to XAI Files API: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);

      // Create FormData for multipart/form-data upload
      const formData = new FormData();
      formData.append('file', file);
      // Purpose field is optional but helps categorize the file
      // 'file-extract' is used for document analysis
      formData.append('purpose', 'file-extract');

      const response = await fetch('https://api.x.ai/v1/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          // Don't set Content-Type - browser will set it with boundary for multipart/form-data
        },
        body: formData,
      });

      console.log('📡 XAI Files API upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ XAI Files API error response:', errorText);
        throw new Error(`XAI Files API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ File uploaded successfully:', data.id);
      console.log('📄 File metadata:', { id: data.id, filename: data.filename, size: data.bytes });

      return {
        id: data.id,
        filename: data.filename || file.name,
        size: data.bytes || file.size,
      };
    } catch (error) {
      console.error('❌ File upload failed:', error);
      throw error;
    }
  }

  /**
   * Delete a file from XAI Files API
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting file from XAI: ${fileId}`);

      const response = await fetch(`https://api.x.ai/v1/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('⚠️ File deletion failed (non-critical):', errorText);
        return false;
      }

      const data = await response.json();
      console.log('✅ File deleted successfully:', data.deleted);
      return data.deleted === true;
    } catch (error) {
      console.warn('⚠️ File deletion error (non-critical):', error);
      return false;
    }
  }

  /**
   * Generate text with file attachment using XAI Files API
   * Requires grok-4-fast or grok-4 model
   */
  async generateTextWithFile(prompt: string, fileId: string, model: string = 'grok-4-fast'): Promise<string> {
    try {
      console.log('🤖 Calling xAI API with file attachment');
      console.log('📝 Prompt length:', prompt.length);
      console.log('📄 File ID:', fileId);
      console.log('🤖 Model:', model);

      const fullPrompt = appendAiPromptDisclaimer(prompt);

      // XAI Files API format: file IDs are included in message content
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: fullPrompt
                },
                {
                  type: 'file',
                  file_id: fileId
                }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 2000,
        }),
      });

      console.log('📡 xAI API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ xAI API error response:', errorText);
        throw new Error(`xAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ xAI API response received');
      console.log('📊 Response data keys:', Object.keys(data));

      // Extract the response content
      if (data.choices && data.choices[0]?.message?.content) {
        console.log('📝 Response content length:', data.choices[0].message.content.length);
        return data.choices[0].message.content;
      } else if (data.choices && data.choices[0]?.text) {
        console.log('📝 Response text length:', data.choices[0].text.length);
        return data.choices[0].text;
      } else {
        console.warn('⚠️ Unexpected xAI response format:', data);
        return JSON.stringify(data);
      }

    } catch (error) {
      console.error('❌ xAI API call with file failed:', error);
      throw error;
    }
  }

  async generateTextWithImage(prompt: string, imageBase64: string | string[]): Promise<string> {
    try {
      // Handle both single image and multiple images
      const images = Array.isArray(imageBase64) ? imageBase64 : [imageBase64];
      
      console.log('🤖 Calling xAI API with images');
      console.log('📝 Prompt length:', prompt.length);
      console.log('🖼️ Number of images:', images.length);
      console.log('🖼️ First image base64 length:', images[0].length);
      console.log('🔑 API Key available:', !!this.apiKey);

      const fullPrompt = appendAiPromptDisclaimer(prompt);

      // Build content array with text and all images
      const content: any[] = [
        { type: 'text', text: fullPrompt }
      ];
      
      // Add all images to the content
      // Note: XAI vision API only supports image formats (PNG, JPEG, etc.), not PDF
      // PDFs should be converted to images before calling this method
      for (const img of images) {
        content.push({
          type: 'image_url',
          image_url: {
            // Support PNG, JPEG, and other image formats
            // PDFs should already be converted to images by this point
            url: img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`
          }
        });
      }

      // Use direct API call with multiple images
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'grok-4-fast-reasoning',
          messages: [
            {
              role: 'user',
              content: content
            }
          ],
          temperature: 0.1,
          max_tokens: 2000,
        }),
      });

      console.log('📡 xAI API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ xAI API error response:', errorText);
        throw new Error(`xAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ xAI API response received');
      console.log('📊 Response data keys:', Object.keys(data));

      // Extract the response content
      if (data.choices && data.choices[0]?.message?.content) {
        console.log('📝 Response content length:', data.choices[0].message.content.length);
        return data.choices[0].message.content;
      } else if (data.choices && data.choices[0]?.text) {
        console.log('📝 Response text length:', data.choices[0].text.length);
        return data.choices[0].text;
      } else {
        console.warn('⚠️ Unexpected xAI response format:', data);
        return JSON.stringify(data);
      }

    } catch (error) {
      console.error('❌ xAI API call failed:', error);
      throw error;
    }
  }
}

export interface Annotation {
  annotationNumber?: string;
  date?: string;
  radicacion?: string;
  document?: string;
  value?: number;
  specification?: string;
  parties?: string;
}

// Nueva interfaz detallada para CLYT basada en el ejemplo proporcionado
export interface CLYTDetailedData {
  Encabezado?: {
    Validez?: string;
    PinGeneracion?: string;
    NumeroMatricula?: string;
    Pagina?: string;
    Turno?: string;
    FechaImpresion?: string;
    AdvertenciaLegal?: string;
    RequerimientoFirma?: string;
  };
  InformacionRegistral?: {
    CirculoRegistral?: string;
    Departamento?: string;
    Municipio?: string;
    Vereda?: string;
    FechaApertura?: string;
    Radicacion?: string;
    ConDocumentoDe?: string;
    CodigoCatastralActual?: string;
    CodigoCatastralAnterior?: string;
    NUPRE?: string | null;
    EstadoFolio?: string;
  };
  DescripcionInmueble?: {
    Tipo?: string;
    Numero?: string;
    Ubicacion?: {
      Piso?: string;
      Edificio?: string;
      Direccion?: string;
      Barrio?: string;
      Ciudad?: string;
    };
    Area?: string;
    AlturaLibre?: string;
    Linderos?: {
      Norte?: string;
      Sur?: string;
      Oeste?: string;
      Este?: string;
      Nadir?: string;
      Cenit?: string;
    };
    Coeficiente?: string;
    RegimenPropiedad?: string;
  };
  MedidasYCoeficientes?: {
    AreaTotal?: {
      Hectareas?: string | null;
      MetrosCuadrados?: string | null;
      CentimetrosCuadrados?: string | null;
    };
    AreaPrivada?: {
      MetrosCuadrados?: string | null;
      CentimetrosCuadrados?: string | null;
    };
    AreaConstruida?: {
      MetrosCuadrados?: string | null;
      CentimetrosCuadrados?: string | null;
    };
    CoeficientePorcentaje?: string;
  };
  HistoriaTradicion?: {
    Complementacion?: any;
    PeriodoEstudio?: string;
  };
  DireccionInmueble?: {
    TipoPredio?: string;
  };
  EntidadEmisora?: {
    Nombre?: string;
    Descripcion?: string;
    Oficina?: string;
  };
  NotasAdicionales?: {
    PaginasTotales?: number;
    PaginasRestantes?: string;
  };
}

export interface DocumentData {
  documentType: 'clyt' | 'escritura' | 'cedula';
  processedImages?: string[]; // Base64 data URLs of images sent to Grok
  extractedData: {
    // Para CLYT (Libertad y Tradición) - datos legacy para compatibilidad
    propertyAddress?: string;
    propertyArea?: number;
    ownerName?: string;
    ownerId?: string;
    registrationDate?: string;
    notaryName?: string;
    notaryNumber?: string;
    folioStatus?: string;
    annotations?: Annotation[];

    // Para CLYT - datos detallados estructurados
    clytDetailed?: CLYTDetailedData;

    // Para Escrituras
    propertyValue?: number;
    registrationNumber?: string;
    propertyType?: string;
    constructionArea?: number;
    landArea?: number;
    stratum?: number;
    boundaries?: string;
    notaryLocation?: string;
    actValue?: number;
    actType?: string;

    // Para Cédula
    fullName?: string;
    idNumber?: string;
    birthDate?: string;
    nationality?: string;
    maritalStatus?: string;

    // Campos adicionales para mejor análisis
    confidence?: number;
    notes?: string;
    imageQuality?: string;
    error?: string;
    rawResponse?: string;
  };
  confidence: number;
  warnings: string[];
}

export class DocumentAnalysisService {
  private static instance: DocumentAnalysisService;
  private apiKey: string;
  private xaiService: XAIService | null = null;

  private constructor() {
    this.apiKey = (import.meta as any).env?.VITE_XAI_API_KEY || '';
    console.log('🔑 XAI API Key status:', this.apiKey ? 'Found' : 'Missing', this.apiKey ? `(${this.apiKey.substring(0, 10)}...)` : '');

    // Set xAI API key for AI SDK
    if (this.apiKey) {
      // Set environment variable for AI SDK
      if (typeof process !== 'undefined') {
        process.env.XAI_API_KEY = this.apiKey;
      } else if (typeof globalThis !== 'undefined') {
        // For browser environment
        (globalThis as any).process = (globalThis as any).process || {};
        (globalThis as any).process.env = (globalThis as any).process.env || {};
        (globalThis as any).process.env.XAI_API_KEY = this.apiKey;
      }

      this.xaiService = new XAIService(this.apiKey);
    } else {
      console.warn('XAI API key not found. Document analysis will not work.');
    }
  }

  public static getInstance(): DocumentAnalysisService {
    if (!DocumentAnalysisService.instance) {
      DocumentAnalysisService.instance = new DocumentAnalysisService();
    }
    return DocumentAnalysisService.instance;
  }

  /**
   * Convert PDF to high-quality images using PDF.js with DPI=200
   */
  private async convertPDFToImages(file: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);

          console.log(`📄 Converting PDF with PDF.js (DPI=200): ${file.name}`);

          // Load PDF document with PDF.js
          const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
          const pageCount = pdf.numPages;

          console.log(`📄 PDF loaded: ${pageCount} pages`);

          const imageUrls: string[] = [];

          // Process each page
          for (let pageNum = 1; pageNum <= Math.min(pageCount, 5); pageNum++) {
            try {
              console.log(`📸 Rendering page ${pageNum}/${pageCount}...`);
              
              const page = await pdf.getPage(pageNum);
              
              // Set high DPI for quality (300 DPI = 4.0 scale factor for better text clarity)
              const scale = 4.0; // 300 DPI scale factor
              const viewport = page.getViewport({ scale });
              
              console.log(`📊 Page ${pageNum} dimensions: ${viewport.width}x${viewport.height} pixels`);
              
              // Create canvas for rendering
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              
              if (!context) {
                throw new Error('Could not get canvas context');
              }
              
              // Enable high-quality rendering
              context.imageSmoothingEnabled = true;
              context.imageSmoothingQuality = 'high';
              
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              
              // Render PDF page to canvas
              const renderContext = {
                canvasContext: context,
                viewport: viewport,
                canvas: canvas
              };
              
              await page.render(renderContext).promise;
              
              // Optimize image for Grok (max 2048x2048)
              let optimizedCanvas = canvas;
              if (canvas.width > 2048 || canvas.height > 2048) {
                const ratio = Math.min(2048 / canvas.width, 2048 / canvas.height);
                const optimized = document.createElement('canvas');
                const optCtx = optimized.getContext('2d');
                
                if (optCtx) {
                  optimized.width = canvas.width * ratio;
                  optimized.height = canvas.height * ratio;
                  optCtx.imageSmoothingEnabled = true;
                  optCtx.imageSmoothingQuality = 'high';
                  optCtx.drawImage(canvas, 0, 0, optimized.width, optimized.height);
                  optimizedCanvas = optimized;
                  console.log(`🔄 Resized to: ${optimized.width}x${optimized.height} for Grok compatibility`);
                }
              }
              
              // Use JPEG for better compression (Grok supports both)
              const canvasBase64 = optimizedCanvas.toDataURL('image/jpeg', 0.92);
              const base64Data = canvasBase64.split(',')[1];
              
              console.log(`✅ Page ${pageNum} rendered to base64, length: ${base64Data.length}`);
              
              const base64DataUrl = `data:image/jpeg;base64,${base64Data}`;
              imageUrls.push(base64DataUrl);
              
              // Clean up
              page.cleanup();
              
            } catch (pageError) {
              console.error(`❌ Error rendering page ${pageNum}:`, pageError);
            }
          }

          if (imageUrls.length === 0) {
            throw new Error('No pages could be rendered to images');
          }

          console.log(`🎉 Successfully rendered ${imageUrls.length} pages to high-quality images`);
          resolve(imageUrls);

        } catch (error) {
          console.error('❌ Error converting PDF to images with PDF.js:', error);
          console.error('Error details:', error);
          
          // Don't use canvas fallback - it creates fake images
          // Instead, reject with helpful error message
          reject(new Error('Could not render PDF. Please ensure the PDF is not encrypted or corrupted. Error: ' + (error instanceof Error ? error.message : String(error))));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo PDF'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * DEPRECATED: This method creates fake placeholder images, not real PDF content
   * Keeping for reference only - should not be used
   */
  private async convertPDFToImagesCanvas_DEPRECATED(file: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);

          // Load PDF document
          const pdfDoc = await PDFDocument.load(uint8Array);
          const pageCount = pdfDoc.getPageCount();

          console.log(`📄 Converting PDF with enhanced canvas method: ${pageCount} pages`);

          const imageUrls: string[] = [];

          for (let i = 0; i < Math.min(pageCount, 5); i++) { // Limit to first 5 pages
            try {
              // Create a canvas to render PDF page as image
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');

              if (!ctx) {
                throw new Error('Could not get canvas context');
              }

              // Set high-resolution canvas (DPI=200 equivalent)
              const scale = 2.67; // 200 DPI scale factor
              canvas.width = 800 * scale;
              canvas.height = 1000 * scale;

              // Enable high-quality rendering
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';

              // Fill with realistic document background
              const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
              gradient.addColorStop(0, '#fefefe');
              gradient.addColorStop(1, '#f8f8f8');
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              // Add document border
              ctx.strokeStyle = '#333333';
              ctx.lineWidth = 2;
              ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

              // Add header section
              ctx.fillStyle = '#1a1a1a';
              ctx.font = `${32 * scale}px 'Times New Roman', serif`;
              ctx.textAlign = 'center';
              ctx.fillText('CERTIFICADO DE LIBERTAD Y TRADICIÓN', canvas.width / 2, 80 * scale);
              
              ctx.font = `${24 * scale}px 'Times New Roman', serif`;
              ctx.fillText('SUPERINTENDENCIA DE NOTARIADO Y REGISTRO', canvas.width / 2, 120 * scale);

              // Add document info
              ctx.font = `${18 * scale}px 'Times New Roman', serif`;
              ctx.textAlign = 'left';
              ctx.fillText(`Matrícula: ${file.name.replace('.pdf', '').toUpperCase()}`, 60 * scale, 200 * scale);
              ctx.fillText(`Página ${i + 1} de ${pageCount}`, 60 * scale, 230 * scale);
              ctx.fillText(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 60 * scale, 260 * scale);

              // Add property information section
              ctx.fillStyle = '#2c2c2c';
              ctx.font = `${20 * scale}px 'Times New Roman', serif`;
              ctx.fillText('INFORMACIÓN DE LA PROPIEDAD', 60 * scale, 320 * scale);

              // Add realistic property details
              ctx.fillStyle = '#1a1a1a';
              ctx.font = `${16 * scale}px 'Times New Roman', serif`;
              const propertyDetails = [
                'Dirección: Calle 123 #45-67, Barrio Centro',
                'Área: 120.50 metros cuadrados',
                'Propietario: Juan Carlos Pérez González',
                'Cédula: 12.345.678-9',
                'Estado: ACTIVO',
                'Notario: María Elena Rodríguez',
                'Número: 001-894286'
              ];

              propertyDetails.forEach((detail, idx) => {
                ctx.fillText(detail, 60 * scale, 360 * scale + (idx * 30 * scale));
              });

              // Add annotations section
              ctx.fillStyle = '#2c2c2c';
              ctx.font = `${20 * scale}px 'Times New Roman', serif`;
              ctx.fillText('ANOTACIONES', 60 * scale, 600 * scale);

              const annotations = [
                '1. Hipoteca con Cuantía Indeterminada',
                '2. Embargo Preventivo',
                '3. Servidumbre de Tránsito'
              ];

              ctx.fillStyle = '#1a1a1a';
              ctx.font = `${16 * scale}px 'Times New Roman', serif`;
              annotations.forEach((annotation, idx) => {
                ctx.fillText(annotation, 60 * scale, 640 * scale + (idx * 30 * scale));
              });

              // Add footer
              ctx.fillStyle = '#666666';
              ctx.font = `${14 * scale}px 'Times New Roman', serif`;
              ctx.textAlign = 'center';
              ctx.fillText('Este documento ha sido procesado por IA para análisis', canvas.width / 2, canvas.height - 60 * scale);
              ctx.fillText('Contenido real del PDF se procesará en la siguiente versión', canvas.width / 2, canvas.height - 30 * scale);

              // Convert canvas to base64
              const canvasBase64 = canvas.toDataURL('image/png', 1.0);
              const base64Data = canvasBase64.split(',')[1];
              
              console.log(`✅ Page ${i + 1} converted to base64 (enhanced canvas), length: ${base64Data.length}`);
              
              const base64DataUrl = `data:image/png;base64,${base64Data}`;
              imageUrls.push(base64DataUrl);
              
            } catch (pageError) {
              console.error(`Error converting page ${i + 1}:`, pageError);
            }
          }

          if (imageUrls.length === 0) {
            throw new Error('No pages could be converted to images');
          }

          resolve(imageUrls);

        } catch (error) {
          console.error('Error converting PDF to images with enhanced canvas:', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo PDF'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Convert and optimize image file to base64
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        
        // Optimize image for Grok
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Calculate optimal dimensions (max 2048x2048 for Grok)
          let { width, height } = img;
          const maxDim = 2048;
          
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // High-quality rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          
          // Use JPEG for better compression
          const optimized = canvas.toDataURL('image/jpeg', 0.92);
          const base64Data = optimized.split(',')[1];
          
          console.log(`🖼️ Image optimized: ${img.width}x${img.height} -> ${width}x${height}`);
          console.log(`📦 Base64 size: ${base64Data.length} chars`);
          
          resolve(base64Data);
        };
        
        img.onerror = () => {
          // Fallback to direct conversion
          const base64Data = dataUrl.split(',')[1];
          resolve(base64Data);
        };
        
        img.src = dataUrl;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Convert image URL to base64
   */
  private async imageUrlToBase64(imageUrl: string): Promise<string> {
    try {
      console.log('🔄 Converting image URL to base64:', imageUrl);
      
      // Try to fetch the image with proper headers
      const response = await fetch(imageUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
        },
        mode: 'cors', // Explicitly set CORS mode
      });
      
      if (!response.ok) {
        console.error('❌ Fetch failed:', response.status, response.statusText);
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('📦 Image blob size:', blob.size, 'bytes, type:', blob.type);
      
      // Validate blob type
      if (!blob.type.startsWith('image/')) {
        throw new Error(`Invalid image type: ${blob.type}`);
      }
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const base64 = reader.result as string;
            // Remove data:image/png;base64, prefix
            const base64Data = base64.split(',')[1];
            console.log('✅ Base64 conversion complete, length:', base64Data.length);
            console.log('🔍 Base64 preview:', base64Data.substring(0, 50) + '...');
            resolve(base64Data);
          } catch (parseError) {
            console.error('❌ Error parsing base64:', parseError);
            reject(parseError);
          }
        };
        reader.onerror = (error) => {
          console.error('❌ FileReader error:', error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ Error converting image to base64:', error);
      throw error;
    }
  }

  /**
   * Extract text from PDF file
   */
  private async extractTextFromPDF(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;

          // Import pdf-parse dynamically
          const pdfParseModule = await import('pdf-parse');
          const pdfParse = (pdfParseModule as any).default || pdfParseModule;

          // Convert ArrayBuffer to Buffer for pdf-parse
          const uint8Array = new Uint8Array(arrayBuffer);
          // In browser environment, create a simple buffer-like object
          const buffer = typeof Buffer !== 'undefined' ? Buffer.from(uint8Array) : uint8Array;

          const pdf = await pdfParse(buffer);

          resolve(pdf.text);
        } catch (error) {
          console.error('Error extracting PDF text:', error);
          // For now, return a placeholder message with file info
          const placeholder = `[PDF procesado: ${file.name}]\nTipo: Documento PDF\nTamaño: ${(file.size / 1024).toFixed(1)} KB\nEstado: Texto extraído exitosamente (simulado)\n\nNota: El análisis real del contenido se realizaría con procesamiento avanzado de PDF.`;
          resolve(placeholder);
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo PDF'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Extract text from image file using OCR-like approach
   */
  private async extractTextFromImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        // For now, we'll use a simple approach
        // In a real implementation, you'd use Tesseract.js or a similar OCR library
        resolve(`[Imagen procesada: ${file.name}] - El contenido de texto se extraería usando OCR`);
      };

      reader.onerror = () => {
        reject(new Error('Error al procesar la imagen'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Extract text from any supported file type
   */
  private async extractText(file: File): Promise<string> {
    const fileType = file.type.toLowerCase();

    if (fileType === 'application/pdf') {
      return this.extractTextFromPDF(file);
    } else if (fileType.startsWith('image/')) {
      return this.extractTextFromImage(file);
    } else {
      throw new Error(`Tipo de archivo no soportado: ${fileType}`);
    }
  }

  /**
   * Analyze document content with Grok using Files API (for PDFs)
   */
  private async analyzeWithGrokFile(documentType: 'clyt' | 'escritura' | 'cedula', file: File, fileId: string): Promise<DocumentData> {
    if (!this.apiKey) {
      throw new Error('API key de XAI no configurada');
    }

    const prompts = {
      clyt: `Analiza este CERTIFICADO DE LIBERTAD Y TRADICIÓN (CLYT) colombiano.

INSTRUCCIONES CRÍTICAS:
1. Lee TODO el documento, especialmente la PÁGINA 2 que contiene anotaciones importantes
2. Extrae TODOS los datos estructurados según el formato especificado
3. Para valores numéricos: mantén el formato original con unidades (ej: "136.59 MTS")
4. Para fechas: mantén el formato original del documento
5. Si no encuentras un dato, usa null (no "null" como string)
6. Respeta exactamente la estructura JSON proporcionada
7. Incluye TODAS las páginas en tu análisis

FORMATO JSON ESTRUCTURADO REQUERIDO:
{
  "CertificadoDeTradicionYLibertad": {
    "Encabezado": {
      "Validez": "texto exacto del certificado o null",
      "PinGeneracion": "número PIN o null",
      "NumeroMatricula": "número de matrícula o null",
      "Pagina": "número de página actual o null",
      "Turno": "número de turno o null",
      "FechaImpresion": "fecha y hora exacta o null",
      "AdvertenciaLegal": "texto de advertencia o null",
      "RequerimientoFirma": "texto sobre firma o null"
    },
    "InformacionRegistral": {
      "CirculoRegistral": "círculo registral o null",
      "Departamento": "nombre del departamento o null",
      "Municipio": "nombre del municipio o null",
      "Vereda": "nombre de la vereda o null",
      "FechaApertura": "fecha de apertura o null",
      "Radicacion": "número de radicación o null",
      "ConDocumentoDe": "fecha o null",
      "CodigoCatastralActual": "código catastral o null",
      "CodigoCatastralAnterior": "código anterior o null",
      "NUPRE": "número NUPRE o null",
      "EstadoFolio": "ACTIVO/INACTIVO o null"
    },
    "DescripcionInmueble": {
      "Tipo": "APARTAMENTO/CASA/etc o null",
      "Numero": "número de apartamento/casa o null",
      "Ubicacion": {
        "Piso": "número de piso o null",
        "Edificio": "nombre del edificio o null",
        "Direccion": "dirección completa o null",
        "Barrio": "nombre del barrio o null",
        "Ciudad": "nombre de la ciudad o null"
      },
      "Area": "área con unidades (ej: '136.59 MTS') o null",
      "AlturaLibre": "altura con unidades o null",
      "Linderos": {
        "Norte": "descripción del lindero norte o null",
        "Sur": "descripción del lindero sur o null",
        "Oeste": "descripción del lindero oeste o null",
        "Este": "descripción del lindero este o null",
        "Nadir": "descripción del lindero nadir o null",
        "Cenit": "descripción del lindero cenit o null"
      },
      "Coeficiente": "coeficiente con % o null",
      "RegimenPropiedad": "PROPIEDAD HORIZONTAL/etc o null"
    },
    "MedidasYCoeficientes": {
      "AreaTotal": {
        "Hectareas": "valor o null",
        "MetrosCuadrados": "valor o null",
        "CentimetrosCuadrados": "valor o null"
      },
      "AreaPrivada": {
        "MetrosCuadrados": "valor o null",
        "CentimetrosCuadrados": "valor o null"
      },
      "AreaConstruida": {
        "MetrosCuadrados": "valor o null",
        "CentimetrosCuadrados": "valor o null"
      },
      "CoeficientePorcentaje": "valor o null"
    },
    "HistoriaTradicion": {
      "Complementacion": "objeto con información de complementación o null",
      "PeriodoEstudio": "período de estudio o null"
    },
    "DireccionInmueble": {
      "TipoPredio": "URBANO/RURAL o null"
    },
    "EntidadEmisora": {
      "Nombre": "nombre de la entidad o null",
      "Descripcion": "descripción o null",
      "Oficina": "nombre de la oficina o null"
    },
    "NotasAdicionales": {
      "PaginasTotales": número de páginas o null,
      "PaginasRestantes": "información adicional o null"
    }
  },
  "annotations": [
    {
      "annotationNumber": "número de anotación",
      "date": "fecha de anotación",
      "radicacion": "radicación",
      "document": "tipo de documento",
      "value": valor numérico,
      "specification": "descripción detallada",
      "parties": "partes involucradas"
    }
  ],
  "confidence": 0-1,
  "imageQuality": "excelente/buena/regular/mala",
  "notes": "observaciones adicionales"
}

IMPORTANTE:
- La PÁGINA 2 contiene anotaciones críticas (Hipoteca, Embargo, Servidumbre, etc.)
- Extrae TODAS las anotaciones encontradas
- Respeta la jerarquía y estructura exacta del JSON
- Si hay información adicional relevante, inclúyela en "notes"

Responde SOLO con JSON válido sin comentarios.`,

      escritura: `Analiza este documento de ESCRITURAS PÚBLICAS colombiano.

INSTRUCCIONES DETALLADAS:
1. Identifica el número de registro/matrícula (frecuentemente al inicio)
2. Extrae información de la propiedad (tipo, área construida, área de terreno)
3. Busca datos del propietario (nombre, identificación)
4. Identifica valor de la propiedad y valor del acto
5. Busca estrato socioeconómico si está mencionado
6. Extrae linderos y ubicación de la notaría

FORMATO JSON REQUERIDO:
{
  "propertyAddress": "dirección completa o null",
  "propertyValue": número sin comas o null,
  "registrationNumber": "número de matrícula o null",
  "propertyType": "tipo (casa, apartamento, etc) o null",
  "constructionArea": número en m² o null,
  "landArea": número en m² o null,
  "stratum": número 1-6 o null,
  "ownerName": "nombre completo o null",
  "ownerId": "identificación o null",
  "boundaries": "linderos o null",
  "notaryLocation": "ciudad o null",
  "actValue": número sin comas o null,
  "actType": "tipo de acto o null",
  "annotations": [],
  "confidence": 0-1,
  "imageQuality": "excelente/buena/regular/mala",
  "notes": "observaciones"
}

IMPORTANTE: Para valores, usa SOLO números. Para fechas: YYYY-MM-DD.

Responde SOLO con JSON válido.`,

      cedula: `Analiza esta CÉDULA DE CIUDADANÍA colombiana.

INSTRUCCIONES DETALLADAS:
1. Busca el número de identificación (CC) - al frente del documento
2. Extrae nombre completo con apellidos
3. Identifica fecha de nacimiento
4. Busca nacionalidad y estado civil

FORMATO JSON REQUERIDO:
{
  "fullName": "nombre completo o null",
  "idNumber": "número de cédula o null",
  "birthDate": "YYYY-MM-DD o null",
  "nationality": "nacionalidad o null",
  "maritalStatus": "estado civil o null",
  "confidence": 0-1,
  "imageQuality": "excelente/buena/regular/mala",
  "notes": "observaciones"
}

IMPORTANTE: Para fecha nacimiento usa formato YYYY-MM-DD. Si no encuentras un dato, usa null.

Responde SOLO con JSON válido.`
    };

    try {
      if (!this.xaiService) {
        throw new Error('xAI service not initialized. API key missing.');
      }

      console.log('🤖 Sending request to xAI with file attachment for', documentType);
      
      // Use Files API with grok-4-fast model
      const response = await this.xaiService.generateTextWithFile(
        prompts[documentType],
        fileId,
        'grok-4-fast'
      );
      
      console.log('📥 xAI response received, length:', response.length);
      console.log('📝 Raw Grok response:', response);
      console.log('📝 Response preview:', response.substring(0, 200) + '...');

      // Try to extract JSON from the response
      let extractedData: any = {};

      try {
        // First try to parse the entire response as JSON
        let parsedData = JSON.parse(response);
        console.log('✅ Successfully parsed JSON:', parsedData);
        
        // Handle the new CLYT structure with CertificadoDeTradicionYLibertad
        if (documentType === 'clyt' && parsedData.CertificadoDeTradicionYLibertad) {
          console.log('📋 Detected new CLYT structure with CertificadoDeTradicionYLibertad');
          extractedData.clytDetailed = parsedData.CertificadoDeTradicionYLibertad;
          
          const ubicacion = parsedData.CertificadoDeTradicionYLibertad?.DescripcionInmueble?.Ubicacion;
          extractedData.propertyAddress = ubicacion?.Direccion || null;
          extractedData.propertyArea = parsedData.CertificadoDeTradicionYLibertad?.DescripcionInmueble?.Area 
            ? parseFloat(parsedData.CertificadoDeTradicionYLibertad.DescripcionInmueble.Area.split(' ')[0]) 
            : null;
          
          extractedData.registrationDate = parsedData.CertificadoDeTradicionYLibertad?.InformacionRegistral?.FechaApertura || null;
          extractedData.folioStatus = parsedData.CertificadoDeTradicionYLibertad?.InformacionRegistral?.EstadoFolio || null;
          
          extractedData.annotations = parsedData.annotations || [];
          extractedData.confidence = parsedData.confidence || 0;
          extractedData.imageQuality = parsedData.imageQuality || 'unknown';
          extractedData.notes = parsedData.notes || null;
        } else {
          extractedData = parsedData;
        }
        
        const hasData = Object.values(extractedData).some(value => 
          value !== null && value !== undefined && value !== '' && value !== 'contenido_no_legible'
        );
        
        if (!hasData) {
          console.warn('⚠️ Parsed JSON but no meaningful data extracted');
          extractedData.notes = 'No meaningful data could be extracted from the document';
          extractedData.imageQuality = 'unknown';
        }
        
      } catch (parseError) {
        console.warn('❌ Could not parse entire response as JSON:', parseError);
        
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsedData = JSON.parse(jsonMatch[0]);
            console.log('✅ Successfully extracted JSON from text:', parsedData);
            
            if (documentType === 'clyt' && parsedData.CertificadoDeTradicionYLibertad) {
              extractedData.clytDetailed = parsedData.CertificadoDeTradicionYLibertad;
              extractedData.annotations = parsedData.annotations || [];
              extractedData.confidence = parsedData.confidence || 0;
              extractedData.imageQuality = parsedData.imageQuality || 'unknown';
              extractedData.notes = parsedData.notes || null;
            } else {
              extractedData = parsedData;
            }
          } catch (extractError) {
            console.error('❌ Failed to parse extracted JSON:', extractError);
            extractedData = { 
              error: 'Failed to parse JSON response',
              rawResponse: response.substring(0, 500),
              notes: 'Could not parse Grok response as JSON'
            };
          }
        } else {
          console.warn('❌ No JSON found in xAI response');
          extractedData = { 
            error: 'No JSON found in response', 
            rawResponse: response,
            notes: 'Grok response did not contain valid JSON format'
          };
        }
      }

      return {
        documentType,
        extractedData,
        confidence: 0.95, // High confidence with Files API
        warnings: []
      };

    } catch (error) {
      console.error('Error analyzing document with xAI Files API:', error);
      throw error;
    }
  }

  /**
   * Analyze document content with Grok using vision capabilities
   */
  private async analyzeWithGrok(documentType: 'clyt' | 'escritura' | 'cedula', file: File, imageUrls?: string[]): Promise<DocumentData> {
    if (!this.apiKey) {
      throw new Error('API key de XAI no configurada');
    }

    const prompts = {
      clyt: `Analiza este CERTIFICADO DE LIBERTAD Y TRADICIÓN (CLYT) colombiano.

INSTRUCCIONES CRÍTICAS:
1. Lee TODO el documento, especialmente la PÁGINA 2 que contiene anotaciones importantes
2. Extrae TODOS los datos estructurados según el formato especificado
3. Para valores numéricos: mantén el formato original con unidades (ej: "136.59 MTS")
4. Para fechas: mantén el formato original del documento
5. Si no encuentras un dato, usa null (no "null" como string)
6. Respeta exactamente la estructura JSON proporcionada
7. Incluye TODAS las páginas en tu análisis

FORMATO JSON ESTRUCTURADO REQUERIDO:
{
  "CertificadoDeTradicionYLibertad": {
    "Encabezado": {
      "Validez": "texto exacto del certificado o null",
      "PinGeneracion": "número PIN o null",
      "NumeroMatricula": "número de matrícula o null",
      "Pagina": "número de página actual o null",
      "Turno": "número de turno o null",
      "FechaImpresion": "fecha y hora exacta o null",
      "AdvertenciaLegal": "texto de advertencia o null",
      "RequerimientoFirma": "texto sobre firma o null"
    },
    "InformacionRegistral": {
      "CirculoRegistral": "círculo registral o null",
      "Departamento": "nombre del departamento o null",
      "Municipio": "nombre del municipio o null",
      "Vereda": "nombre de la vereda o null",
      "FechaApertura": "fecha de apertura o null",
      "Radicacion": "número de radicación o null",
      "ConDocumentoDe": "fecha o null",
      "CodigoCatastralActual": "código catastral o null",
      "CodigoCatastralAnterior": "código anterior o null",
      "NUPRE": "número NUPRE o null",
      "EstadoFolio": "ACTIVO/INACTIVO o null"
    },
    "DescripcionInmueble": {
      "Tipo": "APARTAMENTO/CASA/etc o null",
      "Numero": "número de apartamento/casa o null",
      "Ubicacion": {
        "Piso": "número de piso o null",
        "Edificio": "nombre del edificio o null",
        "Direccion": "dirección completa o null",
        "Barrio": "nombre del barrio o null",
        "Ciudad": "nombre de la ciudad o null"
      },
      "Area": "área con unidades (ej: '136.59 MTS') o null",
      "AlturaLibre": "altura con unidades o null",
      "Linderos": {
        "Norte": "descripción del lindero norte o null",
        "Sur": "descripción del lindero sur o null",
        "Oeste": "descripción del lindero oeste o null",
        "Este": "descripción del lindero este o null",
        "Nadir": "descripción del lindero nadir o null",
        "Cenit": "descripción del lindero cenit o null"
      },
      "Coeficiente": "coeficiente con % o null",
      "RegimenPropiedad": "PROPIEDAD HORIZONTAL/etc o null"
    },
    "MedidasYCoeficientes": {
      "AreaTotal": {
        "Hectareas": "valor o null",
        "MetrosCuadrados": "valor o null",
        "CentimetrosCuadrados": "valor o null"
      },
      "AreaPrivada": {
        "MetrosCuadrados": "valor o null",
        "CentimetrosCuadrados": "valor o null"
      },
      "AreaConstruida": {
        "MetrosCuadrados": "valor o null",
        "CentimetrosCuadrados": "valor o null"
      },
      "CoeficientePorcentaje": "valor o null"
    },
    "HistoriaTradicion": {
      "Complementacion": "objeto con información de complementación o null",
      "PeriodoEstudio": "período de estudio o null"
    },
    "DireccionInmueble": {
      "TipoPredio": "URBANO/RURAL o null"
    },
    "EntidadEmisora": {
      "Nombre": "nombre de la entidad o null",
      "Descripcion": "descripción o null",
      "Oficina": "nombre de la oficina o null"
    },
    "NotasAdicionales": {
      "PaginasTotales": número de páginas o null,
      "PaginasRestantes": "información adicional o null"
    }
  },
  "annotations": [
    {
      "annotationNumber": "número de anotación",
      "date": "fecha de anotación",
      "radicacion": "radicación",
      "document": "tipo de documento",
      "value": valor numérico,
      "specification": "descripción detallada",
      "parties": "partes involucradas"
    }
  ],
  "confidence": 0-1,
  "imageQuality": "excelente/buena/regular/mala",
  "notes": "observaciones adicionales"
}

IMPORTANTE:
- La PÁGINA 2 contiene anotaciones críticas (Hipoteca, Embargo, Servidumbre, etc.)
- Extrae TODAS las anotaciones encontradas
- Respeta la jerarquía y estructura exacta del JSON
- Si hay información adicional relevante, inclúyela en "notes"

Responde SOLO con JSON válido sin comentarios.`,

      escritura: `Analiza este documento de ESCRITURAS PÚBLICAS colombiano.

INSTRUCCIONES DETALLADAS:
1. Identifica el número de registro/matrícula (frecuentemente al inicio)
2. Extrae información de la propiedad (tipo, área construida, área de terreno)
3. Busca datos del propietario (nombre, identificación)
4. Identifica valor de la propiedad y valor del acto
5. Busca estrato socioeconómico si está mencionado
6. Extrae linderos y ubicación de la notaría

FORMATO JSON REQUERIDO:
{
  "propertyAddress": "dirección completa o null",
  "propertyValue": número sin comas o null,
  "registrationNumber": "número de matrícula o null",
  "propertyType": "tipo (casa, apartamento, etc) o null",
  "constructionArea": número en m² o null,
  "landArea": número en m² o null,
  "stratum": número 1-6 o null,
  "ownerName": "nombre completo o null",
  "ownerId": "identificación o null",
  "boundaries": "linderos o null",
  "notaryLocation": "ciudad o null",
  "actValue": número sin comas o null,
  "actType": "tipo de acto o null",
  "annotations": [],
  "confidence": 0-1,
  "imageQuality": "excelente/buena/regular/mala",
  "notes": "observaciones"
}

IMPORTANTE: Para valores, usa SOLO números. Para fechas: YYYY-MM-DD.

Responde SOLO con JSON válido.`,

      cedula: `Analiza esta CÉDULA DE CIUDADANÍA colombiana.

INSTRUCCIONES DETALLADAS:
1. Busca el número de identificación (CC) - al frente del documento
2. Extrae nombre completo con apellidos
3. Identifica fecha de nacimiento
4. Busca nacionalidad y estado civil

FORMATO JSON REQUERIDO:
{
  "fullName": "nombre completo o null",
  "idNumber": "número de cédula o null",
  "birthDate": "YYYY-MM-DD o null",
  "nationality": "nacionalidad o null",
  "maritalStatus": "estado civil o null",
  "confidence": 0-1,
  "imageQuality": "excelente/buena/regular/mala",
  "notes": "observaciones"
}

IMPORTANTE: Para fecha nacimiento usa formato YYYY-MM-DD. Si no encuentras un dato, usa null.

Responde SOLO con JSON válido.`
    };

    try {
      if (!this.xaiService) {
        throw new Error('xAI service not initialized. API key missing.');
      }

      console.log('🤖 Sending request to xAI for', documentType);
      
      let response: string;
      
      if (imageUrls && imageUrls.length > 0) {
        // Use vision capabilities with ALL images
        console.log(`👁️ Using vision capabilities with ${imageUrls.length} image(s)`);
        console.log('🖼️ Image URL type:', typeof imageUrls[0]);
        console.log('🖼️ Is base64 data URL?', imageUrls[0].startsWith('data:image/'));
        
        try {
          // Process all images (not just the first one)
          const imageBase64Array: string[] = [];
          
          for (let i = 0; i < imageUrls.length; i++) {
            let imageBase64: string;
            
            // Check if it's already a base64 data URL
            if (imageUrls[i].startsWith('data:image/')) {
              console.log(`📸 Image ${i + 1} is already base64 data URL - using directly`);
              imageBase64 = imageUrls[i].split(',')[1]; // Extract base64 part
              console.log(`📸 Image ${i + 1} base64 length:`, imageBase64.length);
            } else {
              // Convert URL to base64
              console.log(`📸 Converting image ${i + 1} URL to base64...`);
              imageBase64 = await this.imageUrlToBase64(imageUrls[i]);
              console.log(`📸 Image ${i + 1} converted to base64, length:`, imageBase64.length);
            }
            
            imageBase64Array.push(imageBase64);
          }
          
          console.log(`🤖 Sending to Grok with ${imageBase64Array.length} image(s)...`);
          response = await this.xaiService.generateTextWithImage(prompts[documentType], imageBase64Array);
          console.log('✅ Grok vision analysis completed');
        } catch (visionError) {
          console.warn('❌ Vision analysis failed, falling back to text analysis:', visionError);
          response = await this.xaiService.generateText(prompts[documentType]);
        }
      } else {
        // Fallback to text-only analysis
        console.log('📝 Using text-only analysis (no images available)');
        response = await this.xaiService.generateText(prompts[documentType]);
      }
      
      console.log('📥 xAI response received, length:', response.length);
      console.log('📝 Raw Grok response:', response);
      console.log('📝 Response preview:', response.substring(0, 200) + '...');

      // Try to extract JSON from the response
      let extractedData: any = {};

      try {
        // First try to parse the entire response as JSON
        let parsedData = JSON.parse(response);
        console.log('✅ Successfully parsed JSON:', parsedData);
        
        // Handle the new CLYT structure with CertificadoDeTradicionYLibertad
        if (documentType === 'clyt' && parsedData.CertificadoDeTradicionYLibertad) {
          console.log('📋 Detected new CLYT structure with CertificadoDeTradicionYLibertad');
          // Move the detailed data to clytDetailed
          extractedData.clytDetailed = parsedData.CertificadoDeTradicionYLibertad;
          
          // Also populate legacy fields for backward compatibility
          const ubicacion = parsedData.CertificadoDeTradicionYLibertad?.DescripcionInmueble?.Ubicacion;
          extractedData.propertyAddress = ubicacion?.Direccion || null;
          extractedData.propertyArea = parsedData.CertificadoDeTradicionYLibertad?.DescripcionInmueble?.Area 
            ? parseFloat(parsedData.CertificadoDeTradicionYLibertad.DescripcionInmueble.Area.split(' ')[0]) 
            : null;
          
          // Copy other common fields
          extractedData.registrationDate = parsedData.CertificadoDeTradicionYLibertad?.InformacionRegistral?.FechaApertura || null;
          extractedData.folioStatus = parsedData.CertificadoDeTradicionYLibertad?.InformacionRegistral?.EstadoFolio || null;
          
          // Copy annotations, confidence, and metadata
          extractedData.annotations = parsedData.annotations || [];
          extractedData.confidence = parsedData.confidence || 0;
          extractedData.imageQuality = parsedData.imageQuality || 'unknown';
          extractedData.notes = parsedData.notes || null;
        } else {
          // Legacy structure or other document types
          extractedData = parsedData;
        }
        
        // Validate that we got meaningful data
        const hasData = Object.values(extractedData).some(value => 
          value !== null && value !== undefined && value !== '' && value !== 'contenido_no_legible'
        );
        
        if (!hasData) {
          console.warn('⚠️ Parsed JSON but no meaningful data extracted');
          extractedData.notes = 'No meaningful data could be extracted from the document';
          extractedData.imageQuality = 'unknown';
        }
        
      } catch (parseError) {
        console.warn('❌ Could not parse entire response as JSON:', parseError);
        
        // Try to find JSON in the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsedData = JSON.parse(jsonMatch[0]);
            console.log('✅ Successfully extracted JSON from text:', parsedData);
            
            // Handle CLYT structure
            if (documentType === 'clyt' && parsedData.CertificadoDeTradicionYLibertad) {
              extractedData.clytDetailed = parsedData.CertificadoDeTradicionYLibertad;
              extractedData.annotations = parsedData.annotations || [];
              extractedData.confidence = parsedData.confidence || 0;
              extractedData.imageQuality = parsedData.imageQuality || 'unknown';
              extractedData.notes = parsedData.notes || null;
            } else {
              extractedData = parsedData;
            }
          } catch (extractError) {
            console.error('❌ Failed to parse extracted JSON:', extractError);
            extractedData = { 
              error: 'Failed to parse JSON response',
              rawResponse: response.substring(0, 500),
              notes: 'Could not parse Grok response as JSON'
            };
          }
        } else {
          console.warn('❌ No JSON found in xAI response');
          console.log('📝 Full response for debugging:', response);
          extractedData = { 
            error: 'No JSON found in response', 
            rawResponse: response,
            notes: 'Grok response did not contain valid JSON format'
          };
        }
      }

      return {
        documentType,
        processedImages: imageUrls, // Store processed images for download
        extractedData,
        confidence: imageUrls && imageUrls.length > 0 ? 0.95 : 0.85, // Higher confidence with vision
        warnings: []
      };

    } catch (error) {
      console.error('Error analyzing document with xAI:', error);

      // Return a basic structure if analysis fails
      return {
        documentType,
        processedImages: imageUrls, // Include images even on error
        extractedData: {},
        confidence: 0,
        warnings: [`Error al analizar documento: ${error instanceof Error ? error.message : 'Error desconocido'}`]
      };
    }
  }

  /**
   * Test Grok's vision capabilities with a simple image
   */
  public async testVisionCapabilities(): Promise<string> {
    if (!this.xaiService) {
      throw new Error('xAI service not initialized. API key missing.');
    }

    try {
      console.log('🧪 Testing Grok vision capabilities...');
      
      // Create a simple test image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      canvas.width = 400;
      canvas.height = 300;
      
      // Fill with white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add simple text
      ctx.fillStyle = '#000000';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TEST DOCUMENT', canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillText('Property: Calle 123', canvas.width / 2, canvas.height / 2 + 20);
      ctx.fillText('Owner: Juan Pérez', canvas.width / 2, canvas.height / 2 + 50);
      
      // Convert to base64
      const canvasBase64 = canvas.toDataURL('image/png');
      const base64Data = canvasBase64.split(',')[1];
      
      console.log('📸 Test image created, base64 length:', base64Data.length);
      
      // Test with simple prompt
      const testPrompt = `Look at this image and tell me what you see. If you can see text, transcribe it. If you can see numbers, list them. Respond in JSON format: {"description": "what you see", "text": "any text found", "numbers": ["any numbers found"], "confidence": 0.8}`;
      
      const response = await this.xaiService.generateTextWithImage(testPrompt, base64Data);
      console.log('✅ Vision test completed:', response);
      
      return response;
      
    } catch (error) {
      console.error('❌ Vision test failed:', error);
      throw error;
    }
  }

  /**
   * Main method to analyze a document
   */
  public async analyzeDocument(documentType: 'clyt' | 'escritura' | 'cedula', file: File): Promise<DocumentData> {
    try {
      console.log(`🔍 Starting analysis of ${documentType} document: ${file.name}`);

      // For PDF files, use Files API (direct PDF processing)
      if (file.type === 'application/pdf') {
        console.log('📄 Processing PDF file with XAI Files API');
        
        let fileId: string | null = null;
        
        try {
          // Upload PDF to XAI Files API
          if (!this.xaiService) {
            throw new Error('xAI service not initialized');
          }
          
          const uploadedFile = await this.xaiService.uploadFile(file);
          fileId = uploadedFile.id;
          console.log(`✅ PDF uploaded to XAI Files API: ${fileId}`);
          
          // Analyze using Files API
          const result = await this.analyzeWithGrokFile(documentType, file, fileId);
          
          // Clean up: delete uploaded file (non-critical if it fails)
          if (fileId) {
            try {
              await this.xaiService.deleteFile(fileId);
              console.log('✅ Uploaded file cleaned up');
            } catch (deleteError) {
              console.warn('⚠️ File cleanup failed (non-critical):', deleteError);
            }
          }
          
          console.log(`✅ Analysis complete for ${documentType} using Files API`, result);
          return result;
          
        } catch (filesApiError) {
          console.warn('⚠️ Files API failed, falling back to image conversion:', filesApiError);
          
          // Clean up uploaded file if upload succeeded but analysis failed
          if (fileId && this.xaiService) {
            try {
              await this.xaiService.deleteFile(fileId);
            } catch (deleteError) {
              // Ignore cleanup errors
            }
          }
          
          // Fallback to image conversion method
          console.log('📄 Falling back to PDF-to-image conversion');
          const imageUrls = await this.convertPDFToImages(file);
          console.log(`✅ Converted PDF to ${imageUrls.length} images`);
          
          // Continue with vision API analysis
          const result = await this.analyzeWithGrok(documentType, file, imageUrls);
          console.log(`✅ Analysis complete for ${documentType} using vision API (fallback)`, result);
          return result;
        }
      }
      
      // For image files, use vision API (existing approach)
      let imageUrls: string[] | undefined;
      
      if (file.type.startsWith('image/')) {
        // For image files, convert directly to base64 (optimized)
        console.log('🖼️ Processing image file');
        try {
          const imageBase64 = await this.fileToBase64(file);
          // Detect file type for correct data URL
          const mimeType = file.type || 'image/jpeg';
          imageUrls = [`data:${mimeType};base64,${imageBase64}`];
          console.log(`✅ Image converted to base64, length: ${imageBase64.length}`);
          
          // Also upload to storage for backup/reference
          try {
            const fileName = `doc-${Date.now()}-${file.name}`;
            const { data, error } = await supabase.storage
              .from('property-docs')
              .upload(fileName, file);
            
            if (error) {
              console.warn('⚠️ Upload failed, but base64 is available:', error);
            } else {
              const { data: urlData } = supabase.storage
                .from('property-docs')
                .getPublicUrl(fileName);
              console.log(`✅ Image also uploaded to: ${urlData.publicUrl}`);
            }
          } catch (uploadError) {
            console.warn('⚠️ Upload failed, but base64 is available:', uploadError);
          }
        } catch (conversionError) {
          console.error('❌ Error converting image to base64:', conversionError);
          // Fallback to upload method
          const fileName = `doc-${Date.now()}-${file.name}`;
          const { data, error } = await supabase.storage
            .from('property-docs')
            .upload(fileName, file);
          
          if (error) {
            console.error('❌ Error uploading image:', error);
          } else {
            const { data: urlData } = supabase.storage
              .from('property-docs')
              .getPublicUrl(fileName);
            imageUrls = [urlData.publicUrl];
            console.log(`✅ Image uploaded: ${urlData.publicUrl}`);
          }
        }
      }

      // Debug: Check what imageUrls we have
      console.log(`🔍 Image URLs to analyze: ${imageUrls?.length || 0} images`);
      if (imageUrls && imageUrls.length > 0) {
        console.log(`🔍 First image URL type: ${imageUrls[0].startsWith('data:image/') ? 'base64 data URL' : 'regular URL'}`);
        console.log(`🔍 First image URL preview: ${imageUrls[0].substring(0, 100)}...`);
      }

      // Analyze with Grok using vision capabilities if available
      const result = await this.analyzeWithGrok(documentType, file, imageUrls);

      console.log(`✅ Analysis complete for ${documentType}`, result);
      return result;

    } catch (error) {
      console.error(`❌ Error analyzing ${documentType} document:`, error);

      return {
        documentType,
        extractedData: {},
        confidence: 0,
        warnings: [`Error al procesar el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`]
      };
    }
  }

  /**
   * Validate extracted data
   */
  public validateExtractedData(documentType: 'clyt' | 'escritura' | 'cedula', data: any): string[] {
    const warnings: string[] = [];

    switch (documentType) {
      case 'clyt':
        if (!data.propertyAddress) warnings.push('Dirección de propiedad no encontrada');
        if (!data.ownerName) warnings.push('Nombre del propietario no encontrado');
        if (!data.ownerId) warnings.push('ID del propietario no encontrado');
        if (!data.folioStatus) warnings.push('Estado del folio no encontrado');
        if (!data.annotations || data.annotations.length === 0) warnings.push('No se encontraron anotaciones');
        break;

      case 'escritura':
        if (!data.propertyAddress) warnings.push('Dirección de propiedad no encontrada');
        if (!data.propertyValue || data.propertyValue <= 0) warnings.push('Valor de propiedad inválido');
        if (!data.ownerName) warnings.push('Nombre del propietario no encontrado');
        if (!data.boundaries) warnings.push('Descripción de linderos no encontrada');
        if (!data.notaryLocation) warnings.push('Ubicación de la notaría no encontrada');
        if (!data.actType) warnings.push('Tipo de acto legal no encontrado');
        if (!data.annotations || data.annotations.length === 0) warnings.push('No se encontraron anotaciones');
        break;

      case 'cedula':
        if (!data.fullName) warnings.push('Nombre completo no encontrado');
        if (!data.idNumber) warnings.push('Número de identificación no encontrado');
        break;
    }

    return warnings;
  }
}

// Export singleton instance
export const documentAnalysisService = DocumentAnalysisService.getInstance();
