-- Chat System Migration
-- Creates conversations table and extends chat_messages for comprehensive messaging

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    participants UUID[] NOT NULL DEFAULT '{}',
    type VARCHAR(20) NOT NULL DEFAULT 'general' CHECK (type IN ('verification', 'property_inquiry', 'negotiation', 'general')),
    subject VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Extend chat_messages table
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations USING GIN (participants);
CREATE INDEX IF NOT EXISTS idx_conversations_property ON public.conversations(property_id);
CREATE INDEX IF NOT EXISTS idx_conversations_case ON public.conversations(case_id);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON public.conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to ON public.chat_messages(reply_to_id);

-- RLS Policies for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete conversations they created" ON public.conversations;

-- Users can read conversations they participate in
CREATE POLICY "Users can read their conversations" ON public.conversations
    FOR SELECT USING (
        auth.uid() = ANY(participants) OR
        auth.jwt() ->> 'role' IN ('lawyer', 'admin', 'super_admin')
    );

-- Users can create conversations
CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (
        auth.uid() = ANY(participants) AND
        created_by = auth.uid()
    );

-- Users can update conversations they participate in
CREATE POLICY "Users can update their conversations" ON public.conversations
    FOR UPDATE USING (
        auth.uid() = ANY(participants) OR
        auth.jwt() ->> 'role' IN ('lawyer', 'admin', 'super_admin')
    );

-- Users can delete conversations they created
CREATE POLICY "Users can delete conversations they created" ON public.conversations
    FOR DELETE USING (
        created_by = auth.uid() OR
        auth.jwt() ->> 'role' IN ('admin', 'super_admin')
    );

-- RLS Policies for chat_messages (extend existing)
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.chat_messages;

-- Users can read messages in conversations they participate in
CREATE POLICY "Users can read messages in their conversations" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = conversation_id
            AND (auth.uid() = ANY(participants) OR auth.jwt() ->> 'role' IN ('lawyer', 'admin', 'super_admin'))
        ) OR
        -- Keep existing case-based access
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE id = case_id
            AND (lawyer_id = auth.uid() OR buyer_id = auth.uid() OR seller_id = auth.uid())
        )
    );

-- Users can insert messages in conversations they participate in
CREATE POLICY "Users can send messages in their conversations" ON public.chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = conversation_id
            AND auth.uid() = ANY(participants)
        ) OR
        -- Keep existing case-based access
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE id = case_id
            AND (lawyer_id = auth.uid() OR buyer_id = auth.uid() OR seller_id = auth.uid())
        )
    );

-- Users can update their own messages
CREATE POLICY "Users can update their own messages" ON public.chat_messages
    FOR UPDATE USING (
        sender_id = auth.uid() OR
        auth.jwt() ->> 'role' IN ('admin', 'super_admin')
    );

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages" ON public.chat_messages
    FOR DELETE USING (
        sender_id = auth.uid() OR
        auth.jwt() ->> 'role' IN ('admin', 'super_admin')
    );

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET last_message_at = NEW.created_at,
        updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp when new message is added
CREATE TRIGGER update_conversation_timestamp
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Function to create conversation for property inquiry
CREATE OR REPLACE FUNCTION create_property_inquiry_conversation(
    p_property_id UUID,
    p_subject VARCHAR(255),
    p_initial_message TEXT
)
RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
    v_owner_id UUID;
    v_visitor_id UUID;
BEGIN
    -- Get property owner
    SELECT owner_id INTO v_owner_id FROM public.properties WHERE id = p_property_id;
    
    -- Get current user
    v_visitor_id := auth.uid();
    
    -- Create conversation
    INSERT INTO public.conversations (property_id, participants, type, subject, created_by)
    VALUES (p_property_id, ARRAY[v_owner_id, v_visitor_id], 'property_inquiry', p_subject, v_visitor_id)
    RETURNING id INTO v_conversation_id;
    
    -- Add initial message
    INSERT INTO public.chat_messages (conversation_id, sender_id, receiver_id, message)
    VALUES (v_conversation_id, v_visitor_id, v_owner_id, p_initial_message);
    
    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create conversation for negotiation
CREATE OR REPLACE FUNCTION create_negotiation_conversation(
    p_case_id UUID,
    p_subject VARCHAR(255),
    p_initial_message TEXT
)
RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
    v_lawyer_id UUID;
    v_buyer_id UUID;
    v_seller_id UUID;
    v_creator_id UUID;
BEGIN
    -- Get case participants
    SELECT lawyer_id, buyer_id, seller_id INTO v_lawyer_id, v_buyer_id, v_seller_id
    FROM public.cases WHERE id = p_case_id;
    
    -- Get current user
    v_creator_id := auth.uid();
    
    -- Create conversation
    INSERT INTO public.conversations (case_id, participants, type, subject, created_by)
    VALUES (p_case_id, ARRAY[v_lawyer_id, v_buyer_id, v_seller_id], 'negotiation', p_subject, v_creator_id)
    RETURNING id INTO v_conversation_id;
    
    -- Add initial message
    INSERT INTO public.chat_messages (conversation_id, sender_id, receiver_id, message)
    VALUES (v_conversation_id, v_creator_id, 
            CASE WHEN v_creator_id = v_lawyer_id THEN v_buyer_id ELSE v_lawyer_id END, 
            p_initial_message);
    
    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
