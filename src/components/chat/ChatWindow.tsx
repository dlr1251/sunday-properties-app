import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  MoreVertical, 
  Phone, 
  Video, 
  Info,
  Home,
  FileText,
  Users,
  MessageSquare
} from 'lucide-react';
import { ConversationList } from './ConversationList';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { useChat, Conversation, Message } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

interface ChatWindowProps {
  conversationId?: string;
  onBack?: () => void;
  className?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  onBack,
  className = ''
}) => {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
    createPropertyInquiry,
    createNegotiationConversation
  } = useChat();

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations on mount
  useEffect(() => {
    if (user?.id) {
      fetchConversations(user.id);
    }
  }, [user?.id, fetchConversations]);

  // Select conversation if conversationId is provided
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
        fetchMessages(conversation.id);
        markAsRead(conversation.id, user?.id || '');
      }
    }
  }, [conversationId, conversations, fetchMessages, markAsRead, user?.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
    markAsRead(conversation.id, user?.id || '');
  };

  const handleSendMessage = async (content: string, attachments: any[]) => {
    if (!selectedConversation || !content.trim()) return;

    try {
      await sendMessage(selectedConversation.id, content, attachments, replyTo?.id);
      setReplyTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'property_inquiry':
        return <Home className="h-4 w-4" />;
      case 'negotiation':
        return <FileText className="h-4 w-4" />;
      case 'verification':
        return <Users className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getOtherParticipants = (conversation: Conversation) => {
    return conversation.participants_profiles?.filter(
      p => p.id !== user?.id
    ) || [];
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.subject?.toLowerCase().includes(query) ||
      conv.property?.title?.toLowerCase().includes(query) ||
      conv.participants_profiles?.some(p => 
        p.full_name?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query)
      )
    );
  });

  if (!user) {
    return (
      <Card className="h-full">
        <CardContent className="p-8 text-center">
          <p>Debes iniciar sesión para usar el chat</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`h-full flex ${className}`}>
      {/* Conversation List */}
      <div className="w-80 border-r">
        <ConversationList
          conversations={filteredConversations}
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={handleSelectConversation}
          onSearch={setSearchQuery}
          loading={loading}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <Card className="border-b rounded-none">
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {onBack && (
                      <Button size="sm" variant="ghost" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {getOtherParticipants(selectedConversation)[0]?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="font-medium">
                        {selectedConversation.subject || 
                         selectedConversation.property?.title ||
                         'Conversación'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getConversationIcon(selectedConversation.type)}
                        <span>
                          {getOtherParticipants(selectedConversation).map(p => p.full_name).join(', ')}
                        </span>
                        {selectedConversation.property && (
                          <>
                            <span>•</span>
                            <span>{selectedConversation.property.address}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Info className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Messages */}
            <Card className="flex-1 rounded-none border-0">
              <CardContent className="h-full p-4 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay mensajes en esta conversación</p>
                      <p className="text-sm">Envía el primer mensaje para comenzar</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwn={message.sender_id === user.id}
                        onReply={handleReply}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat Input */}
            <div className="border-t">
              <ChatInput
                onSendMessage={handleSendMessage}
                replyTo={replyTo}
                onCancelReply={handleCancelReply}
                disabled={loading}
                placeholder="Escribe un mensaje..."
              />
            </div>
          </>
        ) : (
          <Card className="h-full">
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Selecciona una conversación</h3>
                <p>Elige una conversación de la lista para comenzar a chatear</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
