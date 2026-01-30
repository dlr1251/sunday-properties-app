import { supabase } from '../../supabase';
import { Result, ok, err, tryCatch } from '../../utils/result';
import { AppError, createDatabaseError } from '../../utils/errors';
import { logError } from '../../utils/logger';

export interface Case {
  id: string;
  lawyer_id: string;
  buyer_id: string;
  seller_id: string;
  property_id: string;
  status: 'active' | 'closed' | 'pending';
  created_at: string;
  updated_at: string;
  // Joined data
  lawyer?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  buyer?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  seller?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  property?: {
    id: string;
    title: string;
    address: string;
    city: string;
    price: number;
    area: number;
    property_type: string;
  };
  documents?: CaseDocument[];
}

export interface CaseDocument {
  id: string;
  case_id: string;
  document_type: 'promesa' | 'otrosi' | 'oferta' | 'escritura' | 'legal';
  document_url: string;
  signed_by?: string;
  signed_at?: string;
  status: 'draft' | 'pending_signature' | 'signed' | 'completed';
  created_at: string;
  title: string;
  description?: string;
  version: number;
  last_modified: string;
  modified_by?: string;
}

export class CasesRepository {
  /**
   * Get cases by lawyer ID
   */
  async getCasesByLawyer(lawyerId: string): Promise<Result<Case[], AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          lawyer:profiles!cases_lawyer_id_fkey (
            id,
            full_name,
            email,
            phone
          ),
          buyer:profiles!cases_buyer_id_fkey (
            id,
            full_name,
            email,
            phone
          ),
          seller:profiles!cases_seller_id_fkey (
            id,
            full_name,
            email,
            phone
          ),
          property:properties!cases_property_id_fkey (
            id,
            title,
            address,
            city,
            price,
            area,
            property_type
          )
        `)
        .eq('lawyer_id', lawyerId)
        .order('created_at', { ascending: false });

      if (error) {
        logError('Failed to fetch cases by lawyer', { lawyerId, error });
        throw createDatabaseError(error);
      }

      return data || [];
    });
  }

  /**
   * Get case details with all related data
   */
  async getCaseDetails(caseId: string): Promise<Result<Case, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          lawyer:profiles!cases_lawyer_id_fkey (
            id,
            full_name,
            email,
            phone
          ),
          buyer:profiles!cases_buyer_id_fkey (
            id,
            full_name,
            email,
            phone
          ),
          seller:profiles!cases_seller_id_fkey (
            id,
            full_name,
            email,
            phone
          ),
          property:properties!cases_property_id_fkey (
            id,
            title,
            address,
            city,
            price,
            area,
            property_type,
            bedrooms,
            bathrooms,
            strata,
            year_built
          )
        `)
        .eq('id', caseId)
        .single();

      if (error) {
        logError('Failed to fetch case details', { caseId, error });
        throw createDatabaseError(error);
      }

      if (!data) {
        throw new AppError('Case not found', 'NOT_FOUND');
      }

      // Fetch documents separately
      const { data: documents, error: docsError } = await supabase
        .from('case_documents')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (docsError) {
        logError('Failed to fetch case documents', { caseId, error: docsError });
      }

      return {
        ...data,
        documents: documents || []
      };
    });
  }

  /**
   * Get cases by buyer ID
   */
  async getCasesByBuyer(buyerId: string): Promise<Result<Case[], AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          lawyer:profiles!cases_lawyer_id_fkey (
            id,
            full_name,
            email,
            phone
          ),
          seller:profiles!cases_seller_id_fkey (
            id,
            full_name,
            email,
            phone
          ),
          property:properties!cases_property_id_fkey (
            id,
            title,
            address,
            city,
            price
          )
        `)
        .eq('buyer_id', buyerId)
        .order('created_at', { ascending: false });

      if (error) {
        logError('Failed to fetch cases by buyer', { buyerId, error });
        throw createDatabaseError(error);
      }

      return data || [];
    });
  }

  /**
   * Get cases by seller ID
   */
  async getCasesBySeller(sellerId: string): Promise<Result<Case[], AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          lawyer:profiles!cases_lawyer_id_fkey (
            id,
            full_name,
            email,
            phone
          ),
          buyer:profiles!cases_buyer_id_fkey (
            id,
            full_name,
            email,
            phone
          ),
          property:properties!cases_property_id_fkey (
            id,
            title,
            address,
            city,
            price
          )
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) {
        logError('Failed to fetch cases by seller', { sellerId, error });
        throw createDatabaseError(error);
      }

      return data || [];
    });
  }

  /**
   * Create a case document
   */
  async createCaseDocument(
    caseId: string,
    documentType: CaseDocument['document_type'],
    title: string,
    documentUrl: string,
    description?: string,
    modifiedBy?: string
  ): Promise<Result<CaseDocument, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('case_documents')
        .insert({
          case_id: caseId,
          document_type: documentType,
          title,
          document_url: documentUrl,
          description,
          status: 'draft',
          version: 1,
          modified_by: modifiedBy
        })
        .select()
        .single();

      if (error) {
        logError('Failed to create case document', { caseId, error });
        throw createDatabaseError(error);
      }

      return data;
    });
  }

  /**
   * Update document status
   */
  async updateDocumentStatus(
    documentId: string,
    status: CaseDocument['status']
  ): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const { error } = await supabase
        .from('case_documents')
        .update({
          status,
          last_modified: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) {
        logError('Failed to update document status', { documentId, status, error });
        throw createDatabaseError(error);
      }
    });
  }

  /**
   * Sign a document
   */
  async signDocument(
    documentId: string,
    userId: string,
    signature: string
  ): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const { error } = await supabase
        .from('case_documents')
        .update({
          signed_by: userId,
          signed_at: new Date().toISOString(),
          status: 'signed',
          last_modified: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) {
        logError('Failed to sign document', { documentId, userId, error });
        throw createDatabaseError(error);
      }
    });
  }

  /**
   * Update case status
   */
  async updateCaseStatus(
    caseId: string,
    status: Case['status']
  ): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const { error } = await supabase
        .from('cases')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', caseId);

      if (error) {
        logError('Failed to update case status', { caseId, status, error });
        throw createDatabaseError(error);
      }
    });
  }

  /**
   * Get documents for a case
   */
  async getCaseDocuments(caseId: string): Promise<Result<CaseDocument[], AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('case_documents')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (error) {
        logError('Failed to fetch case documents', { caseId, error });
        throw createDatabaseError(error);
      }

      return data || [];
    });
  }

  /**
   * Get active cases count by lawyer
   */
  async getActiveCasesCount(lawyerId: string): Promise<Result<number, AppError>> {
    return tryCatch(async () => {
      const { count, error } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('lawyer_id', lawyerId)
        .eq('status', 'active');

      if (error) {
        logError('Failed to count active cases', { lawyerId, error });
        throw createDatabaseError(error);
      }

      return count || 0;
    });
  }
}

// Export singleton instance
export const casesRepository = new CasesRepository();

