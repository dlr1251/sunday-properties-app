import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Reply, 
  MoreVertical,
  Check,
  CheckCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { Message } from '../../hooks/useChat';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReply?: (message: Message) => void;
  onDownload?: (attachment: any) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  onReply,
  onDownload
}) => {
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  const renderAttachment = (attachment: any, index: number) => {
    if (attachment.type === 'image') {
      return (
        <div key={index} className="mt-2">
          <img
            src={attachment.url}
            alt={attachment.name}
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(attachment.url, '_blank')}
          />
          <p className="text-xs text-muted-foreground mt-1">{attachment.name}</p>
        </div>
      );
    }

    return (
      <div key={index} className="mt-2 flex items-center gap-2 p-2 bg-muted rounded-lg">
        <FileText className="h-4 w-4" />
        <span className="text-sm flex-1">{attachment.name}</span>
        {onDownload && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDownload(attachment)}
          >
            <Download className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      {!isOwn && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="" />
          <AvatarFallback className="text-xs">
            {message.sender?.full_name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground">
              {message.sender?.full_name || 'Usuario'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.created_at)}
            </span>
          </div>
        )}

        <Card className={`p-3 ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          {message.reply_to && (
            <div className="mb-2 p-2 bg-muted/50 rounded border-l-2 border-primary">
              <p className="text-xs text-muted-foreground">
                Respondiendo a {message.reply_to.sender_name}
              </p>
              <p className="text-sm truncate">{message.reply_to.message}</p>
            </div>
          )}

          <div className="text-sm whitespace-pre-wrap">{message.message}</div>

          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2">
              {message.attachments.map((attachment, index) => 
                renderAttachment(attachment, index)
              )}
            </div>
          )}

          {message.document_url && (
            <div className="mt-2 flex items-center gap-2 p-2 bg-muted/50 rounded">
              <FileText className="h-4 w-4" />
              <span className="text-sm flex-1">{message.document_name || 'Documento'}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(message.document_url, '_blank')}
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          )}
        </Card>

        <div className="flex items-center gap-1 mt-1">
          {isOwn && (
            <div className="flex items-center gap-1">
              {message.read ? (
                <CheckCheck className="h-3 w-3 text-blue-500" />
              ) : (
                <Check className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          )}
          
          {isOwn && (
            <span className="text-xs text-muted-foreground">
              {formatTime(message.created_at)}
            </span>
          )}

          {onReply && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onReply(message)}
            >
              <Reply className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
