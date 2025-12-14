import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import PhotoCapture from "@/components/PhotoCapture";
import LocationPicker from "@/components/LocationPicker";
import SimpleCaptcha from "@/components/SimpleCaptcha";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, MapPin, User, Mail, Phone, CheckCircle } from "lucide-react";

const ReportPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    photoFile: null as File | null,
    photoPreview: null as string | null,
    includeLocation: false,
    latitude: null as number | null,
    longitude: null as number | null,
    neighborhood: null as string | null,
    reporterName: "",
    reporterEmail: "",
    reporterPhone: "",
  });

  const handlePhotoCapture = (file: File) => {
    const preview = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, photoFile: file, photoPreview: preview }));
  };

  const handleRemovePhoto = () => {
    if (form.photoPreview) URL.revokeObjectURL(form.photoPreview);
    setForm((prev) => ({ ...prev, photoFile: null, photoPreview: null }));
  };

  const handleLocationSelect = (lat: number, lng: number, neighborhood: string) => {
    setForm((prev) => ({ ...prev, latitude: lat, longitude: lng, neighborhood }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Ju lutem plotësoni titullin dhe përshkrimin");
      return;
    }
    
    if (!isCaptchaVerified) {
      toast.error("Ju lutem verifikoni që nuk jeni robot");
      return;
    }

    setIsSubmitting(true);
    try {
      let photoUrl = null;

      if (form.photoFile) {
        const fileName = `${Date.now()}-${form.photoFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("report-photos")
          .upload(fileName, form.photoFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("report-photos")
          .getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from("reports")
        .insert([{
          title: form.title.trim(),
          description: form.description.trim(),
          photo_url: photoUrl,
          has_location: form.includeLocation,
          latitude: form.includeLocation ? form.latitude : null,
          longitude: form.includeLocation ? form.longitude : null,
          neighborhood: form.includeLocation ? form.neighborhood : null,
          reporter_name: form.reporterName.trim() || null,
          reporter_email: form.reporterEmail.trim() || null,
          reporter_phone: form.reporterPhone.trim() || null,
          tracking_code: '',
        }])
        .select("tracking_code")
        .single();

      if (error) throw error;

      // Send email notification to admins
      try {
        await supabase.functions.invoke("send-report-notification", {
          body: {
            title: form.title.trim(),
            description: form.description.trim(),
            tracking_code: data.tracking_code,
            neighborhood: form.includeLocation ? form.neighborhood : null,
            has_location: form.includeLocation,
            reporter_name: form.reporterName.trim() || null,
          },
        });
      } catch (notifyError) {
        console.error("Failed to send notification:", notifyError);
        // Don't fail the whole submission if notification fails
      }

      setTrackingCode(data.tracking_code);
      toast.success("Raporti u dërgua me sukses!");
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error("Gabim gjatë dërgimit: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (trackingCode) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-lg">
            <div className="glass-card-strong rounded-2xl p-8 text-center animate-scale-in">
              <div className="w-20 h-20 mx-auto mb-6 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h1 className="font-display text-2xl font-bold mb-2">Raporti u Dërgua!</h1>
              <p className="text-muted-foreground mb-6">Ruani këtë kod për të ndjekur statusin:</p>
              <div className="bg-primary/10 rounded-xl p-4 mb-6">
                <p className="font-mono text-3xl font-bold text-primary tracking-wider">{trackingCode}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => navigate("/track")}>
                  Kërko Raportim
                </Button>
                <Button className="flex-1" onClick={() => { setTrackingCode(null); setForm({ title: "", description: "", photoFile: null, photoPreview: null, includeLocation: false, latitude: null, longitude: null, neighborhood: null, reporterName: "", reporterEmail: "", reporterPhone: "" }); }}>
                  Raport i Ri
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">Raporto Problemin</h1>
            <p className="text-muted-foreground">Ndihmoni komunitetin duke raportuar problemet në lagje</p>
          </div>

          <form onSubmit={handleSubmit} className="glass-card-strong rounded-2xl p-6 md:p-8 space-y-6">
            {/* Title & Description */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titulli *</Label>
                <Input id="title" placeholder="p.sh. Gropë në rrugë" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="description">Përshkrimi *</Label>
                <Textarea id="description" placeholder="Përshkruani problemin në detaje..." value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={4} required />
              </div>
            </div>

            {/* Photo */}
            <div>
              <Label className="mb-2 block">Foto (opsionale)</Label>
              <PhotoCapture onPhotoCapture={handlePhotoCapture} currentPhoto={form.photoPreview} onRemovePhoto={handleRemovePhoto} />
            </div>

            {/* Location */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox id="includeLocation" checked={form.includeLocation} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, includeLocation: !!checked }))} />
                <Label htmlFor="includeLocation" className="flex items-center gap-2 cursor-pointer">
                  <MapPin className="w-4 h-4" />
                  Përfshi vendndodhjen time
                </Label>
              </div>
              {form.includeLocation && (
                <div className="animate-fade-in">
                  <LocationPicker onLocationSelect={handleLocationSelect} />
                  {form.neighborhood && (
                    <p className="mt-2 text-sm text-muted-foreground">Lagja: <span className="font-medium text-foreground">{form.neighborhood}</span></p>
                  )}
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">Informacione kontakti (opsionale)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name"><User className="w-3 h-3 inline mr-1" />Emër Mbiemër</Label>
                  <Input id="name" placeholder="Emri juaj" value={form.reporterName} onChange={(e) => setForm((prev) => ({ ...prev, reporterName: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="phone"><Phone className="w-3 h-3 inline mr-1" />Telefon</Label>
                  <Input id="phone" type="tel" placeholder="+355..." value={form.reporterPhone} onChange={(e) => setForm((prev) => ({ ...prev, reporterPhone: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label htmlFor="email"><Mail className="w-3 h-3 inline mr-1" />Email</Label>
                <Input id="email" type="email" placeholder="email@shembull.com" value={form.reporterEmail} onChange={(e) => setForm((prev) => ({ ...prev, reporterEmail: e.target.value }))} />
              </div>
            </div>

            {/* CAPTCHA */}
            <SimpleCaptcha onVerify={setIsCaptchaVerified} />

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting || !isCaptchaVerified}>
              {isSubmitting ? "Duke dërguar..." : <><Send className="w-5 h-5" />Dërgo Raportin</>}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReportPage;
