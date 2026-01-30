import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Home, 
  FileText, 
  Users, 
  Clock,
  MoreVertical,
  Search
} from 'lucide-react';
import { Conversation } from '../../hooks/useChat';
import { format } from 'date-fns';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  onSearch?: (query: string) => void;
  loading?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onSearch,
  loading = false
}) => {
  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'property_inquiry':
        return <Home className="h-4 w-4" />;
      case 'negotiation':
        return <FileText className="h-4 w-4" />;
      case 'verification':
        return <Users className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getConversationTypeLabel = (type: string) => {
    switch (type) {
      case 'property_inquiry':
        return 'Consulta de Propiedad';
      case 'negotiation':
        return 'Negociación';
      case 'verification':
        return 'Verificación';
      default:
        return 'General';
    }
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 168) { // 7 days
      return format(date, 'EEE');
    } else {
      return format(date, 'MMM dd');
    }
  };

  const getOtherParticipants = (conversation: Conversation) => {
    return conversation.participants_profiles?.filter(
      p => p.id !== conversation.created_by
    ) || [];
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Conversaciones</h2>
          <Button size="sm" variant="ghost">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        {onSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      <CardContent className="flex-1 overflow-y-auto p-0">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay conversaciones</p>
            <p className="text-sm">Inicia una conversación desde una propiedad o caso</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => {
              const otherParticipants = getOtherParticipants(conversation);
              const isSelected = selectedConversationId === conversation.id;
              
              return (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    isSelected ? 'bg-muted border-r-2 border-primary' : ''
                  }`}
                  onClick={() => onSelectConversation(conversation)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {otherParticipants[0]?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                        {getConversationIcon(conversation.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm truncate">
                            {conversation.subject || 
                             (conversation.property?.title) ||
                             `Conversación ${getConversationTypeLabel(conversation.type)}`}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {getConversationTypeLabel(conversation.type)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatLastMessageTime(conversation.last_message_at)}
                          </span>
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.last_message?.content || 'Sin mensajes'}
                        </p>
                        <div className="flex items-center gap-1">
                          {conversation.property && (
                            <Home className="h-3 w-3 text-muted-foreground" />
                          )}
                          {conversation.case && (
                            <FileText className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {otherParticipants.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Con {otherParticipants.map(p => p.full_name).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
