-- Visit Feedback System

CREATE TABLE IF NOT EXISTS visit_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  property_rating INTEGER NOT NULL CHECK (property_rating >= 1 AND property_rating <= 5),
  service_rating INTEGER NOT NULL CHECK (service_rating >= 1 AND service_rating <= 5),
  overall_satisfaction INTEGER NOT NULL CHECK (overall_satisfaction >= 1 AND overall_satisfaction <= 5),
  purchase_interest INTEGER CHECK (purchase_interest >= 1 AND purchase_interest <= 5),
  comments TEXT,
  is_anonymous BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_visit_feedback_visit_id ON visit_feedback(visit_id);
CREATE INDEX IF NOT EXISTS idx_visit_feedback_user_id ON visit_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_visit_feedback_created_at ON visit_feedback(created_at);

-- RLS Policies
ALTER TABLE visit_feedback ENABLE ROW LEVEL SECURITY;

-- Users can read their own feedback
CREATE POLICY visit_feedback_read_own ON visit_feedback
  FOR SELECT USING (user_id = auth.uid());

-- Property owners can read feedback for their properties (aggregated only)
CREATE POLICY visit_feedback_read_property_owner ON visit_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM visits v
      JOIN properties p ON v.property_id = p.id
      WHERE v.id = visit_feedback.visit_id
      AND p.owner_id = auth.uid()
    )
  );

-- Users can insert their own feedback
CREATE POLICY visit_feedback_insert ON visit_feedback
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    (is_anonymous = TRUE AND user_id IS NULL)
  );

-- Function to get aggregated feedback for a property
CREATE OR REPLACE FUNCTION get_property_feedback_stats(property_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_reviews', COUNT(*),
    'avg_property_rating', ROUND(AVG(property_rating)::numeric, 1),
    'avg_service_rating', ROUND(AVG(service_rating)::numeric, 1),
    'avg_overall_satisfaction', ROUND(AVG(overall_satisfaction)::numeric, 1),
    'avg_purchase_interest', ROUND(AVG(purchase_interest)::numeric, 1),
    'rating_distribution', json_build_object(
      '5_stars', COUNT(*) FILTER (WHERE overall_satisfaction = 5),
      '4_stars', COUNT(*) FILTER (WHERE overall_satisfaction = 4),
      '3_stars', COUNT(*) FILTER (WHERE overall_satisfaction = 3),
      '2_stars', COUNT(*) FILTER (WHERE overall_satisfaction = 2),
      '1_star', COUNT(*) FILTER (WHERE overall_satisfaction = 1)
    )
  ) INTO result
  FROM visit_feedback vf
  JOIN visits v ON vf.visit_id = v.id
  WHERE v.property_id = property_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update visit status when feedback is submitted
CREATE OR REPLACE FUNCTION update_visit_feedback_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark visit as having feedback
  UPDATE visits
  SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('has_feedback', true)
  WHERE id = NEW.visit_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS visit_feedback_submitted ON visit_feedback;
CREATE TRIGGER visit_feedback_submitted
  AFTER INSERT ON visit_feedback
  FOR EACH ROW EXECUTE FUNCTION update_visit_feedback_status();

COMMENT ON TABLE visit_feedback IS 'User feedback collected after property visits';
COMMENT ON COLUMN visit_feedback.is_anonymous IS 'Whether the feedback should be attributed to the user or remain anonymous';
COMMENT ON FUNCTION get_property_feedback_stats(UUID) IS 'Returns aggregated feedback statistics for a property';
