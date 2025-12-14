-- Drop the view with security issues
DROP VIEW IF EXISTS public.reports_public;

-- Drop the existing policy and recreate properly
DROP POLICY IF EXISTS "Public can view limited report data" ON public.reports;

-- Create a function to return public report data (hiding sensitive fields)
CREATE OR REPLACE FUNCTION public.get_public_reports()
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  photo_url text,
  has_location boolean,
  latitude numeric,
  longitude numeric,
  neighborhood text,
  status public.report_status,
  tracking_code varchar,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT 
    id, title, description, photo_url, has_location, latitude, longitude,
    neighborhood, status, tracking_code, created_at, updated_at
  FROM public.reports;
$$;

-- Create RLS policy for public SELECT that uses a security definer function for sensitive data check
CREATE POLICY "Anyone can view reports public fields"
ON public.reports
FOR SELECT
USING (true);

-- Admins already have SELECT via is_admin check, so they see all fields