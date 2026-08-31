import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Smile,
  Phone,
  Video,
  MoreVertical,
  Search,
  Filter,
  Users,
  Clock,
  Check,
  CheckCheck,
  Download,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useIntlLocale } from '../../i18n/useDateFnsLocale';

interface ChatMessage {
  id: string;
  case_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  read: boolean;
  created_at: string;
  sender_name: string;
  sender_avatar?: string;
  message_type: 'text' | 'document' | 'image' | 'system';
  document_url?: string;
  document_name?: string;
}

interface ChatConversation {
  id: string;
  case_id: string;
  case_title: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
    role: 'lawyer' | 'buyer' | 'seller';
  }[];
  last_message: ChatMessage | null;
  unread_count: number;
  updated_at: string;
}

export const ChatPanel: React.FC = () => {
  const { t } = useTranslation();
  const intlLocale = useIntlLocale();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data - in real app this would come from Supabase
  const mockConversations: ChatConversation[] = [
    {
      id: 'conv-1',
      case_id: 'case-1',
      case_title: 'Apartamento El Poblado',
      participants: [
        { id: 'user-6', name: 'Laura Fernández', role: 'buyer' },
        { id: 'user-5', name: 'Pedro Sánchez', role: 'seller' },
        { id: user?.id || '', name: 'Dr. Andrés Morales', role: 'lawyer' }
      ],
      last_message: {
        id: 'msg-1',
        case_id: 'case-1',
        sender_id: 'user-6',
        receiver_id: user?.id || '',
        message: 'Hola Dr. Morales, ¿cuándo podemos revisar la promesa?',
        read: false,
        created_at: '2024-01-20T15:30:00Z',
        sender_name: 'Laura Fernández',
        message_type: 'text'
      },
      unread_count: 2,
      updated_at: '2024-01-20T15:30:00Z'
    },
    {
      id: 'conv-2',
      case_id: 'case-2',
      case_title: 'Casa Laureles',
      participants: [
        { id: 'user-4', name: 'Ana Gómez', role: 'buyer' },
        { id: 'user-7', name: 'Roberto Torres', role: 'seller' },
        { id: user?.id || '', name: 'Dr. Andrés Morales', role: 'lawyer' }
      ],
      last_message: {
        id: 'msg-2',
        case_id: 'case-2',
        sender_id: 'user-4',
        receiver_id: user?.id || '',
        message: 'Perfecto, enviaré los documentos mañana',
        read: true,
        created_at: '2024-01-19T10:15:00Z',
        sender_name: 'Ana Gómez',
        message_type: 'text'
      },
      unread_count: 0,
      updated_at: '2024-01-19T10:15:00Z'
    }
  ];

  const mockMessages: ChatMessage[] = [
    {
      id: 'msg-1',
      case_id: 'case-1',
      sender_id: 'user-6',
      receiver_id: user?.id || '',
      message: 'Hola Dr. Morales, ¿cuándo podemos revisar la promesa?',
      read: false,
      created_at: '2024-01-20T15:30:00Z',
      sender_name: 'Laura Fernández',
      message_type: 'text'
    },
    {
      id: 'msg-2',
      case_id: 'case-1',
      sender_id: user?.id || '',
      receiver_id: 'user-6',
      message: 'Hola Laura, podemos revisarla mañana a las 2 PM. ¿Te parece bien?',
      read: true,
      created_at: '2024-01-20T15:35:00Z',
      sender_name: 'Dr. Andrés Morales',
      message_type: 'text'
    },
    {
      id: 'msg-3',
      case_id: 'case-1',
      sender_id: 'user-5',
      receiver_id: user?.id || '',
      message: 'Dr. Morales, adjunto los documentos que solicitó',
      read: false,
      created_at: '2024-01-20T16:00:00Z',
      sender_name: 'Pedro Sánchez',
      message_type: 'document',
      document_url: '/documents/pedro-docs.pdf',
      document_name: 'Documentos Propiedad.pdf'
    },
    {
      id: 'msg-4',
      case_id: 'case-1',
      sender_id: user?.id || '',
      receiver_id: 'user-5',
      message: 'Perfecto Pedro, los revisaré y te confirmo',
      read: true,
      created_at: '2024-01-20T16:05:00Z',
      sender_name: 'Dr. Andrés Morales',
      message_type: 'text'
    }
  ];

  useEffect(() => {
    setConversations(mockConversations);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      const conversationMessages = mockMessages.filter(
        msg => msg.case_id === selectedConversation.case_id
      );
      setMessages(conversationMessages);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      case_id: selectedConversation.case_id,
      sender_id: user?.id || '',
      receiver_id: selectedConversation.participants.find(p => p.id !== user?.id)?.id || '',
      message: newMessage,
      read: false,
      created_at: new Date().toISOString(),
      sender_name: 'Dr. Andrés Morales',
      message_type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(intlLocale, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t('chat.today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('chat.yesterday');
    } else {
      return date.toLocaleDateString(intlLocale, {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.case_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const showConversationList = !selectedConversation;
  const showChatArea = selectedConversation;

  return (
    <div className="h-full min-h-[400px] flex flex-col md:flex-row md:min-h-[500px]">
      {/* Conversations List - full width on mobile when no chat selected, sidebar on md+ */}
      <div
        className={`
          w-full md:w-1/3 md:min-w-[260px] lg:min-w-[280px] 
          border-r border-border flex flex-col shrink-0
          ${showConversationList ? 'flex' : 'hidden md:flex'}
        `}
      >
        <div className="p-3 sm:p-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <h2 className="text-base sm:text-lg font-semibold truncate">{t('chat.conversations')}</h2>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Button variant="outline" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 hidden sm:flex">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('chat.searchConversations')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 sm:h-10 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-3 sm:p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedConversation?.id === conversation.id ? 'bg-primary/5 border-primary/20' : ''
              }`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h3 className="font-semibold text-sm truncate">{conversation.case_title}</h3>
                    {conversation.unread_count > 0 && (
                      <Badge variant="destructive" className="text-xs shrink-0">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-0.5">
                    {conversation.participants.map(p => p.name).join(', ')}
                  </p>
                  {conversation.last_message && (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground truncate flex-1 min-w-0">
                        {conversation.last_message.message}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatTime(conversation.last_message.created_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area - full width on mobile when conversation selected, flex-1 on md+ */}
      <div
        className={`
          flex-1 flex flex-col min-w-0 min-h-[300px]
          ${showChatArea ? 'flex' : 'hidden md:flex'}
        `}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-3 sm:p-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden h-9 w-9 p-0 shrink-0"
                  onClick={() => setSelectedConversation(null)}
                  aria-label={t('chat.backToConversations')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base truncate">
                    {selectedConversation.case_title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {selectedConversation.participants.map(p => p.name).join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 hidden sm:flex">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 min-h-0">
              {messages.map((message, index) => {
                const isOwn = message.sender_id === user?.id;
                const showDate = index === 0 || 
                  new Date(message.created_at).toDateString() !== 
                  new Date(messages[index - 1].created_at).toDateString();

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="text-center text-xs text-muted-foreground mb-4">
                        {formatDate(message.created_at)}
                      </div>
                    )}
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                        isOwn 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-foreground'
                      }`}>
                        {message.message_type === 'document' ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Paperclip className="h-4 w-4" />
                              <span className="font-medium">{message.document_name}</span>
                            </div>
                            <p className="text-sm">{message.message}</p>
                            <Button size="sm" variant={isOwn ? 'secondary' : 'outline'}>
                              <Download className="h-4 w-4 mr-1" />
                              {t('chat.download')}
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm">{message.message}</p>
                        )}
                        <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          <span>{formatTime(message.created_at)}</span>
                          {isOwn && (
                            message.read ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 sm:p-4 border-t border-border shrink-0">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9 w-9 sm:h-10 sm:w-10 p-0 shrink-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder={t('chat.placeholder')}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-12"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()} size="sm" className="shrink-0">
                  <Send className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">{t('chat.send')}</span>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center min-h-[200px] p-4">
            <div className="text-center max-w-sm">
              <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-muted-foreground mb-2">
                {t('chat.selectConversation')}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('chat.selectConversationHint')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
