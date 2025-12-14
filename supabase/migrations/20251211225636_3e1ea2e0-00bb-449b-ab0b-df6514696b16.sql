-- Create enum for report status
CREATE TYPE public.report_status AS ENUM ('i_ri', 'ne_proces', 'perfunduar');

-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_code VARCHAR(8) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  has_location BOOLEAN DEFAULT false,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  neighborhood TEXT,
  reporter_name TEXT,
  reporter_email TEXT,
  reporter_phone TEXT,
  status report_status NOT NULL DEFAULT 'i_ri',
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admins table (separate from auth.users for security)
CREATE TABLE public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  is_super_admin BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user is admin (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admins
    WHERE user_id = _user_id
  )
$$;

-- Create security definer function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admins
    WHERE user_id = _user_id AND is_super_admin = true
  )
$$;

-- RLS Policies for reports
-- Anyone can insert reports (public reporting)
CREATE POLICY "Anyone can create reports"
ON public.reports
FOR INSERT
WITH CHECK (true);

-- Anyone can view reports (public tracking)
CREATE POLICY "Anyone can view reports"
ON public.reports
FOR SELECT
USING (true);

-- Only admins can update reports
CREATE POLICY "Admins can update reports"
ON public.reports
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Only admins can delete reports
CREATE POLICY "Admins can delete reports"
ON public.reports
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- RLS Policies for admins (using security definer functions to avoid recursion)
-- Only admins can view admins list
CREATE POLICY "Admins can view admins"
ON public.admins
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Only super admins can create new admins
CREATE POLICY "Super admins can create admins"
ON public.admins
FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));

-- Only super admins can update admins
CREATE POLICY "Super admins can update admins"
ON public.admins
FOR UPDATE
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Only super admins can delete admins (but not themselves)
CREATE POLICY "Super admins can delete other admins"
ON public.admins
FOR DELETE
TO authenticated
USING (public.is_super_admin(auth.uid()) AND user_id != auth.uid());

-- Function to generate unique tracking code
CREATE OR REPLACE FUNCTION public.generate_tracking_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Trigger to auto-generate tracking code
CREATE OR REPLACE FUNCTION public.set_tracking_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.tracking_code IS NULL OR NEW.tracking_code = '' THEN
    NEW.tracking_code := public.generate_tracking_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_tracking_code
BEFORE INSERT ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.set_tracking_code();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for reports
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;

-- Create storage bucket for report photos
INSERT INTO storage.buckets (id, name, public) VALUES ('report-photos', 'report-photos', true);

-- Storage policies for report photos
CREATE POLICY "Anyone can upload report photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'report-photos');

CREATE POLICY "Anyone can view report photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'report-photos');

CREATE POLICY "Admins can delete report photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'report-photos' AND public.is_admin(auth.uid()));