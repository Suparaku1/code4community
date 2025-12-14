import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Report } from "@/types/report";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icons based on status
const createCustomIcon = (status: string) => {
  const colors: Record<string, string> = {
    i_ri: "#6366f1", // primary
    ne_proces: "#f59e0b", // warning
    perfunduar: "#10b981", // success
  };
  
  const color = colors[status] || "#6366f1";
  
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

interface ReportsMapProps {
  reports: Report[];
  onReportClick?: (report: Report) => void;
}

const ReportsMap = ({ reports, onReportClick }: ReportsMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Filter reports with location
  const reportsWithLocation = reports.filter(
    (r) => r.has_location && r.latitude && r.longitude
  );

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up previous map instance
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    // Initialize map centered on Elbasan
    mapInstance.current = L.map(mapRef.current).setView([41.1128, 20.0892], 13);

    // Add OpenStreetMap tiles with dark theme
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for reports with location
    reportsWithLocation.forEach((report) => {
      if (!mapInstance.current || !report.latitude || !report.longitude) return;

      const marker = L.marker([report.latitude, report.longitude], {
        icon: createCustomIcon(report.status),
      }).addTo(mapInstance.current);

      const statusLabels: Record<string, string> = {
        i_ri: "I Ri",
        ne_proces: "Në Proces",
        perfunduar: "Përfunduar",
      };

      marker.bindPopup(`
        <div style="min-width: 200px; padding: 8px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${report.title}</div>
          <div style="font-size: 12px; color: #666; margin-bottom: 8px;">${report.description.slice(0, 100)}${report.description.length > 100 ? '...' : ''}</div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-family: monospace; color: #6366f1; font-weight: 600;">${report.tracking_code}</span>
            <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: ${report.status === 'i_ri' ? '#6366f1' : report.status === 'ne_proces' ? '#f59e0b' : '#10b981'}; color: white;">
              ${statusLabels[report.status]}
            </span>
          </div>
          ${report.neighborhood ? `<div style="font-size: 11px; color: #888; margin-top: 8px;">📍 ${report.neighborhood}</div>` : ''}
        </div>
      `);

      marker.on("click", () => {
        if (onReportClick) {
          onReportClick(report);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if there are markers
    if (reportsWithLocation.length > 0) {
      const bounds = L.latLngBounds(
        reportsWithLocation.map((r) => [r.latitude!, r.longitude!])
      );
      mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [reports]);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="h-[500px] w-full rounded-xl border border-border/50 shadow-lg"
        style={{ background: "#1a1a2e" }}
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass-card rounded-lg p-3 z-[1000]">
        <p className="text-xs font-semibold mb-2">Legjenda</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-primary"></span>
            <span>I Ri ({reports.filter(r => r.status === 'i_ri' && r.has_location).length})</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-warning"></span>
            <span>Në Proces ({reports.filter(r => r.status === 'ne_proces' && r.has_location).length})</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-success"></span>
            <span>Përfunduar ({reports.filter(r => r.status === 'perfunduar' && r.has_location).length})</span>
          </div>
        </div>
      </div>
      
      {reportsWithLocation.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl">
          <p className="text-muted-foreground">Asnjë raport me vendndodhje</p>
        </div>
      )}
    </div>
  );
};

export default ReportsMap;
