-- Add negotiation_terms JSONB column to properties for storing
-- offeredTimeline, acceptedPaymentMethods, and negotiation rules
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS negotiation_terms JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.properties.negotiation_terms IS 'Stores offered timeline, accepted payment methods, min price, max closing days, and other negotiation rules';
