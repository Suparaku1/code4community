import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getNeighborhoodByCoordinates } from "@/lib/neighborhoods";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, neighborhood: string) => void;
  initialLat?: number;
  initialLng?: number;
  autoDetect?: boolean;
}

const LocationPicker = ({
  onLocationSelect,
  initialLat = 41.1128,
  initialLng = 20.0892,
  autoDetect = true,
}: LocationPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const hasAutoDetected = useRef(false);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Shfletuesi nuk mbështet vendndodhjen");
      return;
    }

    setIsLoading(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMarker(position.coords.latitude, position.coords.longitude);
        setIsLoading(false);
      },
      (error) => {
        console.log("Geolocation error:", error);
        setIsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Leja për vendndodhje u refuzua. Klikoni në hartë për të zgjedhur manualisht.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Vendndodhja nuk është e disponueshme. Klikoni në hartë.");
            break;
          case error.TIMEOUT:
            setLocationError("Kërkesa për vendndodhje skadoi. Klikoni në hartë.");
            break;
          default:
            setLocationError("Gabim i panjohur. Klikoni në hartë.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const setMarker = (lat: number, lng: number) => {
    if (!mapInstance.current) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(
        mapInstance.current
      );

      markerRef.current.on("dragend", () => {
        const position = markerRef.current?.getLatLng();
        if (position) {
          const neighborhood = getNeighborhoodByCoordinates(position.lat, position.lng);
          onLocationSelect(position.lat, position.lng, neighborhood);
        }
      });
    }

    const neighborhood = getNeighborhoodByCoordinates(lat, lng);
    onLocationSelect(lat, lng, neighborhood);
    mapInstance.current.setView([lat, lng], 16);
  };

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize map
    mapInstance.current = L.map(mapRef.current).setView(
      [initialLat, initialLng],
      14
    );

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapInstance.current);

    // Add click handler
    mapInstance.current.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setLocationError(null);
      setMarker(lat, lng);
    });

    // Auto-detect location on mount if enabled
    if (autoDetect && !hasAutoDetected.current) {
      hasAutoDetected.current = true;
      getUserLocation();
    }

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="h-64 w-full rounded-lg border border-border shadow-sm"
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Duke gjetur vendndodhjen...</p>
          </div>
        </div>
      )}
      {locationError && (
        <p className="mt-2 text-xs text-warning">{locationError}</p>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        {!locationError && "Vendndodhja po gjendet automatikisht. Mund të klikoni në hartë ose të tërhiqni markerin."}
      </p>
    </div>
  );
};

export default LocationPicker;
