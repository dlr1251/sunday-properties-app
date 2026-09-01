import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { MessageSquare, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from '../../utils/format';

export function SuperAdminChatsManagement() {
  const { t } = useTranslation();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      // Fetch from both chat_messages and negotiation_chats
      const [caseChats, negotiationChats] = await Promise.all([
        supabase
          .from('chat_messages')
          .select(`
            *,
            sender:profiles!chat_messages_sender_id_fkey(id, full_name),
            receiver:profiles!chat_messages_receiver_id_fkey(id, full_name),
            case:cases(id)
          `)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('negotiation_chats')
          .select(`
            *,
            sender:profiles!negotiation_chats_sender_id_fkey(id, full_name),
            negotiation:negotiations(id)
          `)
          .order('created_at', { ascending: false })
          .limit(100)
      ]);

      const allChats = [
        ...(caseChats.data || []).map((c: any) => ({ ...c, chat_type: 'case' })),
        ...(negotiationChats.data || []).map((c: any) => ({ ...c, chat_type: 'negotiation' }))
      ];

      setChats(allChats);
    } catch (error: any) {
      console.error('Error al cargar chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.sender?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('admin.manageChatsTitle')}</h2>
        <p className="text-muted-foreground">
          {t('admin.manageChatsDescription')}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('admin.searchMessagesPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.messagesCountLabel', { count: filteredChats.length })}</CardTitle>
          <CardDescription>{t('admin.messagesAllDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t('admin.noMessagesFound')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredChats.map((chat) => (
                <div key={chat.id} className="border rounded-lg p-4 hover:bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{chat.sender?.full_name || t('user')}</span>
                        <Badge variant="outline">{chat.chat_type === 'case' ? t('admin.chatTypeCase') : chat.chat_type === 'negotiation' ? t('admin.chatTypeNegotiation') : chat.chat_type}</Badge>
                        {chat.is_read ? (
                          <Badge variant="default" className="text-xs">{t('admin.read')}</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">{t('admin.unread')}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{chat.message}</p>
                      <div className="text-xs text-muted-foreground">
                        {chat.created_at ? formatDateTime(chat.created_at) : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

