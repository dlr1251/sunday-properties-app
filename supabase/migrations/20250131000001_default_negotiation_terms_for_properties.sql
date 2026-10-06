-- Ensure all listed properties have minimum negotiation conditions:
-- Fecha escrituración (deedSigningDate), fecha de entrega (propertyDeliveryDate),
-- cierre/validez (maxClosingDays), método de pago (acceptedPaymentMethods = bank_transfer).

-- Merge default negotiation_terms for properties missing any of these.
UPDATE public.properties
SET negotiation_terms = (
  COALESCE(negotiation_terms, '{}'::jsonb)
  || jsonb_build_object(
       'offeredTimeline',
       (COALESCE(negotiation_terms->'offeredTimeline', '{}'::jsonb))
         || jsonb_build_object(
              'deedSigningDate',
              COALESCE(
                negotiation_terms->'offeredTimeline'->>'deedSigningDate',
                to_char((COALESCE((created_at)::timestamptz, now()) + interval '60 days'), 'YYYY-MM-DD')
              ),
              'propertyDeliveryDate',
              COALESCE(
                negotiation_terms->'offeredTimeline'->>'propertyDeliveryDate',
                to_char((COALESCE((created_at)::timestamptz, now()) + interval '90 days'), 'YYYY-MM-DD')
              )
            ),
       'maxClosingDays',
       COALESCE((negotiation_terms->>'maxClosingDays')::int, 90),
       'acceptedPaymentMethods',
       CASE
         WHEN negotiation_terms ? 'acceptedPaymentMethods'
              AND jsonb_array_length(COALESCE(negotiation_terms->'acceptedPaymentMethods', '[]'::jsonb)) > 0
         THEN negotiation_terms->'acceptedPaymentMethods'
         ELSE '["bank_transfer"]'::jsonb
       END
     )
)
WHERE negotiation_terms IS NULL
   OR negotiation_terms = '{}'::jsonb
   OR (negotiation_terms->'offeredTimeline'->>'deedSigningDate') IS NULL
   OR (negotiation_terms->'offeredTimeline'->>'propertyDeliveryDate') IS NULL
   OR (negotiation_terms->>'maxClosingDays') IS NULL
   OR (negotiation_terms->'acceptedPaymentMethods') IS NULL
   OR jsonb_array_length(COALESCE(negotiation_terms->'acceptedPaymentMethods', '[]'::jsonb)) = 0;
