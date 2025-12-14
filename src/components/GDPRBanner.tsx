import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";

const GDPRBanner = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("gdpr-consent");
    if (!consent) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = (level: "all" | "essential") => {
    localStorage.setItem("gdpr-consent", JSON.stringify({ level, date: new Date().toISOString() }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] animate-slide-up">
      <div className="glass-card-strong border-t border-primary/20 p-4 md:p-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 hero-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  {t("gdpr.title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("gdpr.message")}
                </p>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  {showDetails ? "Fshih detajet" : "Shiko detajet"}
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" onClick={() => handleAccept("essential")}>
                {t("gdpr.decline")}
              </Button>
              <Button variant="hero" size="sm" onClick={() => handleAccept("all")}>
                {t("gdpr.accept")}
              </Button>
            </div>
          </div>
          
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-border animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <h4 className="font-semibold mb-1">🔒 Cookies Esenciale</h4>
                  <p className="text-xs text-muted-foreground">Nevojshme për funksionimin bazë të faqes. Nuk mund të çaktivizohen.</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <h4 className="font-semibold mb-1">📊 Cookies Analitike</h4>
                  <p className="text-xs text-muted-foreground">Na ndihmojnë të kuptojmë si përdoret faqja për ta përmirësuar.</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <h4 className="font-semibold mb-1">🎯 Cookies Funksionale</h4>
                  <p className="text-xs text-muted-foreground">Mundësojnë veçori shtesë si ruajtja e gjuhës dhe preferencave.</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs">
                <Link to="/privacy" className="text-primary hover:underline flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {t("gdpr.privacy")}
                </Link>
                <span className="text-muted-foreground">GDPR & CCPA Compliant</span>
                <span className="text-muted-foreground">🇪🇺 EU Standards</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GDPRBanner;
