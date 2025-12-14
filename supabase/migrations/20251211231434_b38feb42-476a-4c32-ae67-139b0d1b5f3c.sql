-- Create trigger for auto-generating tracking codes
CREATE TRIGGER set_tracking_code_trigger
BEFORE INSERT ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.set_tracking_code();