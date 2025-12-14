import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Accessibility, Sun, Moon, Type, ZoomIn, ZoomOut } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const AccessibilityMenu = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(100);

  useEffect(() => {
    const savedContrast = localStorage.getItem("high-contrast");
    const savedFontSize = localStorage.getItem("font-size");
    if (savedContrast === "true") {
      setHighContrast(true);
      document.documentElement.classList.add("high-contrast");
    }
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
      document.documentElement.style.fontSize = `${savedFontSize}%`;
    }
  }, []);

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem("high-contrast", String(newValue));
    document.documentElement.classList.toggle("high-contrast", newValue);
  };

  const adjustFontSize = (delta: number) => {
    const newSize = Math.min(150, Math.max(80, fontSize + delta));
    setFontSize(newSize);
    localStorage.setItem("font-size", String(newSize));
    document.documentElement.style.fontSize = `${newSize}%`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full w-12 h-12 shadow-lg bg-background/90 backdrop-blur-sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Accessibility options"
        aria-expanded={isOpen}
      >
        <Accessibility className="w-5 h-5" />
      </Button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 glass-card-strong rounded-xl p-4 w-64 animate-scale-in">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Accessibility className="w-4 h-4 text-primary" />
            Accessibility
          </h3>
          
          <div className="space-y-3">
            {/* High Contrast */}
            <button
              onClick={toggleHighContrast}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              aria-pressed={highContrast}
            >
              <span className="flex items-center gap-2 text-sm">
                {highContrast ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {t("a11y.contrast")}
              </span>
              <span className={`w-10 h-5 rounded-full transition-colors ${highContrast ? "bg-primary" : "bg-secondary"} relative`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${highContrast ? "translate-x-5" : "translate-x-0.5"}`} />
              </span>
            </button>

            {/* Font Size */}
            <div className="p-2">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-sm">
                  <Type className="w-4 h-4" />
                  Madhësia e tekstit
                </span>
                <span className="text-xs text-muted-foreground">{fontSize}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustFontSize(-10)}
                  disabled={fontSize <= 80}
                  aria-label="Decrease font size"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${((fontSize - 80) / 70) * 100}%` }}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustFontSize(10)}
                  disabled={fontSize >= 150}
                  aria-label="Increase font size"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Keyboard Nav Hint */}
            <div className="p-2 bg-secondary/30 rounded-lg text-xs text-muted-foreground">
              <p>⌨️ Përdorni <kbd className="px-1 py-0.5 bg-background rounded">Tab</kbd> për navigim me tastierë</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityMenu;
