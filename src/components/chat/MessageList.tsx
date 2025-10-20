import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Smile,
  Check,
  CheckCheck,
  Clock,
  User,
  Download
} from 'lucide-react';

interface Message {
  id: string;
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

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onSendMessage: (message: string) => void;
  onSendDocument?: (file: File) => void;
  isLoading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  onSendMessage,
  onSendDocument,
  isLoading = false
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onSendDocument) {
      onSendDocument(file);
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

  const getMessageStatusIcon = (message: Message) => {
    if (message.sender_id !== currentUserId) return null;
    
    if (message.read) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    } else {
      return <Check className="h-3 w-3 text-gray-400" />;
    }
  };

  const getSenderInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No hay mensajes
              </h3>
              <p className="text-sm text-muted-foreground">
                Comienza la conversación enviando un mensaje
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender_id === currentUserId;
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
                
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end space-x-2`}>
                  {!isOwn && (
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {getSenderInitials(message.sender_name)}
                      </span>
                    </div>
                  )}
                  
                  <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-first' : ''}`}>
                    {!isOwn && (
                      <div className="text-xs text-muted-foreground mb-1 px-1">
                        {message.sender_name}
                      </div>
                    )}
                    
                    <div className={`px-4 py-2 rounded-lg ${
                      isOwn 
                        ? 'bg-primary text-primary-foreground rounded-br-sm' 
                        : 'bg-muted text-foreground rounded-bl-sm'
                    }`}>
                      {message.message_type === 'document' ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Paperclip className="h-4 w-4" />
                            <span className="font-medium text-sm">{message.document_name}</span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                          <Button 
                            size="sm" 
                            variant={isOwn ? 'secondary' : 'outline'}
                            className="w-full"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Descargar
                          </Button>
                        </div>
                      ) : message.message_type === 'system' ? (
                        <div className="text-center">
                          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-muted/50 rounded-full">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">{message.message}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm">{message.message}</p>
                      )}
                      
                      <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                        isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        <span>{formatTime(message.created_at)}</span>
                        {getMessageStatusIcon(message)}
                      </div>
                    </div>
                  </div>
                  
                  {isOwn && (
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {getSenderInitials(message.sender_name)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        
        {isLoading && (
          <div className="flex justify-center">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm">Enviando mensaje...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" size="sm" asChild>
              <span>
                <Paperclip className="h-4 w-4" />
              </span>
            </Button>
          </label>
          
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 pr-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              disabled={isLoading}
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
