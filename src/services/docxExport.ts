import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

export type PromesaTemplateData = {
  seller_name: string;
  buyer_name: string;
  property_address: string;
  city: string;
  price: string;
  closing_date: string;
};

export async function exportPromesaDocx(data: PromesaTemplateData) {
  console.log('📄 [docxExport] Starting DOCX export with data:', data);

  const templateUrl = '/templates/promesa_co.docx';
  console.log('📂 [docxExport] Template URL:', templateUrl);

  try {
    console.log('🌐 [docxExport] Fetching template...');
    const res = await fetch(templateUrl);

    if (!res.ok) {
      console.error('❌ [docxExport] Failed to fetch template, status:', res.status, res.statusText);
      throw new Error('No se pudo cargar la plantilla DOCX');
    }

    console.log('✅ [docxExport] Template fetched successfully, size:', res.headers.get('content-length'));

    const arrayBuffer = await res.arrayBuffer();
    console.log('📦 [docxExport] Template loaded into ArrayBuffer, size:', arrayBuffer.byteLength);

    console.log('🗜️ [docxExport] Creating PizZip instance...');
    const zip = new PizZip(arrayBuffer);

    console.log('📝 [docxExport] Creating Docxtemplater instance...');
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    console.log('🔧 [docxExport] Setting template data...');
    doc.setData(data);

    console.log('🎨 [docxExport] Rendering document...');
    doc.render();

    console.log('💾 [docxExport] Generating output blob...');
    const out = doc.getZip().generate({ type: 'blob' });
    console.log('📊 [docxExport] Output blob size:', out.size);

    const filename = `Promesa_Compraventa_${data.buyer_name}_vs_${data.seller_name}.docx`;
    console.log('💾 [docxExport] Saving file as:', filename);

    saveAs(out, filename);
    console.log('✅ [docxExport] File download initiated successfully');

  } catch (error) {
    console.error('💥 [docxExport] DOCX export failed:', error);
    console.error('📋 [docxExport] Error details:', {
      message: error?.message,
      stack: error?.stack
    });
    throw error;
  }
}


