import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
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
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
    return date.toLocaleTimeString('es-CO', {
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
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.case_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Conversaciones</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedConversation?.id === conversation.id ? 'bg-primary/5 border-primary/20' : ''
              }`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm truncate">{conversation.case_title}</h3>
                    {conversation.unread_count > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-1">
                    <span>{conversation.participants.map(p => p.name).join(', ')}</span>
                  </div>
                  {conversation.last_message && (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.last_message.message}
                      </p>
                      <span className="text-xs text-muted-foreground ml-2">
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

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedConversation.case_title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.participants.map(p => p.name).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
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
                              Descargar
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
            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Escribe un mensaje..."
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
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Selecciona una conversación
              </h3>
              <p className="text-sm text-muted-foreground">
                Elige una conversación para comenzar a chatear
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
