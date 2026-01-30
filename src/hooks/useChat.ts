import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface Conversation {
  id: string;
  property_id?: string;
  case_id?: string;
  participants: string[];
  type: 'verification' | 'property_inquiry' | 'negotiation' | 'general';
  subject?: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  created_by: string;
  property?: {
    title: string;
    address: string;
  };
  case?: {
    id: string;
    status: string;
  };
  participants_profiles?: Array<{
    id: string;
    full_name: string;
    email: string;
  }>;
  last_message?: {
    content: string;
    sender_name: string;
    created_at: string;
  };
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id?: string;
  case_id?: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  read: boolean;
  created_at: string;
  message_type: 'text' | 'document' | 'image' | 'system';
  document_url?: string;
  document_name?: string;
  attachments?: any[];
  reply_to_id?: string;
  sender?: {
    full_name: string;
    email: string;
  };
  reply_to?: {
    message: string;
    sender_name: string;
  };
}

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations for a user
  const fetchConversations = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          property:property_id (
            title,
            address
          ),
          case:case_id (
            id,
            status
          )
        `)
        .contains('participants', [userId])
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Get participant profiles for each conversation
      const conversationsWithParticipants = await Promise.all(
        (data || []).map(async (conv) => {
          // Get profiles for all participants
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', conv.participants);

          // Get unread counts for this conversation
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('receiver_id', userId)
            .eq('read', false);

          // Get last message
          const { data: lastMessage } = await supabase
            .from('chat_messages')
            .select(`
              message,
              created_at,
              sender:sender_id (
                full_name
              )
            `)
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            participants_profiles: profiles || [],
            unread_count: count || 0,
            last_message: lastMessage ? {
              content: lastMessage.message,
              sender_name: lastMessage.sender?.full_name || 'Unknown',
              created_at: lastMessage.created_at
            } : null
          };
        })
      );

      setConversations(conversationsWithParticipants);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:sender_id (
            full_name,
            email
          ),
          reply_to:reply_to_id (
            message,
            sender:sender_id (
              full_name
            )
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    attachments: any[] = [],
    replyToId?: string
  ) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Get conversation participants to determine receiver
      const { data: conv } = await supabase
        .from('conversations')
        .select('participants')
        .eq('id', conversationId)
        .single();

      if (!conv) throw new Error('Conversation not found');

      const receiverId = conv.participants.find(id => id !== userData.user.id);
      if (!receiverId) throw new Error('No receiver found');

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userData.user.id,
          receiver_id: receiverId,
          message: content,
          attachments: attachments.length > 0 ? attachments : null,
          reply_to_id: replyToId,
          read: false
        })
        .select()
        .single();

      if (error) throw error;

      // Add message to local state
      setMessages(prev => [...prev, data]);

      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      console.error('Error sending message:', err);
      throw err;
    }
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(async (conversationId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', userId)
        .eq('read', false);

      if (error) throw error;

      // Update local state
      setMessages(prev =>
        prev.map(msg =>
          msg.conversation_id === conversationId && msg.receiver_id === userId
            ? { ...msg, read: true }
            : msg
        )
      );
    } catch (err: any) {
      console.error('Error marking messages as read:', err);
    }
  }, []);

  // Create property inquiry conversation
  const createPropertyInquiry = useCallback(async (
    propertyId: string,
    subject: string,
    initialMessage: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('create_property_inquiry_conversation', {
        p_property_id: propertyId,
        p_subject: subject,
        p_initial_message: initialMessage
      });

      if (error) throw error;

      toast.success('Conversación iniciada');
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to create property inquiry');
      console.error('Error creating property inquiry:', err);
      throw err;
    }
  }, []);

  // Create negotiation conversation
  const createNegotiationConversation = useCallback(async (
    caseId: string,
    subject: string,
    initialMessage: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('create_negotiation_conversation', {
        p_case_id: caseId,
        p_subject: subject,
        p_initial_message: initialMessage
      });

      if (error) throw error;

      toast.success('Conversación de negociación iniciada');
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to create negotiation conversation');
      console.error('Error creating negotiation conversation:', err);
      throw err;
    }
  }, []);

  // Real-time subscription for messages - Temporarily disabled to prevent infinite loops
  // TODO: Fix subscription logic to avoid infinite re-renders
  /*
  useEffect(() => {
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const newMessage = payload.new as Message;

          // Only add if it's for a conversation we're viewing
          if (messages.length > 0 && messages[0].conversation_id === newMessage.conversation_id) {
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  */

  return {
    conversations,
    messages,
    loading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
    createPropertyInquiry,
    createNegotiationConversation,
  };
};
