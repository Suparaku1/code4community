import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, FileJson, FileSpreadsheet, Search, Shield } from "lucide-react";

interface ExportableReport {
  id: string;
  title: string;
  description: string;
  status: string;
  neighborhood: string | null;
  created_at: string;
  updated_at: string;
  tracking_code: string;
}

const DataExport = () => {
  const [trackingCode, setTrackingCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [foundReport, setFoundReport] = useState<ExportableReport | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!trackingCode.trim()) {
      toast.error("Ju lutem vendosni kodin e gjurmimit");
      return;
    }

    setIsSearching(true);
    setNotFound(false);
    setFoundReport(null);

    // Use the public function to get only non-sensitive data
    const { data, error } = await supabase
      .rpc("get_public_reports")
      .eq("tracking_code", trackingCode.trim().toUpperCase())
      .maybeSingle();

    if (error) {
      console.error("Search error:", error);
      toast.error("Gabim gjatë kërkimit");
    } else if (data) {
      setFoundReport({
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status,
        neighborhood: data.neighborhood,
        created_at: data.created_at,
        updated_at: data.updated_at,
        tracking_code: data.tracking_code,
      });
    } else {
      setNotFound(true);
    }

    setIsSearching(false);
  };

  const exportAsJSON = () => {
    if (!foundReport) return;
    
    const exportData = {
      export_date: new Date().toISOString(),
      gdpr_notice: "Ky eksport përmban vetëm të dhënat publike të raportit tuaj sipas GDPR.",
      report: foundReport,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `raport-${foundReport.tracking_code}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Eksportimi JSON u krye me sukses!");
  };

  const exportAsCSV = () => {
    if (!foundReport) return;

    const headers = ["ID", "Kodi", "Titulli", "Përshkrimi", "Statusi", "Lagja", "Krijuar", "Përditësuar"];
    const values = [
      foundReport.id,
      foundReport.tracking_code,
      `"${foundReport.title.replace(/"/g, '""')}"`,
      `"${foundReport.description.replace(/"/g, '""')}"`,
      foundReport.status,
      foundReport.neighborhood || "",
      foundReport.created_at,
      foundReport.updated_at,
    ];

    const csvContent = [headers.join(","), values.join(",")].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `raport-${foundReport.tracking_code}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Eksportimi CSV u krye me sukses!");
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "i_ri": return "I Ri";
      case "ne_proces": return "Në Proces";
      case "perfunduar": return "I Përfunduar";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Eksporto të Dhënat (GDPR)</h3>
          <p className="text-sm text-muted-foreground">Shkarkoni raportin tuaj në format JSON ose CSV</p>
        </div>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="export-code">Kodi i Gjurmimit</Label>
        <div className="flex gap-2">
          <Input
            id="export-code"
            placeholder="p.sh. ABC12345"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="font-mono"
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            <Search className="w-4 h-4 mr-2" />
            {isSearching ? "Duke kërkuar..." : "Kërko"}
          </Button>
        </div>
      </div>

      {/* Not Found */}
      {notFound && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
          <p className="text-destructive">Raporti me këtë kod nuk u gjet.</p>
        </div>
      )}

      {/* Found Report */}
      {foundReport && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass-card p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground">Kodi: {foundReport.tracking_code}</p>
                <h4 className="font-semibold">{foundReport.title}</h4>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                foundReport.status === "perfunduar" ? "bg-success/20 text-success" :
                foundReport.status === "ne_proces" ? "bg-warning/20 text-warning" :
                "bg-primary/20 text-primary"
              }`}>
                {getStatusText(foundReport.status)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{foundReport.description}</p>
            {foundReport.neighborhood && (
              <p className="text-xs text-muted-foreground">Lagja: {foundReport.neighborhood}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={exportAsJSON} variant="outline" className="flex-1">
              <FileJson className="w-4 h-4 mr-2" />
              Eksporto JSON
            </Button>
            <Button onClick={exportAsCSV} variant="outline" className="flex-1">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Eksporto CSV
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Sipas GDPR, keni të drejtë të shkarkoni të dhënat tuaja. Ky eksport përmban vetëm 
        informacionin publik të raportit dhe nuk përfshin të dhëna personale.
      </p>
    </div>
  );
};

export default DataExport;
