import { supabase } from '../lib/supabase';

interface CreateConversationParams {
  propertyId: string;
  ownerId: string;
  adminId: string;
  propertyTitle: string;
}

export const createPropertyApprovalConversation = async ({
  propertyId,
  ownerId,
  adminId,
  propertyTitle
}: CreateConversationParams): Promise<string | null> => {
  try {
    // Check if conversation already exists for this property and admin
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('property_id', propertyId)
      .eq('type', 'verification')
      .contains('participants', [ownerId, adminId])
      .single();

    if (existingConv) {
      console.log('Conversation already exists for this property approval');
      return existingConv.id;
    }

    // Create new conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        property_id: propertyId,
        participants: [ownerId, adminId],
        type: 'verification',
        subject: `Propiedad Aprobada: ${propertyTitle}`,
        created_by: adminId
      })
      .select('id')
      .single();

    if (convError) throw convError;

    // Create initial message
    const welcomeMessage = `¡Hola! Tu propiedad "${propertyTitle}" ha sido aprobada y publicada. Puedes gestionarla desde tu dashboard. ¿Tienes alguna pregunta?`;

    const { error: msgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: adminId,
        receiver_id: ownerId,
        message: welcomeMessage,
        read: false
      });

    if (msgError) throw msgError;

    console.log('Successfully created approval conversation');
    return conversation.id;
  } catch (error) {
    console.error('Error creating approval conversation:', error);
    return null;
  }
};

