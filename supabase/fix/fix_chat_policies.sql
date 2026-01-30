-- Fix chat system RLS policies
-- This script fixes the UUID comparison issues in the RLS policies

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete conversations they created" ON public.conversations;

DROP POLICY IF EXISTS "Users can read messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.chat_messages;

-- Recreate policies with correct UUID comparisons
CREATE POLICY "Users can read their conversations" ON public.conversations
    FOR SELECT USING (
        auth.uid() = ANY(participants) OR
        auth.jwt() ->> 'role' IN ('lawyer', 'admin', 'super_admin')
    );

CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (
        auth.uid() = ANY(participants) AND
        created_by = auth.uid()
    );

CREATE POLICY "Users can update their conversations" ON public.conversations
    FOR UPDATE USING (
        auth.uid() = ANY(participants) OR
        auth.jwt() ->> 'role' IN ('lawyer', 'admin', 'super_admin')
    );

CREATE POLICY "Users can delete conversations they created" ON public.conversations
    FOR DELETE USING (
        created_by = auth.uid() OR
        auth.jwt() ->> 'role' IN ('admin', 'super_admin')
    );

CREATE POLICY "Users can read messages in their conversations" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = conversation_id
            AND (auth.uid() = ANY(participants) OR auth.jwt() ->> 'role' IN ('lawyer', 'admin', 'super_admin'))
        ) OR
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE id = case_id
            AND (lawyer_id = auth.uid() OR buyer_id = auth.uid() OR seller_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their conversations" ON public.chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = conversation_id
            AND auth.uid() = ANY(participants)
        ) OR
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE id = case_id
            AND (lawyer_id = auth.uid() OR buyer_id = auth.uid() OR seller_id = auth.uid())
        )
    );

CREATE POLICY "Users can update their own messages" ON public.chat_messages
    FOR UPDATE USING (
        sender_id = auth.uid() OR
        auth.jwt() ->> 'role' IN ('admin', 'super_admin')
    );

CREATE POLICY "Users can delete their own messages" ON public.chat_messages
    FOR DELETE USING (
        sender_id = auth.uid() OR
        auth.jwt() ->> 'role' IN ('admin', 'super_admin')
    );
