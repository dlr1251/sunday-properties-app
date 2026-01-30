import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  X,
  Smile
} from 'lucide-react';
import { toast } from 'sonner';

interface ChatInputProps {
  onSendMessage: (content: string, attachments: any[]) => void;
  onReply?: (message: any) => void;
  replyTo?: any;
  onCancelReply?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onReply,
  replyTo,
  onCancelReply,
  disabled = false,
  placeholder = "Escribe un mensaje..."
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;

    onSendMessage(message, attachments);
    setMessage('');
    setAttachments([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (files: FileList, type: 'file' | 'image') => {
    setIsUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // In a real implementation, you would upload to Supabase Storage here
        // For now, we'll create a mock URL
        const mockUrl = URL.createObjectURL(file);
        
        return {
          name: file.name,
          type: type === 'image' ? 'image' : 'file',
          url: mockUrl,
          size: file.size,
          file: file
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setAttachments(prev => [...prev, ...uploadedFiles]);
      toast.success(`${uploadedFiles.length} archivo(s) adjuntado(s)`);
    } catch (error) {
      toast.error('Error subiendo archivos');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  return (
    <Card className="p-4">
      {replyTo && (
        <div className="mb-3 p-2 bg-muted rounded border-l-2 border-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                Respondiendo a {replyTo.sender?.full_name || 'Usuario'}
              </p>
              <p className="text-sm truncate">{replyTo.message}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelReply}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-muted rounded-lg"
            >
              {attachment.type === 'image' ? (
                <ImageIcon className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span className="text-sm truncate max-w-32">{attachment.name}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeAttachment(index)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isUploading}
            rows={1}
            className="min-h-[40px] max-h-32 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleImageClick}
              disabled={disabled || isUploading}
              className="h-8 w-8 p-0"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleFileClick}
              disabled={disabled || isUploading}
              className="h-8 w-8 p-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={handleSend}
            disabled={disabled || isUploading || (!message.trim() && attachments.length === 0)}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'file')}
      />

      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'image')}
      />

      {isUploading && (
        <div className="mt-2 text-xs text-muted-foreground">
          Subiendo archivos...
        </div>
      )}
    </Card>
  );
};
