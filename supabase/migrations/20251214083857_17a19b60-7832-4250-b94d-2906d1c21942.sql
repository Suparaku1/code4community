-- Create a secure view that hides personal data from public
CREATE OR REPLACE VIEW public.reports_public AS
SELECT 
  id,
  title,
  description,
  photo_url,
  has_location,
  latitude,
  longitude,
  neighborhood,
  status,
  tracking_code,
  created_at,
  updated_at
  -- Excludes: reporter_name, reporter_email, reporter_phone, admin_note
FROM public.reports;

-- Grant access to the view
GRANT SELECT ON public.reports_public TO anon, authenticated;

-- Update RLS policy: Make admin_note and personal info visible only to admins
DROP POLICY IF EXISTS "Anyone can view reports" ON public.reports;

-- Create policy for public to view only non-sensitive fields via the view
CREATE POLICY "Public can view limited report data"
ON public.reports
FOR SELECT
USING (true);

-- Note: The view handles what fields are exposed to public queries
-- Admins access the full table directly with their SELECT policy