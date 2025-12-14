import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Image as ImageIcon, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoCaptureProps {
  onPhotoCapture: (file: File) => void;
  currentPhoto: string | null;
  onRemovePhoto: () => void;
}

const PhotoCapture = ({ onPhotoCapture, currentPhoto, onRemovePhoto }: PhotoCaptureProps) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
    setIsCameraReady(false);
    setIsInitializing(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsInitializing(true);
    setIsCameraOpen(true);
    setIsCameraReady(false);

    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Kamera nuk mbështetet në këtë shfletues. Përdorni Chrome ose Firefox.");
      }

      // Request camera permission with multiple fallback options
      let stream: MediaStream | null = null;
      
      const constraints = [
        { video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } } },
        { video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } } },
        { video: { facingMode } },
        { video: true }
      ];

      for (const constraint of constraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          break;
        } catch (e) {
          console.log("Trying next constraint...", e);
        }
      }

      if (!stream) {
        throw new Error("Nuk u arrit të hapej kamera me asnjë konfigurim.");
      }

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current!;
          
          const handleCanPlay = () => {
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('error', handleError);
            resolve();
          };
          
          const handleError = (e: Event) => {
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('error', handleError);
            reject(new Error("Video element error"));
          };
          
          video.addEventListener('canplay', handleCanPlay);
          video.addEventListener('error', handleError);
          
          // Timeout fallback
          setTimeout(() => {
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('error', handleError);
            if (video.readyState >= 3) {
              resolve();
            } else {
              reject(new Error("Timeout duke pritur video"));
            }
          }, 5000);
        });
        
        await videoRef.current.play();
        setIsCameraReady(true);
      }
    } catch (error: any) {
      console.error("Camera error:", error);
      
      let errorMessage = "Nuk mund të hapej kamera.";
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage = "Leja për kamerën u refuzua. Ju lutem lejoni aksesin e kamerës në cilësimet e shfletuesit.";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMessage = "Nuk u gjet asnjë kamerë. Sigurohuni që pajisja juaj ka kamerë.";
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorMessage = "Kamera është në përdorim nga një aplikacion tjetër.";
      } else if (error.name === "OverconstrainedError") {
        errorMessage = "Kamera nuk mbështet konfigurimin e kërkuar.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setCameraError(errorMessage);
      stopCamera();
    } finally {
      setIsInitializing(false);
    }
  }, [facingMode, stopCamera]);

  const switchCamera = useCallback(async () => {
    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacingMode);
    
    if (isCameraOpen) {
      stopCamera();
      setTimeout(() => {
        startCamera();
      }, 100);
    }
  }, [facingMode, isCameraOpen, stopCamera, startCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !isCameraReady) {
      console.error("Video not ready for capture");
      return;
    }

    const video = videoRef.current;
    
    // Create canvas if not exists
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
    }
    
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Could not get canvas context");
      return;
    }

    // Draw the video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { 
            type: "image/jpeg",
            lastModified: Date.now()
          });
          onPhotoCapture(file);
          stopCamera();
        } else {
          console.error("Failed to create blob from canvas");
          setCameraError("Gabim gjatë ruajtjes së fotos. Provoni përsëri.");
        }
      },
      "image/jpeg",
      0.92
    );
  }, [isCameraReady, onPhotoCapture, stopCamera]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onPhotoCapture(file);
    }
    // Reset input so same file can be selected again
    event.target.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Current Photo Preview */}
      {currentPhoto && !isCameraOpen && (
        <div className="relative group animate-scale-in">
          <div className="relative overflow-hidden rounded-xl border border-border/50">
            <img
              src={currentPhoto}
              alt="Foto e ngarkuar"
              className="w-full h-56 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
            onClick={onRemovePhoto}
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-xs text-primary-foreground bg-primary/80 backdrop-blur-sm px-3 py-1.5 rounded-full inline-block">
              ✓ Foto e ngarkuar me sukses
            </p>
          </div>
        </div>
      )}

      {/* Camera View */}
      {isCameraOpen && (
        <div className="relative animate-scale-in">
          <div className="relative overflow-hidden rounded-xl border-2 border-primary/50 bg-muted">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "w-full h-72 object-cover transition-opacity duration-300",
                isCameraReady ? "opacity-100" : "opacity-50"
              )}
            />
            
            {/* Camera overlay effects */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner markers */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary rounded-tr-lg" />
              <div className="absolute bottom-16 left-4 w-8 h-8 border-l-2 border-b-2 border-primary rounded-bl-lg" />
              <div className="absolute bottom-16 right-4 w-8 h-8 border-r-2 border-b-2 border-primary rounded-br-lg" />
              
              {/* Center crosshair */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 border border-primary/50 rounded-full" />
              </div>
            </div>
            
            {/* Loading state */}
            {isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="text-center space-y-3">
                  <RefreshCw className="w-8 h-8 mx-auto text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Duke hapur kamerën...</p>
                </div>
              </div>
            )}
            
            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={stopCamera}
                className="bg-background/50 backdrop-blur-sm border-destructive/50 hover:bg-destructive/20"
              >
                <X className="w-5 h-5 text-destructive" />
              </Button>
              
              <Button
                type="button"
                onClick={capturePhoto}
                disabled={!isCameraReady || isInitializing}
                className={cn(
                  "w-16 h-16 rounded-full hero-gradient shadow-lg transition-all duration-300",
                  isCameraReady ? "animate-pulse-glow hover:scale-105" : "opacity-50"
                )}
              >
                <Camera className="w-7 h-7 text-primary-foreground" />
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={switchCamera}
                disabled={isInitializing}
                className="bg-background/50 backdrop-blur-sm"
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Error */}
      {cameraError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm text-destructive">{cameraError}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startCamera}
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              Provo Përsëri
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!currentPhoto && !isCameraOpen && (
        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          <Button
            type="button"
            variant="outline"
            className="h-14 glass-card hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
            onClick={startCamera}
          >
            <Camera className="w-5 h-5 mr-2 text-primary" />
            <span className="font-medium">Hap Kamerën</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-14 glass-card hover:bg-accent/10 hover:border-accent/50 transition-all duration-300"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-5 h-5 mr-2 text-accent" />
            <span className="font-medium">Ngarko Foto</span>
          </Button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Empty State */}
      {!currentPhoto && !isCameraOpen && !cameraError && (
        <div className="border-2 border-dashed border-border/50 rounded-xl p-10 text-center glass-card animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
            Shtoni një foto të problemit për dokumentim më të saktë dhe zgjidhje më të shpejtë
          </p>
        </div>
      )}
    </div>
  );
};

export default PhotoCapture;